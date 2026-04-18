const CACHE_NAMESPACE = "tscc:"; // TypeScript Currency Converter
function hasStorage() {
    try {
        return typeof window !== "undefined" && !!window.localStorage;
    }
    catch {
        return false;
    }
}
function makeKey(key) {
    return `${CACHE_NAMESPACE}${key}`;
}
function isExpired(expiresAt) {
    return Date.now() > expiresAt;
}
export function getCache(key) {
    if (!hasStorage())
        return null;
    try {
        const raw = localStorage.getItem(makeKey(key));
        if (!raw)
            return null;
        const entry = JSON.parse(raw);
        if (!entry ||
            typeof entry !== "object" ||
            typeof entry.expiresAt !== "number") {
            localStorage.removeItem(makeKey(key));
            return null;
        }
        if (isExpired(entry.expiresAt)) {
            localStorage.removeItem(makeKey(key));
            return null;
        }
        return entry.value;
    }
    catch {
        try {
            localStorage.removeItem(makeKey(key));
        }
        catch {
            /* ignore cleanup errors */
        }
        return null;
    }
}
export function setCache(key, value, ttlMs) {
    if (!hasStorage())
        return;
    const entry = {
        value,
        expiresAt: Date.now() + Math.max(0, ttlMs),
    };
    try {
        localStorage.setItem(makeKey(key), JSON.stringify(entry));
    }
    catch {
        /* ignore quota errors or disabled storage */
    }
}
export function deleteCache(key) {
    if (!hasStorage())
        return;
    try {
        localStorage.removeItem(makeKey(key));
    }
    catch {
        /* ignore */
    }
}
export function clearCacheNamespace() {
    if (!hasStorage())
        return;
    try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const storageKey = localStorage.key(i);
            if (storageKey && storageKey.startsWith(CACHE_NAMESPACE)) {
                keysToRemove.push(storageKey);
            }
        }
        for (const storageKey of keysToRemove) {
            localStorage.removeItem(storageKey);
        }
    }
    catch {
        /* ignore */
    }
}
//# sourceMappingURL=cache.js.map