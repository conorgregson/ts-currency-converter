/**
 * http.ts — tiny JSON fetcher with timeout + retries + typed errors
 *
 * Purpose:
 *  - Perform HTTP requests that are resilient to transient failures.
 *  - Adds per-request timeout, exponential backoff with jitter, and retry-on-safe-status.
 *  - Ensures responses are JSON (by content-type) and returns a typed Result<T, AppError>.
 *
 * Usage:
 *  const response = await fetchJSON<MyDto>("https://api.example.com/data", {
 *    timeoutMs: 5000,
 *    retry: { retries: 3, baseDelayMs: 300, maxDelayMs: 5000 },
 *    headers: { Authorization: `Bearer ${token}` },
 *  });
 *  if (isOk(response)) { render(response.data); } else { showError(response.error); }
 */

import { err, ok, Result } from "./result.js";
import { AppError, error } from "./errors.js";

// --- Retry policy ---

/**
 * Retry configuration controlling how often and how quickly we retry.
 * - retries:   maximum retry attempts (not counting the first try)
 * - baseDelayMs: initial backoff delay (will double each attempt)
 * - maxDelayMs:  hard cap on backoff delay
 */
export type RetryPolicy = {
  retries: number;
  baseDelayMs: number;
  maxDelayMs: number;
};

/** Sensible defaults for most network-bound GETs. */
const defaultRetry: RetryPolicy = {
  retries: 2,
  baseDelayMs: 250,
  maxDelayMs: 4000,
};

// --- Helpers ---

/** Promise-based sleep utility for backoff waits. */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Exponential backoff with a small random jitter to avoid thundering herds.
 * attempt: 0-based attempt counter (0 → base, 1 → 2x, 2 → 4x, ...)
 */
function exponentialBackoff(attempt: number, base: number, cap: number) {
  const raw = base * 2 ** attempt;
  const jitter = Math.random() * 100; // 0–100ms jitter
  return Math.min(cap, raw + jitter);
}

/**
 * Returns true if the HTTP status is worth retrying:
 * - 408 Request Timeout
 * - 429 Too Many Requests
 * - 5xx Server errors
 */
function shouldRetryStatus(status: number): boolean {
  return status === 408 || status === 429 || (status >= 500 && status <= 599);
}

// --- Public API ---

/**
 * Fetches JSON from a URL with timeout and retry support.
 *
 * Contract:
 *  - Enforces Accept: application/json
 *  - Validates response content-type includes "application/json"
 *  - Returns Err(Parse) if content-type is not JSON or body is invalid JSON
 *  - Returns Err(Http) when response.ok is false (4xx/5xx), with optional message snippet
 *  - Maps AbortError to Err(Timeout) and other fetch errors to Err(Network)
 *  - Retries on 408/429/5xx (up to `retry.retries`) with exponential backoff
 *  - Treats 204 No Content as `ok(undefined as T)` (useful for DELETE)
 *
 * @param url     Target URL
 * @param options Optional per-request overrides:
 *                  - timeoutMs: number (default 4000)
 *                  - retry: RetryPolicy
 *                  - headers: Record<string, string>
 */
export async function fetchJSON<T>(
  url: string,
  options?: {
    timeoutMs?: number;
    retry?: RetryPolicy;
    headers?: Record<string, string>;
  }
): Promise<Result<T, AppError>> {
  const timeoutMs = options?.timeoutMs ?? 4000;
  const retry = options?.retry ?? defaultRetry;
  const headers = { Accept: "application/json", ...options?.headers };

  let attempt = 0;

  // Retry loop (first pass + up to retry.retries attempts)
  while (true) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Note: This is a GET-only helper; extend with method/body if needed.
      const response = await fetch(url, { headers, signal: controller.signal });

      clearTimeout(timeoutId);

      // Non-2xx/3xx → map to Http error (with small body snippet for context)
      if (!response.ok) {
        const status = response.status;
        let apiMessage: string | undefined;
        let httpMessage: string | undefined;

        // Prefer JSON error payloads like { error: "…" }
        try {
          const contentType = response.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const body = await response.json().catch(() => null);
            if (body && typeof body === "object" && "error" in body) {
              const msg = (body as { error?: unknown }).error;
              if (typeof msg === "string") apiMessage = msg;
            }
          }
        } catch {
          /* ignore */
        }

        // Fallback: plain text snippet for Http errors
        if (!apiMessage) {
          try {
            const text = await response.text();
            if (text) httpMessage = text.slice(0, 200);
          } catch {
            /* ignore */
          }
        }

        const httpError = error.http(status, httpMessage);

        if (shouldRetryStatus(status) && attempt < retry.retries) {
          const delay = exponentialBackoff(
            attempt,
            retry.baseDelayMs,
            retry.maxDelayMs
          );
          attempt++;
          await sleep(delay);
          continue;
        }

        // If API gave { error: "…" }, return Api; otherwise Http
        return apiMessage ? err(error.api(apiMessage)) : err(httpError);
      }

      // 204 No Content → return undefined payload
      if (response.status === 204) {
        return ok(undefined as unknown as T);
      }

      // Guard: ensure response is JSON
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        return err(error.parse("Expected JSON response", { contentType }));
      }

      // Parse JSON body
      try {
        const data = (await response.json()) as unknown as T;
        return ok(data);
      } catch (parseError) {
        return err(
          error.parse("Invalid JSON in response", { cause: parseError })
        );
      }
    } catch (errorObject) {
      clearTimeout(timeoutId);

      // Map AbortError → Timeout; everything else → Network
      const isAbort =
        (errorObject instanceof DOMException &&
          errorObject.name === "AbortError") ||
        (errorObject as Error)?.name === "AbortError";

      const baseError = isAbort
        ? error.timeout(timeoutMs)
        : error.network((errorObject as Error)?.message ?? "Network");

      // Retry on network/timeout if attempts remain
      if (attempt < retry.retries) {
        const delay = exponentialBackoff(
          attempt,
          retry.baseDelayMs,
          retry.maxDelayMs
        );
        attempt++;
        await sleep(delay);
        continue;
      }
      return err(baseError);
    }
  }
}
