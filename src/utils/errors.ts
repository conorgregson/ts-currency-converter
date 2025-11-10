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

// --- Error type definition ---

/**
 * Discriminated union of all supported error categories.
 * Each variant includes a human-readable message and optional details
 * for debugging or telemetry (stack traces, response bodies, etc.).
 */
export type AppError =
  | { kind: "Network"; message: string; details?: unknown }
  | { kind: "Timeout"; message: string; timeoutMs: number; details?: unknown }
  | { kind: "Http"; message: string; status: number; details?: unknown }
  | { kind: "Api"; message: string; details?: unknown }
  | { kind: "Parse"; message: string; details?: unknown }
  | { kind: "Validation"; message: string; details?: unknown }
  | { kind: "Unknown"; message: string; details?: unknown };

// --- Error factory helpers ---

/**
 * Factory object providing convenience methods for each error type.
 * Each method returns a strongly typed AppError variant.
 */
export const error = {
  /** Network connection or fetch failure. */
  network: (message = "Network error", details?: unknown): AppError => ({
    kind: "Network",
    message,
    details,
  }),

  /** Operation exceeded its timeout limit. */
  timeout: (
    timeoutMs: number,
    message = "Request timed out",
    details?: unknown
  ): AppError => ({
    kind: "Timeout",
    message,
    timeoutMs,
    details,
  }),

  /** HTTP-level error (e.g., 404, 500). */
  http: (
    status: number,
    message = `HTTP ${status}`,
    details?: unknown
  ): AppError => ({
    kind: "Http",
    status,
    message,
    details,
  }),

  /** Application-level API error (e.g., server returned an error object). */
  api: (message: string, details?: unknown): AppError => ({
    kind: "Api",
    message,
    details,
  }),

  /** Parsing or serialization failure (e.g., invalid JSON). */
  parse: (message: string, details?: unknown): AppError => ({
    kind: "Parse",
    message,
    details,
  }),

  /** Input validation error (e.g., bad user data or schema mismatch). */
  validation: (message: string, details?: unknown): AppError => ({
    kind: "Validation",
    message,
    details,
  }),

  /** Fallback for uncategorized or unexpected errors. */
  unknown: (message = "Unknown error", details?: unknown): AppError => ({
    kind: "Unknown",
    message,
    details,
  }),
};
