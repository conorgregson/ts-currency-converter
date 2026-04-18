import { fetchJSON } from "../utils/http";
import { Result, ok, err } from "../utils/result";
import { AppError, error } from "../utils/errors";
import {
  CurrenciesResponse,
  ConvertResponse,
  isCurrenciesResponse,
  isConvertResponse,
  asCurrencyCode,
  CurrencyCode,
} from "../domain/currency";
import { getCache, setCache } from "../utils/cache";
import { CONFIG } from "../config";

/** Frankfurter sometimes returns: { error: string } */
type ApiErrorShape = { error: string };

function isApiErrorShape(data: unknown): data is ApiErrorShape {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof (data as Record<string, unknown>).error === "string"
  );
}

function pickApiErrorMessage(payload: unknown): string | null {
  return isApiErrorShape(payload) ? payload.error : null;
}

const CURRENCY_CACHE_KEY = "currencies";

export async function fetchCurrencies(): Promise<
  Result<CurrenciesResponse, AppError>
> {
  if (CONFIG.USE_CACHE) {
    const cached = getCache<CurrenciesResponse>(CURRENCY_CACHE_KEY);
    if (cached) return ok(cached);
  }

  const url = `${CONFIG.API_BASE}/currencies`;
  const response = await fetchJSON<unknown>(url, {
    timeoutMs: CONFIG.TIMEOUT_MS,
  });
  if (!response.ok) return response;

  const apiError = pickApiErrorMessage(response.data);
  if (apiError) return err(error.api(apiError));

  if (!isCurrenciesResponse(response.data)) {
    return err(
      error.parse("Unexpected /currencies response shape", {
        payload: response.data,
      }),
    );
  }

  if (CONFIG.USE_CACHE) {
    setCache(CURRENCY_CACHE_KEY, response.data, CONFIG.CACHE_TTL_MS);
  }

  return ok(response.data);
}

export async function convertAmount(
  amount: number,
  fromCodeRaw: string,
  toCodeRaw: string,
): Promise<Result<ConvertResponse, AppError>> {
  let fromCode: CurrencyCode, toCode: CurrencyCode;
  try {
    fromCode = asCurrencyCode(fromCodeRaw);
    toCode = asCurrencyCode(toCodeRaw);
  } catch {
    return err(
      error.validation("Invalid currency code(s)", {
        from: fromCodeRaw,
        to: toCodeRaw,
      }),
    );
  }

  const url = new URL(`${CONFIG.API_BASE}/latest`);
  url.searchParams.set("amount", String(amount));
  url.searchParams.set("from", fromCode);
  url.searchParams.set("to", toCode);

  const response = await fetchJSON<unknown>(url.toString(), {
    timeoutMs: CONFIG.TIMEOUT_MS,
  });
  if (!response.ok) return response;

  const apiError = pickApiErrorMessage(response.data);
  if (apiError) return err(error.api(apiError));

  if (!isConvertResponse(response.data)) {
    return err(
      error.parse("Unexpected /latest convert response shape", {
        payload: response.data,
      }),
    );
  }

  return ok(response.data);
}
