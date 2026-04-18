export type Brand<T, B extends string> = T & { readonly __brand: B };

export type NonEmptyString = Brand<string, "NonEmptyString">;

export type CurrencyCode = Brand<string, "CurrencyCode">;

export function asCurrencyCode(rawCode: string): CurrencyCode {
  if (!rawCode || typeof rawCode !== "string") throw new Error("Invalid code");
  const ISO3 = /^[A-Z]{3}$/;
  if (!ISO3.test(rawCode)) throw new Error("Invalid code");
  return rawCode as CurrencyCode;
}

export type CurrenciesResponse = Record<string, string>;

export type ConvertResponse = {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
};

export function isCurrenciesResponse(
  data: unknown,
): data is CurrenciesResponse {
  if (typeof data !== "object" || data === null) return false;

  for (const [key, label] of Object.entries(data as Record<string, unknown>)) {
    if (typeof key !== "string" || typeof label !== "string") return false;
  }
  return true;
}

export function isConvertResponse(data: unknown): data is ConvertResponse {
  if (typeof data !== "object" || data === null) return false;

  const response = data as Record<string, unknown>;

  if (typeof response.amount !== "number") return false;
  if (typeof response.base !== "string") return false;
  if (typeof response.date !== "string") return false;

  if (typeof response.rates !== "object" || response.rates === null) {
    return false;
  }

  for (const rateValue of Object.values(
    response.rates as Record<string, unknown>,
  )) {
    if (typeof rateValue !== "number") return false;
  }

  return true;
}
