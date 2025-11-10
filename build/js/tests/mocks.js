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
let lastRequestUrl = null;
export function getLastRequestUrl() {
    return lastRequestUrl;
}
export function resetLastRequestUrl() {
    lastRequestUrl = null;
}
let mockSteps = [];
/** Define the sequence of mock fetch responses. */
export function setFetchSequence(sequence) {
    mockSteps = [...sequence];
}
/**
 * Temporarily replace global fetch() with a mock that:
 *  - Plays through the configured step sequence
 *  - Records the last requested URL
 *  - Restores the real fetch() afterwards
 */
export async function withMockFetch(runTests) {
    const realFetch = globalThis.fetch;
    // @ts-ignore — deliberate override for test
    globalThis.fetch = (async (request, init) => {
        // Record URL for assertions
        lastRequestUrl = String(typeof request === "string"
            ? request
            : request instanceof URL
                ? request.href
                : request.url);
        const nextStep = mockSteps.shift();
        if (!nextStep)
            throw new Error("No mock step remaining");
        if (nextStep.kind === "timeout") {
            // Simulate AbortError like a real fetch timeout/abort
            return new Promise((_resolve, reject) => {
                // Best-effort: notify any provided signal
                const signal = init?.signal;
                try {
                    signal?.dispatchEvent?.(new Event("abort"));
                }
                catch {
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
    });
    try {
        await runTests();
    }
    finally {
        globalThis.fetch = realFetch;
    }
}
//# sourceMappingURL=mocks.js.map