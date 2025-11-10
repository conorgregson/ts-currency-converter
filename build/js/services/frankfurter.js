/**
 * frankfurter.ts — typed client for the Frankfurter currency API
 *
 * Endpoints:
 *  - GET /currencies → map of currency codes to names
 *  - GET /latest?amount=<n>&from=<ISO>&to=<ISO> → conversion result
 *
 * Guarantees:
 *  - Network/HTTP/timeout errors are mapped to AppError via fetchJSON()
 *  - API-level errors (payload like { error: string }) become AppError.Api
 *  - Successful responses are shape-validated before returning Ok<T>
 *  - Optional caching for /currencies controlled via CONFIG.USE_CACHE
 */
import { fetchJSON } from "../utils/http.js";
import { ok, err } from "../utils/result.js";
import { error } from "../utils/errors.js";
import { isCurrenciesResponse, isConvertResponse, asCurrencyCode, } from "../domain/currency.js";
import { getCache, setCache } from "../utils/cache.js";
import { CONFIG } from "../config.js";
/** Type guard for Frankfurter error payloads. */
function isApiErrorShape(data) {
    return (typeof data === "object" &&
        data !== null &&
        typeof data.error === "string");
}
/** Extracts the API error message if present, otherwise null. */
function pickApiErrorMessage(payload) {
    return isApiErrorShape(payload) ? payload.error : null;
}
/** Cache key for the currencies map. */
const CURRENCY_CACHE_KEY = "currencies";
/**
 * GET /currencies
 * Returns a mapping like: { "USD": "United States Dollar", ... }
 *
 * Flow:
 *  1) Try cache (if enabled)
 *  2) Fetch with timeout/retries via fetchJSON()
 *  3) Check for API-level error { error: string }
 *  4) Validate response shape
 *  5) Save to cache (if enabled)
 */
export async function fetchCurrencies() {
    // 1) Cache (optional)
    if (CONFIG.USE_CACHE) {
        const cached = getCache(CURRENCY_CACHE_KEY);
        if (cached)
            return ok(cached);
    }
    // 2) Fetch
    const url = `${CONFIG.API_BASE}/currencies`;
    const response = await fetchJSON(url, {
        timeoutMs: CONFIG.TIMEOUT_MS,
    });
    if (!response.ok)
        return response; // Network/HTTP/Timeout already mapped
    // 3) API-level error?
    const apiError = pickApiErrorMessage(response.data);
    if (apiError)
        return err(error.api(apiError));
    // 4) Shape validation
    if (!isCurrenciesResponse(response.data)) {
        return err(error.parse("Unexpected /currencies response shape", {
            payload: response.data,
        }));
    }
    // 5) Cache (optional)
    if (CONFIG.USE_CACHE) {
        setCache(CURRENCY_CACHE_KEY, response.data, CONFIG.CACHE_TTL_MS);
    }
    return ok(response.data);
}
/**
 * GET /latest?amount=<n>&from=<ISO>&to=<ISO>
 * Convert an amount from one currency to another.
 *
 * Flow:
 *  1) Validate/brand the currency codes
 *  2) Build URL with query params
 *  3) Fetch with timeout/retries via fetchJSON()
 *  4) Check for API-level error { error: string }
 *  5) Validate response shape
 */
export async function convertAmount(amount, fromCodeRaw, toCodeRaw) {
    // 1) Validate & brand currency codes (throws on invalid)
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
    // 2) Build URL
    const url = new URL(`${CONFIG.API_BASE}/latest`);
    url.searchParams.set("amount", String(amount));
    url.searchParams.set("from", fromCode);
    url.searchParams.set("to", toCode);
    // 3) Fetch
    const response = await fetchJSON(url.toString(), {
        timeoutMs: CONFIG.TIMEOUT_MS,
    });
    if (!response.ok)
        return response; // Error already typed
    // 4) API-level error?
    const apiError = pickApiErrorMessage(response.data);
    if (apiError)
        return err(error.api(apiError));
    // 5) Shape validation
    if (!isConvertResponse(response.data)) {
        return err(error.parse("Unexpected /latest convert response shape", {
            payload: response.data,
        }));
    }
    return ok(response.data);
}
//# sourceMappingURL=frankfurter.js.map