/**
 * cache.ts — lightweight JSON cache with TTL on top of localStorage
 *
 * Purpose:
 *  - Provide a tiny, type-safe cache layer for fetched data (e.g., currencies list).
 *  - Automatically expires entries based on TTL (time-to-live).
 *  - Namespaced to avoid collisions with other localStorage data.
 *
 * Example:
 *  setCache("currencies", data, 24 * 60 * 60 * 1000);  // 24h TTL
 *  const cached = getCache<CurrenciesResponse>("currencies");
 *
 * Behavior:
 *  - Expired or malformed entries are removed automatically.
 *  - Fails gracefully if localStorage is unavailable (e.g., SSR, privacy mode).
 */
/** Namespace prefix to avoid key collisions with other apps. */
const CACHE_NAMESPACE = "tscc:"; // TypeScript Currency Converter
// --- Internal helpers ---
/**
 * Returns true if localStorage is available and accessible.
 * Prevents runtime errors in server or restricted environments.
 */
function hasStorage() {
    try {
        return typeof window !== "undefined" && !!window.localStorage;
    }
    catch {
        return false;
    }
}
/** Builds a namespaced storage key. */
function makeKey(key) {
    return `${CACHE_NAMESPACE}${key}`;
}
/** True if the current time has passed the given expiration timestamp. */
function isExpired(expiresAt) {
    return Date.now() > expiresAt;
}
// --- Public API ---
/**
 * Reads a cached value by key.
 * Returns null if the entry is missing, expired, or invalid.
 *
 * @param key - logical cache key (without namespace)
 */
export function getCache(key) {
    if (!hasStorage())
        return null;
    try {
        const raw = localStorage.getItem(makeKey(key));
        if (!raw)
            return null;
        const entry = JSON.parse(raw);
        // Shape validation
        if (!entry ||
            typeof entry !== "object" ||
            typeof entry.expiresAt !== "number") {
            localStorage.removeItem(makeKey(key));
            return null;
        }
        // TTL check
        if (isExpired(entry.expiresAt)) {
            localStorage.removeItem(makeKey(key));
            return null;
        }
        return entry.value;
    }
    catch {
        // Parsing or access failure → act as cache miss
        try {
            localStorage.removeItem(makeKey(key));
        }
        catch {
            /* ignore cleanup errors */
        }
        return null;
    }
}
/**
 * Writes a value to cache with a specified TTL (milliseconds).
 * Overwrites any existing value under the same key.
 *
 * @param key - logical cache key (without namespace)
 * @param value - data to store (must be JSON-serializable)
 * @param ttlMs - time-to-live duration in milliseconds
 */
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
        // Ignore quota errors or disabled storage
    }
}
/**
 * Deletes a single cache entry by key.
 */
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
/**
 * Clears all entries in this app's cache namespace only.
 * Leaves unrelated localStorage keys intact.
 */
export function clearCacheNamespace() {
    if (!hasStorage())
        return;
    try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const storageKey = localStorage.key(i);
            if (storageKey && storageKey.startsWith(CACHE_NAMESPACE))
                keysToRemove.push(storageKey);
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