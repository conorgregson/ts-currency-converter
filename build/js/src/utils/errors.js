/**
 * errors.ts — standardized application error factory
 *
 * Purpose:
 *  Defines a unified AppError type for consistent error handling across services.
 *  Each variant represents a common failure category (network, timeout, API, etc.).
 *  The `error` factory provides helper functions to create properly typed errors.
 *
 * Usage example:
 *  try {
 *    const response = await fetch(url);
 *    if (!response.ok) throw error.http(response.status);
 *  } catch (err) {
 *    return err instanceof TimeoutError
 *      ? error.timeout(5000)
 *      : error.network("Failed to reach server", err);
 *  }
 */
// --- Error factory helpers ---
/**
 * Factory object providing convenience methods for each error type.
 * Each method returns a strongly typed AppError variant.
 */
export const error = {
    /** Network connection or fetch failure. */
    network: (message = "Network error", details) => ({
        kind: "Network",
        message,
        details,
    }),
    /** Operation exceeded its timeout limit. */
    timeout: (timeoutMs, message = "Request timed out", details) => ({
        kind: "Timeout",
        message,
        timeoutMs,
        details,
    }),
    /** HTTP-level error (e.g., 404, 500). */
    http: (status, message = `HTTP ${status}`, details) => ({
        kind: "Http",
        status,
        message,
        details,
    }),
    /** Application-level API error (e.g., server returned an error object). */
    api: (message, details) => ({
        kind: "Api",
        message,
        details,
    }),
    /** Parsing or serialization failure (e.g., invalid JSON). */
    parse: (message, details) => ({
        kind: "Parse",
        message,
        details,
    }),
    /** Input validation error (e.g., bad user data or schema mismatch). */
    validation: (message, details) => ({
        kind: "Validation",
        message,
        details,
    }),
    /** Fallback for uncategorized or unexpected errors. */
    unknown: (message = "Unknown error", details) => ({
        kind: "Unknown",
        message,
        details,
    }),
};
//# sourceMappingURL=errors.js.map