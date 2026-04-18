type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const CACHE_NAMESPACE = "tscc:"; // TypeScript Currency Converter

function hasStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

function makeKey(key: string): string {
  return `${CACHE_NAMESPACE}${key}`;
}

function isExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}

export function getCache<T>(key: string): T | null {
  if (!hasStorage()) return null;

  try {
    const raw = localStorage.getItem(makeKey(key));
    if (!raw) return null;

    const entry = JSON.parse(raw) as CacheEntry<unknown>;

    if (
      !entry ||
      typeof entry !== "object" ||
      typeof (entry as CacheEntry<T>).expiresAt !== "number"
    ) {
      localStorage.removeItem(makeKey(key));
      return null;
    }

    if (isExpired((entry as CacheEntry<T>).expiresAt)) {
      localStorage.removeItem(makeKey(key));
      return null;
    }

    return (entry as CacheEntry<T>).value as T;
  } catch {
    try {
      localStorage.removeItem(makeKey(key));
    } catch {
      /* ignore cleanup errors */
    }
    return null;
  }
}

export function setCache<T>(key: string, value: T, ttlMs: number): void {
  if (!hasStorage()) return;

  const entry: CacheEntry<T> = {
    value,
    expiresAt: Date.now() + Math.max(0, ttlMs),
  };

  try {
    localStorage.setItem(makeKey(key), JSON.stringify(entry));
  } catch {
    /* ignore quota errors or disabled storage */
  }
}

export function deleteCache(key: string): void {
  if (!hasStorage()) return;
  try {
    localStorage.removeItem(makeKey(key));
  } catch {
    /* ignore */
  }
}

export function clearCacheNamespace(): void {
  if (!hasStorage()) return;

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (storageKey && storageKey.startsWith(CACHE_NAMESPACE)) {
        keysToRemove.push(storageKey);
      }
    }
    for (const storageKey of keysToRemove) {
      localStorage.removeItem(storageKey);
    }
  } catch {
    /* ignore */
  }
}
