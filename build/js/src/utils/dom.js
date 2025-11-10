/**
 * dom.ts — minimal DOM utility helpers
 *
 * Purpose:
 *  Small, type-safe query and event helpers for cleaner DOM code.
 *  These mirror jQuery-style utilities ($, $$, on) while preserving
 *  native TypeScript element typing and scoping.
 *
 * Usage example:
 *  const form = queryOne<HTMLFormElement>("#convert-form")!;
 *  const buttons = queryAll<HTMLButtonElement>("button");
 *  addEvent(form, "submit", (event) => {
 *    event.preventDefault();
 *    ...
 *  });
 */
// --- Element selectors ---
/**
 * Returns the first element that matches the CSS selector.
 *
 * @param selector - CSS selector string
 * @param root - optional parent node to scope the search (defaults to document)
 */
export const queryOne = (selector, root = document) => root.querySelector(selector);
/**
 * Returns an array of all elements matching the CSS selector.
 *
 * @param selector - CSS selector string
 * @param root - optional parent node to scope the search (defaults to document)
 */
export const queryAll = (selector, root = document) => Array.from(root.querySelectorAll(selector));
// --- Event helper ---
/**
 * Attaches an event listener to a given element.
 *
 * @param element - target element
 * @param eventType - event type (e.g. "click", "input")
 * @param listener - event handler callback
 */
export const addEvent = (element, eventType, listener) => element.addEventListener(eventType, listener);
//# sourceMappingURL=dom.js.map