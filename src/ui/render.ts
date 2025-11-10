/**
 * render.ts — UI render helpers for the converter
 *
 * Purpose:
 *  Small, focused utilities for DOM selection, status messaging,
 *  select option rendering, result formatting, and button loading state.
 *
 * Notes:
 *  - `selectOneStrict` throws early to surface missing DOM nodes during init.
 *  - Status chip helpers add minimal ARIA for screen reader announcements.
 *  - `renderCurrencyOptions` uses a DocumentFragment for efficient DOM updates.
 */

// --- Types ---

/** Visual state for status chips. */
export type StatusKind = "info" | "success" | "error";

// --- DOM selection ---

/**
 * Query a single element within an optional root.
 * Returns null if not found.
 */
export const selectOne = <T extends Element>(
  selector: string,
  root: ParentNode = document
): T | null => root.querySelector<T>(selector);

/**
 * Query a single element that must exist.
 * Throws with a helpful message if the element is missing.
 */
export const selectOneStrict = <T extends Element>(
  selector: string,
  root: ParentNode = document
): T => {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Element not found: ${selector}`);
  return element;
};

// --- Text helpers ---

/** Set plain text content on an element. */
export function setText(element: Element, text: string) {
  element.textContent = text;
}

// --- <select> option rendering ---

/** Build a currency <option> element like "USD - United States Dollar". */
export function makeOption(code: string, label: string) {
  const optionEl = document.createElement("option");
  optionEl.value = code;
  optionEl.textContent = `${code} - ${label}`;
  return optionEl;
}

/**
 * Replace all options in a <select> with a sorted list of currency options.
 * Sorting is alphabetical by currency code.
 */
export function renderCurrencyOptions(
  selectEl: HTMLSelectElement,
  currencies: Record<string, string>
) {
  const fragment = document.createDocumentFragment();
  const entries = Object.entries(currencies).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  for (const [code, label] of entries) {
    fragment.appendChild(makeOption(code, label));
  }
  selectEl.replaceChildren(fragment);
}

/**
 * Select a <select> option by value.
 * Returns true if found and selected; false otherwise.
 */
export function selectValue(selectEl: HTMLSelectElement, code: string) {
  const index = Array.from(selectEl.options).findIndex(
    (optionEl) => optionEl.value === code
  );
  if (index >= 0) {
    selectEl.selectedIndex = index;
    return true;
  }
  return false;
}

// --- Inline error/status text ---

/** Show an inline error message on a target element. */
export function showError(target: HTMLElement, message: string) {
  target.textContent = message;
  target.classList.add("inline-error");
}

/** Clear inline error/status text and styling. */
export function clearStatus(target: HTMLElement) {
  target.textContent = "";
  target.classList.remove("inline-error");
}

// --- Button feedback ---

/**
 * Temporary button label + disabled state to signal quick feedback.
 * After `ms`, restores original label and disabled state.
 */
export function buttonToast(
  buttonEl: HTMLButtonElement,
  label = "Done!",
  ms = 800
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

// --- Status chip (ARIA-friendly) ---

/**
 * Configure a chip-like status element with kind + text.
 * Adds `role="status"` and `aria-live="polite"` for screen readers.
 */
export function setStatusChip(
  statusEl: HTMLElement,
  kind: StatusKind,
  text: string
) {
  statusEl.classList.add("status");
  statusEl.setAttribute("data-status", kind);
  statusEl.textContent = text;
  // a11y live updates for screen readers
  statusEl.setAttribute("role", "status");
  statusEl.setAttribute("aria-live", "polite");
}

/**
 * Clear status chip text/kind while keeping the base styling available.
 * Useful when transitioning between states without removing the element.
 */
export function clearStatusChip(statusEl: HTMLElement) {
  statusEl.textContent = "";
  statusEl.removeAttribute("data-status");
}

// --- Result output ---

/**
 * Set the formatted conversion output, e.g., "10 USD → 9.31 EUR".
 * Uses locale formatting with up to 6 fractional digits.
 */
export function setResultOutput(
  outputEl: HTMLOutputElement,
  amount: number,
  fromCode: string,
  toCode: string,
  converted: number
) {
  outputEl.classList.add("result-output");
  outputEl.value = `${amount} ${fromCode} → ${converted.toLocaleString(
    undefined,
    {
      maximumFractionDigits: 6,
    }
  )} ${toCode}`;
}

// --- Loading state ---

/**
 * Toggle a button's loading state (CSS should show spinner for `.is-loading`).
 * Also sets `aria-busy` and disables the button for better UX.
 */
export function setButtonLoading(
  buttonEl: HTMLButtonElement,
  loading: boolean
) {
  buttonEl.classList.toggle("is-loading", loading);
  buttonEl.setAttribute("aria-busy", loading ? "true" : "false");
  buttonEl.disabled = loading;
}
