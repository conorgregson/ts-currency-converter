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

export type AppConfig = {
  /** Enable localStorage caching layer (see utils/cache.ts). */
  USE_CACHE: boolean;

  /** Log service or UI errors to the telemetry logger (for debug builds). */
  LOG_ERRORS: boolean;

  /** Show small 1-unit rate preview under main converter UI. */
  SHOW_RATE_PREVIEW: boolean;

  /** Enable in-app debug panel for telemetry inspection. */
  DEBUG_PANEL: boolean;

  /** Frankfurter API base URL. */
  API_BASE: string;

  /** Request timeout in milliseconds (per fetch). */
  TIMEOUT_MS: number;

  /** Default cache time-to-live for static data (e.g., currencies). */
  CACHE_TTL_MS: number;

  /** Application version (shown in debug panel or footer if desired). */
  VERSION: string;
};

/**
 * Default runtime configuration.
 * In a real-world app, this could vary by environment (dev/staging/prod).
 */
export const CONFIG: AppConfig = {
  USE_CACHE: true,
  LOG_ERRORS: true,
  SHOW_RATE_PREVIEW: true,
  DEBUG_PANEL: true,

  API_BASE: "https://api.frankfurter.app",
  TIMEOUT_MS: 5000,
  CACHE_TTL_MS: 24 * 60 * 60 * 1000, // 1 day
  VERSION: "1.0.0",
} as const;
