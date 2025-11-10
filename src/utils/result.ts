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

// --- Core types ---

/** Successful result variant. */
export type Ok<T> = { ok: true; data: T };

/** Failed result variant. */
export type Err<E = unknown> = { ok: false; error: E };

/** Union of success (Ok) and failure (Err) cases. */
export type Result<T, E = unknown> = Ok<T> | Err<E>;

// --- Constructors ---

/** Wraps a value in a success Result. */
export const ok = <T>(data: T): Ok<T> => ({ ok: true, data });

/** Wraps an error in a failure Result. */
export const err = <E>(error: E): Err<E> => ({ ok: false, error });

// --- Type guards ---

/** Returns true if the Result represents success. */
export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => result.ok;

/** Returns true if the Result represents failure. */
export const isErr = <T, E>(result: Result<T, E>): result is Err<E> =>
  !result.ok;

// --- Functional helpers ---

/**
 * Applies a transformation to the data if Result is Ok.
 * Returns the same Err otherwise.
 */
export function map<T, U, E>(
  result: Result<T, E>,
  transform: (value: T) => U
): Result<U, E> {
  return result.ok ? ok(transform(result.data)) : result;
}

/**
 * Applies a transformation to the error if Result is Err.
 * Returns the same Ok otherwise.
 */
export function mapErr<T, E, F>(
  result: Result<T, E>,
  transformError: (error: E) => F
): Result<T, F> {
  return result.ok ? result : err(transformError(result.error));
}

/**
 * Chains operations that return a Result.
 * Runs `nextStep` only if the first Result is Ok.
 */
export function andThen<T, U, E>(
  result: Result<T, E>,
  nextStep: (value: T) => Result<U, E>
): Result<U, E> {
  return result.ok ? nextStep(result.data) : result;
}

/**
 * Unwraps the data if Ok, or returns a fallback value if Err.
 */
export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return result.ok ? result.data : fallback;
}

/**
 * Unwraps the data if Ok, or computes a fallback value based on the error.
 */
export function unwrapOrElse<T, E>(
  result: Result<T, E>,
  onError: (error: E) => T
): T {
  return result.ok ? result.data : onError(result.error);
}

/**
 * Converts a throw-prone operation into a Result.
 * If it throws, calls `onThrow` to map the error.
 */
export function fromThrowable<T, E>(
  operation: () => T,
  onThrow: (error: unknown) => E
): Result<T, E> {
  try {
    return ok(operation());
  } catch (error) {
    return err(onThrow(error));
  }
}
