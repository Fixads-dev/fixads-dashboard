"use client";

import ky, { type KyInstance, type Options } from "ky";
import { getAuthStore } from "@/features/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const REQUEST_TIMEOUT = 30000;

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
          const { accessToken } = getAuthStore();
          if (accessToken) {
            request.headers.set("Authorization", `Bearer ${accessToken}`);
          }
        },
      ],
      afterResponse: [
        async (request, options, response) => {
          if (response.status === 401) {
            const authStore = getAuthStore();
            const refreshed = await authStore.refresh();

            if (refreshed) {
              // Retry the original request with new token
              const { accessToken } = getAuthStore();
              request.headers.set("Authorization", `Bearer ${accessToken}`);
              return ky(request, options);
            }

            // Refresh failed, logout user
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
          if (response) {
            try {
              const body = await response.json();
              if (body && typeof body === "object" && "message" in body) {
                error.message = String(body.message);
              }
            } catch {
              // Response body is not JSON
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
