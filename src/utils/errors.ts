export type AppError =
  | { kind: "Network"; message: string; details?: unknown }
  | { kind: "Timeout"; message: string; timeoutMs: number; details?: unknown }
  | { kind: "Http"; message: string; status: number; details?: unknown }
  | { kind: "Api"; message: string; details?: unknown }
  | { kind: "Parse"; message: string; details?: unknown }
  | { kind: "Validation"; message: string; details?: unknown }
  | { kind: "Unknown"; message: string; details?: unknown };

export const error = {
  network: (message = "Network error", details?: unknown): AppError => ({
    kind: "Network",
    message,
    details,
  }),

  timeout: (
    timeoutMs: number,
    message = "Request timed out",
    details?: unknown,
  ): AppError => ({
    kind: "Timeout",
    message,
    timeoutMs,
    details,
  }),

  http: (
    status: number,
    message = `HTTP ${status}`,
    details?: unknown,
  ): AppError => ({
    kind: "Http",
    status,
    message,
    details,
  }),

  api: (message: string, details?: unknown): AppError => ({
    kind: "Api",
    message,
    details,
  }),

  parse: (message: string, details?: unknown): AppError => ({
    kind: "Parse",
    message,
    details,
  }),

  validation: (message: string, details?: unknown): AppError => ({
    kind: "Validation",
    message,
    details,
  }),

  unknown: (message = "Unknown error", details?: unknown): AppError => ({
    kind: "Unknown",
    message,
    details,
  }),
};
