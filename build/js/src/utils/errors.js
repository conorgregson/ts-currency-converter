export const error = {
    network: (message = "Network error", details) => ({
        kind: "Network",
        message,
        details,
    }),
    timeout: (timeoutMs, message = "Request timed out", details) => ({
        kind: "Timeout",
        message,
        timeoutMs,
        details,
    }),
    http: (status, message = `HTTP ${status}`, details) => ({
        kind: "Http",
        status,
        message,
        details,
    }),
    api: (message, details) => ({
        kind: "Api",
        message,
        details,
    }),
    parse: (message, details) => ({
        kind: "Parse",
        message,
        details,
    }),
    validation: (message, details) => ({
        kind: "Validation",
        message,
        details,
    }),
    unknown: (message = "Unknown error", details) => ({
        kind: "Unknown",
        message,
        details,
    }),
};
//# sourceMappingURL=errors.js.map