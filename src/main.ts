/**
 * main.ts — application bootstrap
 *
 * Purpose:
 *  Entry point that waits for the DOM to load, then initializes the app.
 *  Keeps startup logic isolated from core logic (see app.ts for orchestration).
 *
 * Behavior:
 *  - Defers initialization until all HTML elements are ready
 *  - Uses `void` to ignore the returned Promise from initApp()
 */

import { initApp } from "./app.js";

// Wait for the DOM to be ready before bootstrapping the app
window.addEventListener("DOMContentLoaded", () => {
  void initApp(); // Fire and forget (async initialization)
});
