const STORAGE_KEY = "tscc-logs";
const MAX_LOGS = 200;
function read() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return [];
    }
}
function write(list) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-MAX_LOGS)));
    }
    catch {
        /* ignore quota or JSON errors */
    }
}
export function log(entry) {
    const list = read();
    list.push(entry);
    write(list);
}
function setIfDefined(target, key, value) {
    if (value !== undefined) {
        target[key] = value;
    }
}
export const logger = {
    info(name, options = {}) {
        const entry = { timestamp: Date.now(), name, level: "info" };
        setIfDefined(entry, "durationMs", options.durationMs);
        setIfDefined(entry, "context", options.context);
        log(entry);
    },
    warn(name, options = {}) {
        const entry = { timestamp: Date.now(), name, level: "warn" };
        setIfDefined(entry, "durationMs", options.durationMs);
        setIfDefined(entry, "error", options.error);
        setIfDefined(entry, "context", options.context);
        log(entry);
    },
    error(name, options = {}) {
        const entry = { timestamp: Date.now(), name, level: "error" };
        setIfDefined(entry, "error", options.error);
        setIfDefined(entry, "context", options.context);
        log(entry);
    },
};
export function getLogs() {
    return read();
}
export function clearLogs() {
    localStorage.removeItem(STORAGE_KEY);
}
//# sourceMappingURL=logger.js.map