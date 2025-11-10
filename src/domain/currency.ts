/**
 * currency.ts — domain types + validators for currency data
 *
 * Purpose:
 *  - Brand primitive strings as domain-specific types (CurrencyCode, NonEmptyString)
 *  - Define API response shapes used by the Frankfurter client
 *  - Provide runtime type guards to validate unknown payloads
 *
 * Notes:
 *  - `asCurrencyCode` is a *branding* function, not strict validation.
 *    It preserves your current behavior (no format enforcement).
 *    If you later want stricter checks (e.g., /^[A-Z]{3}$/), add them there.
 */

// --- Brands ---

/**
 * Nominal/brand typing helper.
 * Attaches a phantom property so TS distinguishes otherwise-equal primitives.
 */
export type Brand<T, B extends string> = T & { readonly __brand: B };

/** A non-empty string (semantic brand; not strictly enforced at runtime here). */
export type NonEmptyString = Brand<string, "NonEmptyString">;

/** ISO-like currency code brand (branding only; see note above). */
export type CurrencyCode = Brand<string, "CurrencyCode">;

/**
 * Brand a raw string as CurrencyCode.
 * Current behavior: minimal checks to keep flow simple.
 * (Throws only if falsy/non-string.)
 */
export function asCurrencyCode(rawCode: string): CurrencyCode {
  if (!rawCode || typeof rawCode !== "string") throw new Error("Invalid code");
  const ISO3 = /^[A-Z]{3}$/; // enforce 3 uppercase letters (e.g., USD, EUR)
  if (!ISO3.test(rawCode)) throw new Error("Invalid code");
  return rawCode as CurrencyCode;
}

// --- API response shapes ---

/** `/currencies` → map of currency code → human-readable name. */
export type CurrenciesResponse = Record<string, string>;

/** `/latest` → conversion result payload. */
export type ConvertResponse = {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
};

// --- Type guards ---

/**
 * Runtime validator for CurrenciesResponse.
 * Ensures an object where every value is a string.
 */
export function isCurrenciesResponse(
  data: unknown
): data is CurrenciesResponse {
  if (typeof data !== "object" || data === null) return false;

  for (const [key, label] of Object.entries(data as Record<string, unknown>)) {
    if (typeof key !== "string" || typeof label !== "string") return false;
  }
  return true;
}

/**
 * Runtime validator for ConvertResponse.
 * Checks amount/base/date types and that `rates` is a { string: number } map.
 */
export function isConvertResponse(data: unknown): data is ConvertResponse {
  if (typeof data !== "object" || data === null) return false;

  const response = data as Record<string, unknown>;

  if (typeof response.amount !== "number") return false;
  if (typeof response.base !== "string") return false;
  if (typeof response.date !== "string") return false;

  if (typeof response.rates !== "object" || response.rates === null)
    return false;

  for (const rateValue of Object.values(
    response.rates as Record<string, unknown>
  )) {
    if (typeof rateValue !== "number") return false;
  }

  return true;
}
