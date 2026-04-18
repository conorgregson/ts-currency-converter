import { getLogs, clearLogs } from "../utils/logger";
let panelEl = null;
let contentEl = null;
let isOpen = false;
/**
 * Initializes the debug panel link and global keyboard shortcuts.
 * Safe to call once at startup (no-op on repeated calls).
 */
export function initDebugPanel() {
    const debugLink = document.createElement("a");
    debugLink.href = "#";
    debugLink.textContent = "Debug";
    debugLink.id = "debug-link";
    debugLink.className = "debug-link";
    debugLink.addEventListener("click", (event) => {
        event.preventDefault();
        isOpen ? hidePanel() : showPanel();
    });
    document.body.appendChild(debugLink);
    window.addEventListener("keydown", (event) => {
        const isToggle = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d";
        if (isToggle) {
            event.preventDefault();
            isOpen ? hidePanel() : showPanel();
        }
        if (event.key === "Escape" && isOpen)
            hidePanel();
    });
}
/**
 * Lazily creates the debug panel DOM the first time it’s shown.
 * Includes heading, legend, close/clear buttons, and scrollable log area.
 */
function ensurePanel() {
    if (panelEl)
        return;
    const backdrop = document.createElement("div");
    backdrop.id = "debug-panel";
    backdrop.setAttribute("role", "dialog");
    backdrop.setAttribute("aria-modal", "true");
    const box = document.createElement("div");
    box.className = "debug-box";
    const heading = document.createElement("h3");
    heading.textContent = "Telemetry Logs";
    const legend = document.createElement("div");
    legend.className = "debug-legend";
    for (const level of ["INFO", "WARN", "ERROR"]) {
        const span = document.createElement("span");
        span.className = `badge level-${level.toLowerCase()}`;
        span.textContent = level;
        legend.appendChild(span);
    }
    const closeBtn = document.createElement("button");
    closeBtn.id = "close-debug";
    closeBtn.textContent = "Close";
    const clearBtn = document.createElement("button");
    clearBtn.id = "clear-debug";
    clearBtn.textContent = "Clear";
    const list = document.createElement("div");
    list.id = "debug-content";
    list.className = "debug-content";
    list.setAttribute("role", "log");
    list.setAttribute("aria-live", "polite");
    box.append(heading, legend, closeBtn, clearBtn, list);
    backdrop.appendChild(box);
    document.body.appendChild(backdrop);
    closeBtn.addEventListener("click", hidePanel);
    clearBtn.addEventListener("click", () => {
        clearLogs();
        list.textContent = "";
        heading.textContent = "Telemetry Logs (0)";
    });
    backdrop.addEventListener("click", (event) => {
        if (event.target === backdrop)
            hidePanel();
    });
    panelEl = backdrop;
    contentEl = list;
}
/**
 * Re-renders all log entries from localStorage into the panel.
 * Includes timestamp, severity, event name, duration, and error (if any).
 */
function renderLogs() {
    const logs = getLogs();
    const heading = panelEl?.querySelector("h3");
    if (heading)
        heading.textContent = `Telemetry Logs (${logs.length})`;
    if (!contentEl)
        return;
    contentEl.textContent = "";
    const fragment = document.createDocumentFragment();
    for (const entry of logs) {
        const line = document.createElement("div");
        line.className = "log-line";
        const time = document.createElement("span");
        time.className = "log-time";
        time.textContent = new Date(entry.timestamp).toLocaleTimeString();
        const level = (entry.level ?? "info").toLowerCase();
        const levelBadge = document.createElement("span");
        levelBadge.className = `log-level badge level-${level}`;
        levelBadge.textContent = level.toUpperCase();
        const name = document.createElement("span");
        name.className = "log-name";
        name.textContent = entry.name ?? "event";
        const duration = document.createElement("span");
        duration.className = "log-duration";
        if (typeof entry.durationMs === "number") {
            duration.textContent = ` (${entry.durationMs}ms)`;
        }
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
/**
 * Displays the panel overlay and renders current logs.
 * Focuses the Close button for accessibility.
 */
function showPanel() {
    ensurePanel();
    if (!panelEl || isOpen)
        return;
    renderLogs();
    panelEl.style.display = "flex";
    isOpen = true;
    panelEl.querySelector("#close-debug")?.focus();
}
function hidePanel() {
    if (!panelEl || !isOpen)
        return;
    panelEl.style.display = "none";
    isOpen = false;
}
//# sourceMappingURL=debug-panel.js.map