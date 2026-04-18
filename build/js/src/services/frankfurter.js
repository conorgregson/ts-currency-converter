import { fetchJSON } from "../utils/http";
import { ok, err } from "../utils/result";
import { error } from "../utils/errors";
import { isCurrenciesResponse, isConvertResponse, asCurrencyCode, } from "../domain/currency";
import { getCache, setCache } from "../utils/cache";
import { CONFIG } from "../config";
function isApiErrorShape(data) {
    return (typeof data === "object" &&
        data !== null &&
        typeof data.error === "string");
}
function pickApiErrorMessage(payload) {
    return isApiErrorShape(payload) ? payload.error : null;
}
const CURRENCY_CACHE_KEY = "currencies";
export async function fetchCurrencies() {
    if (CONFIG.USE_CACHE) {
        const cached = getCache(CURRENCY_CACHE_KEY);
        if (cached)
            return ok(cached);
    }
    const url = `${CONFIG.API_BASE}/currencies`;
    const response = await fetchJSON(url, {
        timeoutMs: CONFIG.TIMEOUT_MS,
    });
    if (!response.ok)
        return response;
    const apiError = pickApiErrorMessage(response.data);
    if (apiError)
        return err(error.api(apiError));
    if (!isCurrenciesResponse(response.data)) {
        return err(error.parse("Unexpected /currencies response shape", {
            payload: response.data,
        }));
    }
    if (CONFIG.USE_CACHE) {
        setCache(CURRENCY_CACHE_KEY, response.data, CONFIG.CACHE_TTL_MS);
    }
    return ok(response.data);
}
export async function convertAmount(amount, fromCodeRaw, toCodeRaw) {
    let fromCode, toCode;
    try {
        fromCode = asCurrencyCode(fromCodeRaw);
        toCode = asCurrencyCode(toCodeRaw);
    }
    catch {
        return err(error.validation("Invalid currency code(s)", {
            from: fromCodeRaw,
            to: toCodeRaw,
        }));
    }
    const url = new URL(`${CONFIG.API_BASE}/latest`);
    url.searchParams.set("amount", String(amount));
    url.searchParams.set("from", fromCode);
    url.searchParams.set("to", toCode);
    const response = await fetchJSON(url.toString(), {
        timeoutMs: CONFIG.TIMEOUT_MS,
    });
    if (!response.ok)
        return response;
    const apiError = pickApiErrorMessage(response.data);
    if (apiError)
        return err(error.api(apiError));
    if (!isConvertResponse(response.data)) {
        return err(error.parse("Unexpected /latest convert response shape", {
            payload: response.data,
        }));
    }
    return ok(response.data);
}
//# sourceMappingURL=frankfurter.js.map