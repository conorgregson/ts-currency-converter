export type StatusKind = "info" | "success" | "error";

export const selectOne = <T extends Element>(
  selector: string,
  root: ParentNode = document,
): T | null => root.querySelector<T>(selector);

export const selectOneStrict = <T extends Element>(
  selector: string,
  root: ParentNode = document,
): T => {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Element not found: ${selector}`);
  return element;
};

export function setText(element: Element, text: string) {
  element.textContent = text;
}

export function makeOption(code: string, label: string) {
  const optionEl = document.createElement("option");
  optionEl.value = code;
  optionEl.textContent = `${code} - ${label}`;
  return optionEl;
}

export function renderCurrencyOptions(
  selectEl: HTMLSelectElement,
  currencies: Record<string, string>,
) {
  const fragment = document.createDocumentFragment();
  const entries = Object.entries(currencies).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  for (const [code, label] of entries) {
    fragment.appendChild(makeOption(code, label));
  }
  selectEl.replaceChildren(fragment);
}

export function selectValue(selectEl: HTMLSelectElement, code: string) {
  const index = Array.from(selectEl.options).findIndex(
    (optionEl) => optionEl.value === code,
  );
  if (index >= 0) {
    selectEl.selectedIndex = index;
    return true;
  }
  return false;
}

export function showError(target: HTMLElement, message: string) {
  target.textContent = message;
  target.classList.add("inline-error");
}

export function clearStatus(target: HTMLElement) {
  target.textContent = "";
  target.classList.remove("inline-error");
}

export function buttonToast(
  buttonEl: HTMLButtonElement,
  label = "Done!",
  ms = 800,
) {
  const previousText = buttonEl.textContent ?? "";
  const wasDisabled = buttonEl.disabled;

  buttonEl.disabled = true;
  buttonEl.textContent = label;

  window.setTimeout(() => {
    buttonEl.textContent = previousText;
    buttonEl.disabled = wasDisabled;
  }, ms);
}

export function setStatusChip(
  statusEl: HTMLElement,
  kind: StatusKind,
  text: string,
) {
  statusEl.classList.add("status");
  statusEl.setAttribute("data-status", kind);
  statusEl.textContent = text;
  statusEl.setAttribute("role", "status");
  statusEl.setAttribute("aria-live", "polite");
}

export function clearStatusChip(statusEl: HTMLElement) {
  statusEl.textContent = "";
  statusEl.removeAttribute("data-status");
}

export function setResultOutput(
  outputEl: HTMLOutputElement,
  amount: number,
  fromCode: string,
  toCode: string,
  converted: number,
) {
  outputEl.classList.add("result-output");
  outputEl.value = `${amount} ${fromCode} → ${converted.toLocaleString(
    undefined,
    {
      maximumFractionDigits: 6,
    },
  )} ${toCode}`;
}

export function setButtonLoading(
  buttonEl: HTMLButtonElement,
  loading: boolean,
) {
  buttonEl.classList.toggle("is-loading", loading);
  buttonEl.setAttribute("aria-busy", loading ? "true" : "false");
  buttonEl.disabled = loading;
}
