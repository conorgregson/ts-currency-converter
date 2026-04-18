export type AppConfig = {
  USE_CACHE: boolean;
  LOG_ERRORS: boolean;
  SHOW_RATE_PREVIEW: boolean;
  DEBUG_PANEL: boolean;
  API_BASE: string;
  TIMEOUT_MS: number;
  CACHE_TTL_MS: number;
  VERSION: string;
};

export const CONFIG: AppConfig = {
  USE_CACHE: true,
  LOG_ERRORS: true,
  SHOW_RATE_PREVIEW: true,
  DEBUG_PANEL: true,
  API_BASE: "https://api.frankfurter.dev/v1",
  TIMEOUT_MS: 5000,
  CACHE_TTL_MS: 24 * 60 * 60 * 1000, // 1 day
  VERSION: "1.0.0",
} as const;
