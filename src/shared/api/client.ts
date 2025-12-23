"use client";

import ky, { type HTTPError, type KyInstance, type Options } from "ky";
import { getAuthStore } from "@/features/auth";
import { CircuitBreaker, CircuitBreakerOpenError } from "@/shared/lib/circuit-breaker";

/**
 * Problem JSON response format (RFC 7807)
 * All backend services use this standardized format
 */
interface ProblemJsonResponse {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  error_code?: string;
  // Legacy field for backwards compatibility
  message?: string;
  // Validation errors
  errors?: Array<{ field: string; message: string; type: string }>;
}

/**
 * Extended error with error_code for programmatic handling
 */
export interface ApiError extends HTTPError {
  errorCode?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const REQUEST_TIMEOUT = 30000;

/**
 * Circuit breaker for API calls
 * Opens after 5 consecutive failures, attempts recovery after 30 seconds
 */
const apiCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 30000,
  halfOpenMaxCalls: 3,
});

/**
 * Mutex to prevent concurrent token refresh attempts
 * When multiple 401s occur simultaneously, only one refresh is executed
 */
let refreshPromise: Promise<boolean> | null = null;

async function refreshTokenWithMutex(): Promise<boolean> {
  // If a refresh is already in progress, wait for it
  if (refreshPromise) {
    return refreshPromise;
  }

  // Start a new refresh
  refreshPromise = getAuthStore()
    .refresh()
    .finally(() => {
      // Clear the mutex after refresh completes (success or failure)
      refreshPromise = null;
    });

  return refreshPromise;
}

/**
 * Check if error should trigger circuit breaker
 * Only server errors (5xx) and network errors count as failures
 */
function isCircuitBreakerFailure(status?: number): boolean {
  if (!status) return true; // Network error
  return status >= 500;
}

/**
 * Creates an authenticated ky instance with JWT token injection and refresh handling
 */
function createApiClient(): KyInstance {
  return ky.create({
    prefixUrl: API_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    retry: {
      limit: 2,
      methods: ["get", "head", "options"],
      statusCodes: [408, 429, 500, 502, 503, 504],
    },
    hooks: {
      beforeRequest: [
        (request) => {
          // Check circuit breaker before making request
          if (!apiCircuitBreaker.canExecute()) {
            const stats = apiCircuitBreaker.getStats();
            throw new CircuitBreakerOpenError(
              `API temporarily unavailable (${stats.failureCount} consecutive failures)`,
              stats,
            );
          }

          const { accessToken } = getAuthStore();
          if (accessToken) {
            request.headers.set("Authorization", `Bearer ${accessToken}`);
          }
        },
      ],
      afterResponse: [
        async (request, options, response) => {
          // Record success for circuit breaker (2xx-4xx responses)
          if (response.status < 500) {
            apiCircuitBreaker.recordSuccess();
          }

          if (response.status === 401) {
            // Use mutex to prevent race condition on concurrent 401s
            const refreshed = await refreshTokenWithMutex();

            if (refreshed) {
              // Retry the original request with new token
              const { accessToken } = getAuthStore();
              request.headers.set("Authorization", `Bearer ${accessToken}`);
              return ky(request, options);
            }

            // Refresh failed, logout user
            const authStore = getAuthStore();
            authStore.logout();
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
          }

          return response;
        },
      ],
      beforeError: [
        async (error) => {
          const { response } = error;

          // Record failure for circuit breaker (5xx or network errors)
          if (isCircuitBreakerFailure(response?.status)) {
            apiCircuitBreaker.recordFailure();
          }

          if (response) {
            try {
              // Clone response to avoid body consumption issues (ky v1.14.1)
              const clonedResponse = response.clone();
              const body = (await clonedResponse.json()) as ProblemJsonResponse;
              // Problem JSON format (RFC 7807): use 'detail' as the error message
              // Fall back to 'message' for backwards compatibility
              if (body && typeof body === "object") {
                if ("detail" in body && body.detail) {
                  error.message = String(body.detail);
                } else if ("message" in body && body.message) {
                  error.message = String(body.message);
                }
                // Attach error_code for programmatic error handling
                if ("error_code" in body && body.error_code) {
                  (error as ApiError).errorCode = String(body.error_code);
                }
              }
            } catch {
              // Response body is not JSON or already consumed
            }
          }
          return error;
        },
      ],
    },
  });
}

export const apiClient = createApiClient();

/**
 * Auth-specific ky instance without auth interceptors
 * Used for token refresh to avoid circular dependency with getAuthStore
 */
export const authClient = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
});

/**
 * Type-safe API request helper
 */
export async function api<T>(path: string, options?: Options): Promise<T> {
  return apiClient(path, options).json<T>();
}

/**
 * API methods for common operations
 */
export const apiMethods = {
  get: <T>(path: string, options?: Omit<Options, "method">) =>
    api<T>(path, { ...options, method: "get" }),

  post: <T>(path: string, data?: unknown, options?: Omit<Options, "method" | "json">) =>
    api<T>(path, { ...options, method: "post", json: data }),

  put: <T>(path: string, data?: unknown, options?: Omit<Options, "method" | "json">) =>
    api<T>(path, { ...options, method: "put", json: data }),

  patch: <T>(path: string, data?: unknown, options?: Omit<Options, "method" | "json">) =>
    api<T>(path, { ...options, method: "patch", json: data }),

  delete: <T>(path: string, options?: Omit<Options, "method">) =>
    api<T>(path, { ...options, method: "delete" }),
};

/**
 * Get circuit breaker statistics for monitoring
 */
export function getCircuitBreakerStats() {
  return apiCircuitBreaker.getStats();
}

/**
 * Manually reset circuit breaker (use sparingly)
 */
export function resetCircuitBreaker() {
  apiCircuitBreaker.reset();
}

// Re-export circuit breaker error for type checking
export { CircuitBreakerOpenError } from "@/shared/lib/circuit-breaker";
