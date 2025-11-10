/**
 * logger.ts — lightweight localStorage-based telemetry logger
 *
 * Purpose:
 *  - Capture and persist simple log entries (info, warn, error)
 *  - Each entry includes a timestamp, event name, and optional metadata
 *  - Used by the in-app debug panel to display recent logs
 *
 * Storage:
 *  - Logs are stored under the key "tscc-logs" in localStorage
 *  - Automatically capped at MAX_LOGS (oldest entries trimmed)
 *
 * Usage:
 *  logger.info("services:fetchCurrencies", { durationMs: 320 });
 *  logger.warn("ui:renderFallback", { error: "Missing DOM node" });
 *  logger.error("services:convert", { error: err.message, context: err });
 *
 * Exports:
 *  - logger   → main API (info, warn, error)
 *  - log()    → low-level manual push helper
 *  - getLogs() / clearLogs() → read and reset stored logs
 */

export type LogEntry = {
  timestamp: number; // Epoch ms when event occurred
  name: string; // Event label or source (e.g. "ui:init")
  level?: "info" | "warn" | "error"; // Optional severity
  durationMs?: number; // Optional duration for timed ops
  error?: string; // Optional short error message
  context?: unknown; // Optional extra debugging details
};

const STORAGE_KEY = "tscc-logs";
const MAX_LOGS = 200;

// --- Internal persistence helpers ---

/**
 * Reads log entries from localStorage.
 * Returns an empty array on parse errors or missing data.
 */
function read(): LogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LogEntry[]) : [];
  } catch {
    return [];
  }
}

/**
 * Writes logs to localStorage, keeping only the latest MAX_LOGS.
 */
function write(list: LogEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-MAX_LOGS)));
  } catch {
    /* ignore quota or JSON errors */
  }
}

/**
 * Pushes a single entry to the log list and persists it.
 */
export function log(entry: LogEntry) {
  const list = read();
  list.push(entry);
  write(list);
}

/**
 * Utility: set a property only if the provided value is defined.
 * Helps preserve strict optional field typing.
 */
function setIfDefined<T, K extends keyof T>(
  target: T,
  key: K,
  value: T[K] | undefined
): void {
  if (value !== undefined) {
    (target as any)[key] = value;
  }
}

// --- Public logging API ---

export const logger = {
  info(name: string, options: { durationMs?: number; context?: unknown } = {}) {
    const entry: LogEntry = { timestamp: Date.now(), name, level: "info" };
    setIfDefined(entry, "durationMs", options.durationMs);
    setIfDefined(entry, "context", options.context);
    log(entry);
  },

  warn(
    name: string,
    options: { durationMs?: number; error?: string; context?: unknown } = {}
  ) {
    const entry: LogEntry = { timestamp: Date.now(), name, level: "warn" };
    setIfDefined(entry, "durationMs", options.durationMs);
    setIfDefined(entry, "error", options.error);
    setIfDefined(entry, "context", options.context);
    log(entry);
  },

  error(name: string, options: { error?: string; context?: unknown } = {}) {
    const entry: LogEntry = { timestamp: Date.now(), name, level: "error" };
    setIfDefined(entry, "error", options.error);
    setIfDefined(entry, "context", options.context);
    log(entry);
  },
};

// --- Debug panel accessors ---

/**
 * Returns all persisted log entries.
 */
export function getLogs(): LogEntry[] {
  return read();
}

/**
 * Clears all logs from localStorage.
 */
export function clearLogs(): void {
  localStorage.removeItem(STORAGE_KEY);
}
