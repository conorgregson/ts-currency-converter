import { ok, err, map, unwrapOr } from "../src/utils/result";
import { fetchJSON } from "../src/utils/http";
import { isCurrenciesResponse } from "../src/domain/currency";
import {
  withMockFetch,
  setFetchSequence,
  resetLastRequestUrl,
  getLastRequestUrl,
} from "./mocks";
import { fetchCurrencies, convertAmount } from "../src/services/frankfurter";
import { clearCacheNamespace } from "../src/utils/cache";

const outputEl = document.getElementById("out") as HTMLPreElement | null;

function assert(condition: boolean, message: string) {
  if (!outputEl) return;
  outputEl.textContent += (condition ? "✅ " : "❌ ") + message + "\n";
}

await (async function resultTests() {
  const okResult = ok(1);
  const errResult = err("x" as const);

  assert(okResult.ok, "ok() marks success");
  assert(unwrapOr(errResult, 42) === 42, "unwrapOr returns fallback on error");

  const mapped = map(ok(2), (value) => value + 1);
  assert(mapped.ok && mapped.data === 3, "map() transforms success value");
})();

await withMockFetch(async () => {
  setFetchSequence([
    { kind: "timeout" }, // first attempt: simulate timeout
    { kind: "json", status: 200, body: { hello: "world" } }, // second attempt succeeds
  ]);

  const response = await fetchJSON<{ hello: string }>("https://example.com", {
    timeoutMs: 50,
  });

  assert(
    response.ok && response.data.hello === "world",
    "fetchJSON retries once then succeeds",
  );
});

const validCurrencies = { USD: "United States Dollar" };
const invalidCurrencies = { USD: 1 } as any;

assert(
  isCurrenciesResponse(validCurrencies),
  "validator: valid currencies object passes",
);
assert(
  !isCurrenciesResponse(invalidCurrencies),
  "validator: wrong type rejected",
);

await withMockFetch(async () => {
  setFetchSequence([
    { kind: "json", status: 400, body: { error: "Bad currency code" } },
  ]);

  const response = await fetchJSON<{ error: string }>("https://example.com", {
    timeoutMs: 50,
  });

  assert(
    !response.ok,
    "fetchJSON reports !ok for HTTP 400 responses (as expected)",
  );
});

await withMockFetch(async () => {
  clearCacheNamespace();
  setFetchSequence([
    {
      kind: "json",
      status: 200,
      body: { USD: "United States Dollar", EUR: "Euro", GBP: "British Pound" },
    },
  ]);

  const result = await fetchCurrencies();
  const okRes =
    result.ok &&
    typeof result.data.USD === "string" &&
    result.data.EUR === "Euro";
  assert(okRes, "fetchCurrencies: happy path returns valid mapping");
});

await withMockFetch(async () => {
  clearCacheNamespace();
  setFetchSequence([
    { kind: "json", status: 400, body: { error: "Bad code" } },
  ]);

  const result = await fetchCurrencies();
  const okRes = !result.ok && result.error.kind === "Api";
  assert(okRes, 'fetchCurrencies: API error payload → AppError("Api")');
});

await withMockFetch(async () => {
  clearCacheNamespace();
  setFetchSequence([{ kind: "json", status: 200, body: { USD: 1 } }]); // invalid shape

  const result = await fetchCurrencies();
  const okRes = !result.ok && result.error.kind === "Parse";
  assert(okRes, 'fetchCurrencies: unexpected shape → AppError("Parse")');
});

await withMockFetch(async () => {
  clearCacheNamespace();
  resetLastRequestUrl();
  setFetchSequence([
    { kind: "json", status: 200, body: { USD: "United States Dollar" } },
  ]);

  const result = await fetchCurrencies();
  assert(result.ok, "fetchCurrencies: succeeded");
  const calledCurrenciesEndpoint =
    getLastRequestUrl()?.endsWith("/currencies") ?? false;
  assert(
    calledCurrenciesEndpoint,
    "fetchCurrencies: called /currencies endpoint",
  );
});

await withMockFetch(async () => {
  setFetchSequence([
    {
      kind: "json",
      status: 200,
      body: {
        amount: 10,
        base: "USD",
        date: "2025-11-07",
        rates: { EUR: 9.31 },
      },
    },
  ]);

  const result = await convertAmount(10, "USD", "EUR");
  const okRes =
    result.ok &&
    result.data.base === "USD" &&
    typeof result.data.rates.EUR === "number" &&
    result.data.rates.EUR === 9.31;

  assert(okRes, "convert: happy path returns expected rate");
});

await withMockFetch(async () => {
  setFetchSequence([
    { kind: "json", status: 400, body: { error: "Unknown currency" } },
  ]);

  const result = await convertAmount(1, "USD", "ZZZ");
  const okRes = !result.ok && result.error.kind === "Api";
  assert(okRes, 'convert: API error payload → AppError("Api")');
});

await (async () => {
  const result = await convertAmount(1, "usd", "eur"); // lowercase should fail branding
  const okRes = !result.ok && result.error.kind === "Validation";
  assert(okRes, 'convert: invalid currency code → AppError("Validation")');
})();
