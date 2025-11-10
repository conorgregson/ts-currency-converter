/**
 * currency.ts — domain types + validators for currency data
 *
 * Purpose:
 *  - Brand primitive strings as domain-specific types (CurrencyCode, NonEmptyString)
 *  - Define API response shapes used by the Frankfurter client
 *  - Provide runtime type guards to validate unknown payloads
 *
 * Notes:
 *  - `asCurrencyCode` is a *branding* function, not strict validation.
 *    It preserves your current behavior (no format enforcement).
 *    If you later want stricter checks (e.g., /^[A-Z]{3}$/), add them there.
 */
/**
 * Brand a raw string as CurrencyCode.
 * Current behavior: minimal checks to keep flow simple.
 * (Throws only if falsy/non-string.)
 */
export function asCurrencyCode(rawCode) {
    if (!rawCode || typeof rawCode !== "string")
        throw new Error("Invalid code");
    const ISO3 = /^[A-Z]{3}$/; // enforce 3 uppercase letters (e.g., USD, EUR)
    if (!ISO3.test(rawCode))
        throw new Error("Invalid code");
    return rawCode;
}
// --- Type guards ---
/**
 * Runtime validator for CurrenciesResponse.
 * Ensures an object where every value is a string.
 */
export function isCurrenciesResponse(data) {
    if (typeof data !== "object" || data === null)
        return false;
    for (const [key, label] of Object.entries(data)) {
        if (typeof key !== "string" || typeof label !== "string")
            return false;
    }
    return true;
}
/**
 * Runtime validator for ConvertResponse.
 * Checks amount/base/date types and that `rates` is a { string: number } map.
 */
export function isConvertResponse(data) {
    if (typeof data !== "object" || data === null)
        return false;
    const response = data;
    if (typeof response.amount !== "number")
        return false;
    if (typeof response.base !== "string")
        return false;
    if (typeof response.date !== "string")
        return false;
    if (typeof response.rates !== "object" || response.rates === null)
        return false;
    for (const rateValue of Object.values(response.rates)) {
        if (typeof rateValue !== "number")
            return false;
    }
    return true;
}
//# sourceMappingURL=currency.js.map