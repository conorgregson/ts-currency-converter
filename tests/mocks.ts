/**
 * mocks.ts — tiny fetch() mocking utilities for browser tests
 *
 * Use:
 *  setFetchSequence([
 *    { kind: "timeout" },
 *    { kind: "json", status: 200, body: { ok: true } },
 *  ]);
 *  await withMockFetch(async () => {
 *    // run tests here
 *  });
 */

type FetchStep =
  | { kind: "timeout" }
  | { kind: "json"; status: number; body: unknown };

let lastRequestUrl: string | null = null;
export function getLastRequestUrl() {
  return lastRequestUrl;
}
export function resetLastRequestUrl() {
  lastRequestUrl = null;
}

let mockSteps: FetchStep[] = [];

/** Define the sequence of mock fetch responses. */
export function setFetchSequence(sequence: FetchStep[]) {
  mockSteps = [...sequence];
}

/**
 * Temporarily replace global fetch() with a mock that:
 *  - Plays through the configured step sequence
 *  - Records the last requested URL
 *  - Restores the real fetch() afterwards
 */
export async function withMockFetch(runTests: () => Promise<void>) {
  const realFetch = globalThis.fetch;

  // @ts-ignore — deliberate override for test
  globalThis.fetch = (async (
    request: RequestInfo | URL,
    init?: RequestInit
  ) => {
    // Record URL for assertions
    lastRequestUrl = String(
      typeof request === "string"
        ? request
        : request instanceof URL
        ? request.href
        : request.url
    );

    const nextStep = mockSteps.shift();
    if (!nextStep) throw new Error("No mock step remaining");

    if (nextStep.kind === "timeout") {
      // Simulate AbortError like a real fetch timeout/abort
      return new Promise<never>((_resolve, reject) => {
        // Best-effort: notify any provided signal
        const signal = init?.signal as AbortSignal | undefined;
        try {
          signal?.dispatchEvent?.(new Event("abort"));
        } catch {
          /* ignore */
        }
        setTimeout(() => reject(new DOMException("Aborted", "AbortError")), 0);
      });
    }

    // Normal JSON response
    return new Response(JSON.stringify(nextStep.body), {
      status: nextStep.status,
      headers: { "Content-Type": "application/json" },
    });
  }) as any;

  try {
    await runTests();
  } finally {
    globalThis.fetch = realFetch;
  }
}
