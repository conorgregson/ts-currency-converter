export type Ok<T> = { ok: true; data: T };

export type Err<E = unknown> = { ok: false; error: E };

export type Result<T, E = unknown> = Ok<T> | Err<E>;

export const ok = <T>(data: T): Ok<T> => ({ ok: true, data });

export const err = <E>(error: E): Err<E> => ({ ok: false, error });

export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => result.ok;

export const isErr = <T, E>(result: Result<T, E>): result is Err<E> =>
  !result.ok;

export function map<T, U, E>(
  result: Result<T, E>,
  transform: (value: T) => U,
): Result<U, E> {
  return result.ok ? ok(transform(result.data)) : result;
}

export function mapErr<T, E, F>(
  result: Result<T, E>,
  transformError: (error: E) => F,
): Result<T, F> {
  return result.ok ? result : err(transformError(result.error));
}

export function andThen<T, U, E>(
  result: Result<T, E>,
  nextStep: (value: T) => Result<U, E>,
): Result<U, E> {
  return result.ok ? nextStep(result.data) : result;
}

export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return result.ok ? result.data : fallback;
}

export function unwrapOrElse<T, E>(
  result: Result<T, E>,
  onError: (error: E) => T,
): T {
  return result.ok ? result.data : onError(result.error);
}

export function fromThrowable<T, E>(
  operation: () => T,
  onThrow: (error: unknown) => E,
): Result<T, E> {
  try {
    return ok(operation());
  } catch (error) {
    return err(onThrow(error));
  }
}
