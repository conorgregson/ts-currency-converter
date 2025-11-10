/**
 * config.ts — global application configuration
 *
 * Purpose:
 *  Centralized configuration flags and constants controlling runtime behavior.
 *  These values can be toggled for development, debugging, or performance tuning.
 *
 * Example:
 *  if (CONFIG.DEBUG_PANEL) initDebugPanel();
 *  if (CONFIG.USE_CACHE) setCache("currencies", data, CONFIG.CACHE_TTL_MS);
 */
/**
 * Default runtime configuration.
 * In a real-world app, this could vary by environment (dev/staging/prod).
 */
export const CONFIG = {
    USE_CACHE: true,
    LOG_ERRORS: true,
    SHOW_RATE_PREVIEW: true,
    DEBUG_PANEL: true,
    API_BASE: "https://api.frankfurter.app",
    TIMEOUT_MS: 5000,
    CACHE_TTL_MS: 24 * 60 * 60 * 1000, // 1 day
    VERSION: "1.0.0",
};
//# sourceMappingURL=config.js.map