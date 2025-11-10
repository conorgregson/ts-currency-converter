/**
 * debug-panel.ts — lightweight in-app telemetry viewer
 *
 * Purpose:
 *  - Provides a toggleable overlay panel to inspect recent telemetry logs.
 *  - Helps debug app performance and errors without opening DevTools.
 *
 * Features:
 *  - Opens via “Debug” link or Ctrl/Cmd + D shortcut
 *  - Displays timestamped INFO / WARN / ERROR entries
 *  - Supports live clearing and keyboard dismissal (Escape)
 *
 * Related:
 *  - Logs are persisted in localStorage (see utils/logger.ts)
 *  - Styling and spacing handled via modal.css (src/ui/modal.css)
 */

import { getLogs, clearLogs } from "../utils/logger.js";

// --- Internal state references ---

/** Panel wrapper element (overlay). */
let panelEl: HTMLDivElement | null = null;

/** Log container element inside the panel. */
let contentEl: HTMLDivElement | null = null;

/** Tracks whether the panel is currently visible. */
let isOpen = false;

// --- Public initializer ---

/**
 * Initializes the debug panel link and global keyboard shortcuts.
 * Safe to call once at startup (no-op on repeated calls).
 */
export function initDebugPanel() {
  // Create floating “Debug” link at bottom corner
  const debugLink = document.createElement("a");
  debugLink.href = "#";
  debugLink.textContent = "Debug";
  debugLink.id = "debug-link";
  debugLink.className = "debug-link";

  // Toggle panel when clicked
  debugLink.addEventListener("click", (event) => {
    event.preventDefault();
    isOpen ? hidePanel() : showPanel();
  });
  document.body.appendChild(debugLink);

  // Keyboard shortcuts
  window.addEventListener("keydown", (event) => {
    const isToggle =
      (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d";
    if (isToggle) {
      event.preventDefault();
      isOpen ? hidePanel() : showPanel();
    }
    if (event.key === "Escape" && isOpen) hidePanel();
  });
}

// --- DOM construction ---

/**
 * Lazily creates the debug panel DOM the first time it’s shown.
 * Includes heading, legend, close/clear buttons, and scrollable log area.
 */
function ensurePanel() {
  if (panelEl) return; // already built

  const backdrop = document.createElement("div");
  backdrop.id = "debug-panel";
  backdrop.setAttribute("role", "dialog");
  backdrop.setAttribute("aria-modal", "true");

  const box = document.createElement("div");
  box.className = "debug-box";

  const heading = document.createElement("h3");
  heading.textContent = "Telemetry Logs";

  // --- Legend badges (INFO / WARN / ERROR) ---
  const legend = document.createElement("div");
  legend.className = "debug-legend";
  for (const level of ["INFO", "WARN", "ERROR"] as const) {
    const span = document.createElement("span");
    span.className = `badge level-${level.toLowerCase()}`;
    span.textContent = level;
    legend.appendChild(span);
  }

  // --- Action buttons ---
  const closeBtn = document.createElement("button");
  closeBtn.id = "close-debug";
  closeBtn.textContent = "Close";

  const clearBtn = document.createElement("button");
  clearBtn.id = "clear-debug";
  clearBtn.textContent = "Clear";

  // --- Scrollable content area ---
  const list = document.createElement("div");
  list.id = "debug-content";
  list.className = "debug-content";
  list.setAttribute("role", "log");
  list.setAttribute("aria-live", "polite");

  // Compose and attach to DOM
  box.append(heading, legend, closeBtn, clearBtn, list);
  backdrop.appendChild(box);
  document.body.appendChild(backdrop);

  // --- Event bindings ---
  closeBtn.addEventListener("click", hidePanel);
  clearBtn.addEventListener("click", () => {
    clearLogs();
    list.textContent = "";
    heading.textContent = "Telemetry Logs (0)";
  });
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) hidePanel();
  });

  // Store references
  panelEl = backdrop as HTMLDivElement;
  contentEl = list as HTMLDivElement;
}

// --- Rendering ---

/**
 * Re-renders all log entries from localStorage into the panel.
 * Includes timestamp, severity, event name, duration, and error (if any).
 */
function renderLogs() {
  const logs = getLogs();

  const heading = panelEl?.querySelector("h3");
  if (heading) heading.textContent = `Telemetry Logs (${logs.length})`;

  if (!contentEl) return;
  contentEl.textContent = ""; // clear existing

  const fragment = document.createDocumentFragment();

  for (const entry of logs) {
    const line = document.createElement("div");
    line.className = "log-line";

    // Timestamp
    const time = document.createElement("span");
    time.className = "log-time";
    time.textContent = new Date(entry.timestamp).toLocaleTimeString();

    // Level badge
    const level = (entry.level ?? "info").toLowerCase() as
      | "info"
      | "warn"
      | "error";
    const levelBadge = document.createElement("span");
    levelBadge.className = `log-level badge level-${level}`;
    levelBadge.textContent = level.toUpperCase();

    // Event name
    const name = document.createElement("span");
    name.className = "log-name";
    name.textContent = entry.name ?? "event";

    // Duration
    const duration = document.createElement("span");
    duration.className = "log-duration";
    if (typeof entry.durationMs === "number") {
      duration.textContent = ` (${entry.durationMs}ms)`;
    }

    // Error field (if any)
    const err = document.createElement("span");
    err.className = "log-error";
    if (entry.error) {
      err.textContent = `  ⚠ ${entry.error}`;
    }

    line.append(time, levelBadge, name, duration, err);
    fragment.appendChild(line);
  }

  contentEl.appendChild(fragment);
}

// --- Visibility control ---

/**
 * Displays the panel overlay and renders current logs.
 * Focuses the Close button for accessibility.
 */
function showPanel() {
  ensurePanel();
  if (!panelEl || isOpen) return;
  renderLogs();
  panelEl.style.display = "flex";
  isOpen = true;
  panelEl.querySelector<HTMLButtonElement>("#close-debug")?.focus();
}

/**
 * Hides the panel overlay and restores normal page interaction.
 */
function hidePanel() {
  if (!panelEl || !isOpen) return;
  panelEl.style.display = "none";
  isOpen = false;
}
