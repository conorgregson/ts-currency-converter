export const queryOne = (selector, root = document) => root.querySelector(selector);
export const queryAll = (selector, root = document) => Array.from(root.querySelectorAll(selector));
export const addEvent = (element, eventType, listener) => element.addEventListener(eventType, listener);
//# sourceMappingURL=dom.js.map