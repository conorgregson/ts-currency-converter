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

function write(list: LogEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-MAX_LOGS)));
  } catch {
    /* ignore quota or JSON errors */
  }
}

export function log(entry: LogEntry) {
  const list = read();
  list.push(entry);
  write(list);
}

function setIfDefined<T, K extends keyof T>(
  target: T,
  key: K,
  value: T[K] | undefined,
): void {
  if (value !== undefined) {
    (target as any)[key] = value;
  }
}

export const logger = {
  info(name: string, options: { durationMs?: number; context?: unknown } = {}) {
    const entry: LogEntry = { timestamp: Date.now(), name, level: "info" };
    setIfDefined(entry, "durationMs", options.durationMs);
    setIfDefined(entry, "context", options.context);
    log(entry);
  },

  warn(
    name: string,
    options: { durationMs?: number; error?: string; context?: unknown } = {},
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

export function getLogs(): LogEntry[] {
  return read();
}

export function clearLogs(): void {
  localStorage.removeItem(STORAGE_KEY);
}
