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
export const queryOne = <T extends Element>(
  selector: string,
  root: ParentNode = document
) => root.querySelector<T>(selector);

/**
 * Returns an array of all elements matching the CSS selector.
 *
 * @param selector - CSS selector string
 * @param root - optional parent node to scope the search (defaults to document)
 */
export const queryAll = <T extends Element>(
  selector: string,
  root: ParentNode = document
) => Array.from(root.querySelectorAll<T>(selector));

// --- Event helper ---

/**
 * Attaches an event listener to a given element.
 *
 * @param element - target element
 * @param eventType - event type (e.g. "click", "input")
 * @param listener - event handler callback
 */
export const addEvent = (
  element: Element,
  eventType: string,
  listener: EventListener
) => element.addEventListener(eventType, listener);
