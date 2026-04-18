export const queryOne = <T extends Element>(
  selector: string,
  root: ParentNode = document,
) => root.querySelector<T>(selector);

export const queryAll = <T extends Element>(
  selector: string,
  root: ParentNode = document,
) => Array.from(root.querySelectorAll<T>(selector));

export const addEvent = (
  element: Element,
  eventType: string,
  listener: EventListener,
) => element.addEventListener(eventType, listener);
