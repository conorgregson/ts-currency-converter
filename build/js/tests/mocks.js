let lastRequestUrl = null;
export function getLastRequestUrl() {
    return lastRequestUrl;
}
export function resetLastRequestUrl() {
    lastRequestUrl = null;
}
let mockSteps = [];
export function setFetchSequence(sequence) {
    mockSteps = [...sequence];
}
export async function withMockFetch(runTests) {
    const realFetch = globalThis.fetch;
    globalThis.fetch = (async (request, init) => {
        lastRequestUrl = String(typeof request === "string"
            ? request
            : request instanceof URL
                ? request.href
                : request.url);
        const nextStep = mockSteps.shift();
        if (!nextStep)
            throw new Error("No mock step remaining");
        if (nextStep.kind === "timeout") {
            return new Promise((_resolve, reject) => {
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