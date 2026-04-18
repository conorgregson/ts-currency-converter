export function asCurrencyCode(rawCode) {
    if (!rawCode || typeof rawCode !== "string")
        throw new Error("Invalid code");
    const ISO3 = /^[A-Z]{3}$/;
    if (!ISO3.test(rawCode))
        throw new Error("Invalid code");
    return rawCode;
}
export function isCurrenciesResponse(data) {
    if (typeof data !== "object" || data === null)
        return false;
    for (const [key, label] of Object.entries(data)) {
        if (typeof key !== "string" || typeof label !== "string")
            return false;
    }
    return true;
}
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
    if (typeof response.rates !== "object" || response.rates === null) {
        return false;
    }
    for (const rateValue of Object.values(response.rates)) {
        if (typeof rateValue !== "number")
            return false;
    }
    return true;
}
//# sourceMappingURL=currency.js.map