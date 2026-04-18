export const ok = (data) => ({ ok: true, data });
export const err = (error) => ({ ok: false, error });
export const isOk = (result) => result.ok;
export const isErr = (result) => !result.ok;
export function map(result, transform) {
    return result.ok ? ok(transform(result.data)) : result;
}
export function mapErr(result, transformError) {
    return result.ok ? result : err(transformError(result.error));
}
export function andThen(result, nextStep) {
    return result.ok ? nextStep(result.data) : result;
}
export function unwrapOr(result, fallback) {
    return result.ok ? result.data : fallback;
}
export function unwrapOrElse(result, onError) {
    return result.ok ? result.data : onError(result.error);
}
export function fromThrowable(operation, onThrow) {
    try {
        return ok(operation());
    }
    catch (error) {
        return err(onThrow(error));
    }
}
//# sourceMappingURL=result.js.map