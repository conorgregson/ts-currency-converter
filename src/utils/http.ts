import { err, ok, Result } from "./result";
import { AppError, error } from "./errors";

export type RetryPolicy = {
  retries: number;
  baseDelayMs: number;
  maxDelayMs: number;
};

const defaultRetry: RetryPolicy = {
  retries: 2,
  baseDelayMs: 250,
  maxDelayMs: 4000,
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function exponentialBackoff(attempt: number, base: number, cap: number) {
  const raw = base * 2 ** attempt;
  const jitter = Math.random() * 100;
  return Math.min(cap, raw + jitter);
}

function shouldRetryStatus(status: number): boolean {
  return status === 408 || status === 429 || (status >= 500 && status <= 599);
}

export async function fetchJSON<T>(
  url: string,
  options?: {
    timeoutMs?: number;
    retry?: RetryPolicy;
    headers?: Record<string, string>;
  },
): Promise<Result<T, AppError>> {
  const timeoutMs = options?.timeoutMs ?? 4000;
  const retry = options?.retry ?? defaultRetry;
  const headers = { Accept: "application/json", ...options?.headers };

  let attempt = 0;

  while (true) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { headers, signal: controller.signal });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const status = response.status;
        let apiMessage: string | undefined;
        let httpMessage: string | undefined;

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
            retry.maxDelayMs,
          );
          attempt++;
          await sleep(delay);
          continue;
        }

        return apiMessage ? err(error.api(apiMessage)) : err(httpError);
      }

      if (response.status === 204) {
        return ok(undefined as unknown as T);
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        return err(error.parse("Expected JSON response", { contentType }));
      }

      try {
        const data = (await response.json()) as unknown as T;
        return ok(data);
      } catch (parseError) {
        return err(
          error.parse("Invalid JSON in response", { cause: parseError }),
        );
      }
    } catch (errorObject) {
      clearTimeout(timeoutId);

      const isAbort =
        (errorObject instanceof DOMException &&
          errorObject.name === "AbortError") ||
        (errorObject as Error)?.name === "AbortError";

      const baseError = isAbort
        ? error.timeout(timeoutMs)
        : error.network((errorObject as Error)?.message ?? "Network");

      if (attempt < retry.retries) {
        const delay = exponentialBackoff(
          attempt,
          retry.baseDelayMs,
          retry.maxDelayMs,
        );
        attempt++;
        await sleep(delay);
        continue;
      }
      return err(baseError);
    }
  }
}
