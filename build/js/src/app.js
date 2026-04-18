import { fetchCurrencies, convertAmount } from "./services/frankfurter";
import { selectOne, selectOneStrict, renderCurrencyOptions, selectValue, setStatusChip, clearStatusChip, setResultOutput, setButtonLoading, showError, } from "./ui/render";
import { initDebugPanel } from "./ui/debug-panel";
import { logger } from "./utils/logger";
import { CONFIG } from "./config";
function formatError(e) {
    switch (e.kind) {
        case "Timeout":
            return `Timed out after ${e.timeoutMs}ms. Please try again.`;
        case "Network":
            return "Network error. Check your connection.";
        case "Http":
            return `Server error (HTTP ${e.status}).`;
        case "Api":
            return `API error: ${e.message}`;
        case "Parse":
            return "Bad response from server.";
        case "Validation":
            return `Validation error: ${e.message}`;
        default:
            return "Something went wrong.";
    }
}
/**
 * Measures and logs the duration of an async operation.
 */
async function timed(name, operation) {
    const start = performance.now();
    try {
        const value = await operation();
        logger.info(name, { durationMs: Math.round(performance.now() - start) });
        return value;
    }
    catch (err) {
        const durationMs = Math.round(performance.now() - start);
        const kind = typeof err === "object" && err && "kind" in err
            ? String(err.kind)
            : "Unknown";
        logger.error(name, { error: kind, context: { durationMs } });
        throw err;
    }
}
export async function initApp() {
    const amountEl = selectOneStrict("#amount");
    const fromEl = selectOneStrict("#from");
    const toEl = selectOneStrict("#to");
    const formEl = selectOneStrict("#convert-form");
    const swapBtn = selectOneStrict("#swap-btn");
    const resultEl = selectOneStrict("#result");
    const statusEl = selectOneStrict("#status");
    const copyBtn = selectOneStrict("#copy-btn");
    const ratePreviewEl = selectOne("#rate-preview");
    const state = {
        amount: Number(amountEl.value) || 0,
        from: "USD",
        to: "EUR",
        isBusy: false,
    };
    async function bootCurrencies() {
        setStatusChip(statusEl, "info", "Loading currencies…");
        const response = await timed("services:fetchCurrencies", () => fetchCurrencies());
        if (!response.ok) {
            if (CONFIG.LOG_ERRORS)
                logger.error("ui:currencies", { error: response.error.kind });
            setStatusChip(statusEl, "error", formatError(response.error));
            return;
        }
        renderCurrencyOptions(fromEl, response.data);
        renderCurrencyOptions(toEl, response.data);
        selectValue(fromEl, state.from);
        selectValue(toEl, state.to);
        clearStatusChip(statusEl);
    }
    async function updateRatePreview() {
        if (ratePreviewEl)
            setStatusChip(statusEl, "info", "Updating preview…");
        const unit = await timed("services:convert:unit", () => convertAmount(1, fromEl.value, toEl.value));
        if (!unit.ok) {
            if (ratePreviewEl)
                ratePreviewEl.textContent = "";
            if (CONFIG.LOG_ERRORS)
                logger.warn("ui:unitRate", { error: unit.error.kind });
            clearStatusChip(statusEl);
            return;
        }
        const rate = unit.data.rates[toEl.value];
        if (ratePreviewEl && typeof rate === "number") {
            ratePreviewEl.textContent = `1 ${fromEl.value} = ${rate} ${toEl.value}`;
        }
        clearStatusChip(statusEl);
    }
    async function runConvert() {
        const amount = Number(amountEl.value);
        if (!Number.isFinite(amount) || amount < 0) {
            showError(statusEl, "Enter a non-negative numeric amount.");
            resultEl.value = "";
            return;
        }
        state.amount = amount;
        state.from = fromEl.value;
        state.to = toEl.value;
        state.isBusy = true;
        setButtonLoading(swapBtn, true);
        setStatusChip(statusEl, "info", "Converting…");
        resultEl.value = "";
        const response = await timed("services:convert", () => convertAmount(state.amount, state.from, state.to));
        state.isBusy = false;
        setButtonLoading(swapBtn, false);
        if (!response.ok) {
            setStatusChip(statusEl, "error", formatError(response.error));
            return;
        }
        const { base, date, rates } = response.data;
        const out = rates[state.to];
        if (typeof out !== "number") {
            setStatusChip(statusEl, "error", "Conversion failed: missing rate for selected currency.");
            return;
        }
        setResultOutput(resultEl, state.amount, base, state.to, out);
        setStatusChip(statusEl, "success", `Rate date: ${date}`);
        void updateRatePreview();
    }
    function swap() {
        const a = fromEl.value;
        const b = toEl.value;
        selectValue(fromEl, b);
        selectValue(toEl, a);
        resultEl.value = "";
        setStatusChip(statusEl, "info", "Currencies swapped. Ready to convert.");
        void updateRatePreview();
    }
    formEl.addEventListener("submit", (event) => {
        event.preventDefault();
        void runConvert();
    });
    swapBtn.addEventListener("click", swap);
    fromEl.addEventListener("change", () => {
        resultEl.value = "";
        setStatusChip(statusEl, "info", "Ready to convert.");
        void updateRatePreview();
    });
    toEl.addEventListener("change", () => {
        resultEl.value = "";
        setStatusChip(statusEl, "info", "Ready to convert.");
        void updateRatePreview();
    });
    copyBtn.addEventListener("click", async () => {
        const text = (resultEl.value ?? "").trim();
        if (!text)
            return;
        try {
            await navigator.clipboard.writeText(text);
            // Optional: buttonToast(copyBtn, "Copied!", 800);
        }
        catch {
            const selection = window.getSelection();
            if (!selection)
                return;
            selection.removeAllRanges();
            const range = document.createRange();
            range.selectNodeContents(resultEl);
            selection.addRange(range);
        }
    });
    window.addEventListener("keydown", (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            amountEl.focus();
            amountEl.select();
            return;
        }
        if (event.shiftKey && event.key.toLowerCase() === "s") {
            event.preventDefault();
            swap();
            return;
        }
    });
    await bootCurrencies();
    await updateRatePreview();
    if (CONFIG.DEBUG_PANEL)
        initDebugPanel();
}
//# sourceMappingURL=app.js.map