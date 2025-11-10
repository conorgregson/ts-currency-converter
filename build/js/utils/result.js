/**
 * result.ts — functional-style Result type for safe error handling
 *
 * Purpose:
 *  Provides a lightweight, TypeScript-native alternative to try/catch.
 *  Instead of throwing, functions return a Result<T, E> that encodes success or failure.
 *
 * Usage example:
 *  const result = fromThrowable(() => JSON.parse(input), (e) => String(e));
 *  if (isOk(result)) {
 *    console.log("Parsed:", result.data);
 *  } else {
 *    console.warn("Failed:", result.error);
 *  }
 *
 */
// --- Constructors ---
/** Wraps a value in a success Result. */
export const ok = (data) => ({ ok: true, data });
/** Wraps an error in a failure Result. */
export const err = (error) => ({ ok: false, error });
// --- Type guards ---
/** Returns true if the Result represents success. */
export const isOk = (result) => result.ok;
/** Returns true if the Result represents failure. */
export const isErr = (result) => !result.ok;
// --- Functional helpers ---
/**
 * Applies a transformation to the data if Result is Ok.
 * Returns the same Err otherwise.
 */
export function map(result, transform) {
    return result.ok ? ok(transform(result.data)) : result;
}
/**
 * Applies a transformation to the error if Result is Err.
 * Returns the same Ok otherwise.
 */
export function mapErr(result, transformError) {
    return result.ok ? result : err(transformError(result.error));
}
/**
 * Chains operations that return a Result.
 * Runs `nextStep` only if the first Result is Ok.
 */
export function andThen(result, nextStep) {
    return result.ok ? nextStep(result.data) : result;
}
/**
 * Unwraps the data if Ok, or returns a fallback value if Err.
 */
export function unwrapOr(result, fallback) {
    return result.ok ? result.data : fallback;
}
/**
 * Unwraps the data if Ok, or computes a fallback value based on the error.
 */
export function unwrapOrElse(result, onError) {
    return result.ok ? result.data : onError(result.error);
}
/**
 * Converts a throw-prone operation into a Result.
 * If it throws, calls `onThrow` to map the error.
 */
export function fromThrowable(operation, onThrow) {
    try {
        return ok(operation());
    }
    catch (error) {
        return err(onThrow(error));
    }
}
//# sourceMappingURL=result.js.map