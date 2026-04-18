export const selectOne = (selector, root = document) => root.querySelector(selector);
export const selectOneStrict = (selector, root = document) => {
    const element = root.querySelector(selector);
    if (!element)
        throw new Error(`Element not found: ${selector}`);
    return element;
};
export function setText(element, text) {
    element.textContent = text;
}
export function makeOption(code, label) {
    const optionEl = document.createElement("option");
    optionEl.value = code;
    optionEl.textContent = `${code} - ${label}`;
    return optionEl;
}
export function renderCurrencyOptions(selectEl, currencies) {
    const fragment = document.createDocumentFragment();
    const entries = Object.entries(currencies).sort(([a], [b]) => a.localeCompare(b));
    for (const [code, label] of entries) {
        fragment.appendChild(makeOption(code, label));
    }
    selectEl.replaceChildren(fragment);
}
export function selectValue(selectEl, code) {
    const index = Array.from(selectEl.options).findIndex((optionEl) => optionEl.value === code);
    if (index >= 0) {
        selectEl.selectedIndex = index;
        return true;
    }
    return false;
}
export function showError(target, message) {
    target.textContent = message;
    target.classList.add("inline-error");
}
export function clearStatus(target) {
    target.textContent = "";
    target.classList.remove("inline-error");
}
export function buttonToast(buttonEl, label = "Done!", ms = 800) {
    const previousText = buttonEl.textContent ?? "";
    const wasDisabled = buttonEl.disabled;
    buttonEl.disabled = true;
    buttonEl.textContent = label;
    window.setTimeout(() => {
        buttonEl.textContent = previousText;
        buttonEl.disabled = wasDisabled;
    }, ms);
}
export function setStatusChip(statusEl, kind, text) {
    statusEl.classList.add("status");
    statusEl.setAttribute("data-status", kind);
    statusEl.textContent = text;
    statusEl.setAttribute("role", "status");
    statusEl.setAttribute("aria-live", "polite");
}
export function clearStatusChip(statusEl) {
    statusEl.textContent = "";
    statusEl.removeAttribute("data-status");
}
export function setResultOutput(outputEl, amount, fromCode, toCode, converted) {
    outputEl.classList.add("result-output");
    outputEl.value = `${amount} ${fromCode} → ${converted.toLocaleString(undefined, {
        maximumFractionDigits: 6,
    })} ${toCode}`;
}
export function setButtonLoading(buttonEl, loading) {
    buttonEl.classList.toggle("is-loading", loading);
    buttonEl.setAttribute("aria-busy", loading ? "true" : "false");
    buttonEl.disabled = loading;
}
//# sourceMappingURL=render.js.map