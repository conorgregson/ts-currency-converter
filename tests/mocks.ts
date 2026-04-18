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

export function setFetchSequence(sequence: FetchStep[]) {
  mockSteps = [...sequence];
}

export async function withMockFetch(runTests: () => Promise<void>) {
  const realFetch = globalThis.fetch;

  globalThis.fetch = (async (
    request: RequestInfo | URL,
    init?: RequestInit,
  ) => {
    lastRequestUrl = String(
      typeof request === "string"
        ? request
        : request instanceof URL
          ? request.href
          : request.url,
    );

    const nextStep = mockSteps.shift();
    if (!nextStep) throw new Error("No mock step remaining");

    if (nextStep.kind === "timeout") {
      return new Promise<never>((_resolve, reject) => {
        const signal = init?.signal as AbortSignal | undefined;
        try {
          signal?.dispatchEvent?.(new Event("abort"));
        } catch {
          /* ignore */
        }
        setTimeout(() => reject(new DOMException("Aborted", "AbortError")), 0);
      });
    }

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
