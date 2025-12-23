import { HttpResponse, http } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "../../utils/mocks/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// Mock getAuthStore before importing client
const mockAuthStore = {
  accessToken: "test-access-token",
  refreshToken: "test-refresh-token",
  refresh: vi.fn(),
  logout: vi.fn(),
};

vi.mock("@/features/auth", () => ({
  getAuthStore: () => mockAuthStore,
}));

// Import after mocking
import {
  api,
  apiClient,
  apiMethods,
  authClient,
  CircuitBreakerOpenError,
  getCircuitBreakerStats,
  resetCircuitBreaker,
} from "@/shared/api/client";

describe("API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetCircuitBreaker();
    mockAuthStore.accessToken = "test-access-token";
    mockAuthStore.refresh.mockResolvedValue(true);
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe("apiClient", () => {
    it("makes successful GET request", async () => {
      server.use(
        http.get(`${API_URL}/test-endpoint`, () => {
          return HttpResponse.json({ success: true, data: "test" });
        }),
      );

      const response = await apiClient.get("test-endpoint").json();
      expect(response).toEqual({ success: true, data: "test" });
    });

    it("makes successful POST request with JSON body", async () => {
      server.use(
        http.post(`${API_URL}/test-endpoint`, async ({ request }) => {
          const body = await request.json();
          return HttpResponse.json({ received: body });
        }),
      );

      const response = await apiClient.post("test-endpoint", { json: { name: "test" } }).json();
      expect(response).toEqual({ received: { name: "test" } });
    });

    it("includes Authorization header when token exists", async () => {
      let capturedAuth: string | null = null;

      server.use(
        http.get(`${API_URL}/test-auth`, ({ request }) => {
          capturedAuth = request.headers.get("Authorization");
          return HttpResponse.json({ ok: true });
        }),
      );

      await apiClient.get("test-auth").json();
      expect(capturedAuth).toBe("Bearer test-access-token");
    });

    it("does not include Authorization header when token is empty", async () => {
      mockAuthStore.accessToken = "";
      let capturedAuth: string | null = null;

      server.use(
        http.get(`${API_URL}/test-no-auth`, ({ request }) => {
          capturedAuth = request.headers.get("Authorization");
          return HttpResponse.json({ ok: true });
        }),
      );

      await apiClient.get("test-no-auth").json();
      expect(capturedAuth).toBeNull();
    });
  });

  describe("api helper", () => {
    it("returns typed JSON response", async () => {
      interface TestResponse {
        id: number;
        name: string;
      }

      server.use(
        http.get(`${API_URL}/typed-endpoint`, () => {
          return HttpResponse.json({ id: 1, name: "test" });
        }),
      );

      const response = await api<TestResponse>("typed-endpoint");
      expect(response.id).toBe(1);
      expect(response.name).toBe("test");
    });
  });

  describe("apiMethods", () => {
    it("get() makes GET request", async () => {
      server.use(
        http.get(`${API_URL}/api/resource`, () => {
          return HttpResponse.json({ method: "GET" });
        }),
      );

      const response = await apiMethods.get<{ method: string }>("api/resource");
      expect(response.method).toBe("GET");
    });

    it("post() makes POST request with data", async () => {
      server.use(
        http.post(`${API_URL}/api/resource`, async ({ request }) => {
          const body = await request.json();
          return HttpResponse.json({ method: "POST", body });
        }),
      );

      const response = await apiMethods.post<{ method: string; body: unknown }>("api/resource", {
        data: "test",
      });
      expect(response.method).toBe("POST");
      expect(response.body).toEqual({ data: "test" });
    });

    it("put() makes PUT request with data", async () => {
      server.use(
        http.put(`${API_URL}/api/resource`, async ({ request }) => {
          const body = await request.json();
          return HttpResponse.json({ method: "PUT", body });
        }),
      );

      const response = await apiMethods.put<{ method: string; body: unknown }>("api/resource", {
        data: "updated",
      });
      expect(response.method).toBe("PUT");
      expect(response.body).toEqual({ data: "updated" });
    });

    it("patch() makes PATCH request with data", async () => {
      server.use(
        http.patch(`${API_URL}/api/resource`, async ({ request }) => {
          const body = await request.json();
          return HttpResponse.json({ method: "PATCH", body });
        }),
      );

      const response = await apiMethods.patch<{ method: string; body: unknown }>("api/resource", {
        field: "value",
      });
      expect(response.method).toBe("PATCH");
      expect(response.body).toEqual({ field: "value" });
    });

    it("delete() makes DELETE request", async () => {
      server.use(
        http.delete(`${API_URL}/api/resource/123`, () => {
          return HttpResponse.json({ method: "DELETE", deleted: true });
        }),
      );

      const response = await apiMethods.delete<{ method: string; deleted: boolean }>(
        "api/resource/123",
      );
      expect(response.method).toBe("DELETE");
      expect(response.deleted).toBe(true);
    });
  });

  describe("error handling", () => {
    it("extracts detail from Problem JSON response", async () => {
      server.use(
        http.get(`${API_URL}/error-detail`, () => {
          return HttpResponse.json(
            { detail: "Resource not found", type: "about:blank", status: 404 },
            { status: 404 },
          );
        }),
      );

      await expect(apiClient.get("error-detail").json()).rejects.toThrow("Resource not found");
    });

    it("extracts message when detail is not present", async () => {
      server.use(
        http.get(`${API_URL}/error-message`, () => {
          return HttpResponse.json({ message: "Legacy error message" }, { status: 400 });
        }),
      );

      await expect(apiClient.get("error-message").json()).rejects.toThrow("Legacy error message");
    });

    it("attaches error_code to error object", async () => {
      server.use(
        http.get(`${API_URL}/error-code`, () => {
          return HttpResponse.json(
            { detail: "Validation failed", error_code: "VALIDATION_ERROR" },
            { status: 422 },
          );
        }),
      );

      try {
        await apiClient.get("error-code").json();
        expect.fail("Should have thrown");
      } catch (error: unknown) {
        expect((error as { errorCode?: string }).errorCode).toBe("VALIDATION_ERROR");
      }
    });

    it("handles non-JSON error responses", async () => {
      server.use(
        http.get(`${API_URL}/error-text`, () => {
          return new HttpResponse("Internal Server Error", {
            status: 501, // Use 501 to avoid ky retries
            headers: { "Content-Type": "text/plain" },
          });
        }),
      );

      // Should not throw when parsing fails, just use default error
      await expect(apiClient.get("error-text").json()).rejects.toThrow();
    });
  });

  describe("401 handling and token refresh", () => {
    it("refreshes token on 401 and retries request", async () => {
      let callCount = 0;

      server.use(
        http.get(`${API_URL}/protected`, () => {
          callCount++;
          if (callCount === 1) {
            return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
          }
          return HttpResponse.json({ data: "success" });
        }),
      );

      mockAuthStore.refresh.mockImplementation(async () => {
        mockAuthStore.accessToken = "new-access-token";
        return true;
      });

      const response = await apiClient.get("protected").json();
      expect(response).toEqual({ data: "success" });
      expect(mockAuthStore.refresh).toHaveBeenCalledOnce();
    });

    it("logs out user when refresh fails", async () => {
      server.use(
        http.get(`${API_URL}/protected-fail`, () => {
          return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
        }),
      );

      mockAuthStore.refresh.mockResolvedValue(false);

      await expect(apiClient.get("protected-fail").json()).rejects.toThrow();
      expect(mockAuthStore.logout).toHaveBeenCalled();
    });
  });

  describe("circuit breaker integration", () => {
    it("records success for 2xx responses", async () => {
      server.use(
        http.get(`${API_URL}/success`, () => {
          return HttpResponse.json({ ok: true });
        }),
      );

      await apiClient.get("success").json();

      const stats = getCircuitBreakerStats();
      expect(stats.successCount).toBeGreaterThan(0);
    });

    it("records success for 4xx responses (client errors)", async () => {
      server.use(
        http.get(`${API_URL}/client-error`, () => {
          return HttpResponse.json({ error: "Bad request" }, { status: 400 });
        }),
      );

      try {
        await apiClient.get("client-error").json();
      } catch {
        // Expected to throw
      }

      const stats = getCircuitBreakerStats();
      expect(stats.state).toBe("CLOSED"); // Should not open on 4xx
    });

    it("records failure for 5xx responses", async () => {
      // Use 501 which doesn't trigger ky's retry logic
      server.use(
        http.get(`${API_URL}/server-error`, () => {
          return HttpResponse.json({ error: "Server error" }, { status: 501 });
        }),
      );

      try {
        await apiClient.get("server-error").json();
      } catch {
        // Expected to throw
      }

      const stats = getCircuitBreakerStats();
      expect(stats.failureCount).toBeGreaterThan(0);
    });

    it("throws CircuitBreakerOpenError when circuit is open", async () => {
      // Open the circuit by recording failures
      // Use status 501 which doesn't trigger ky's retry logic (only 500, 502, 503, 504 retry)
      for (let i = 0; i < 5; i++) {
        server.use(
          http.get(`${API_URL}/fail-${i}`, () => {
            return HttpResponse.json({ error: "Server error" }, { status: 501 });
          }),
        );

        try {
          await apiClient.get(`fail-${i}`).json();
        } catch {
          // Expected
        }
      }

      // Now circuit should be open - this throws before making HTTP request
      await expect(apiClient.get("any-endpoint").json()).rejects.toThrow(CircuitBreakerOpenError);
    });
  });

  describe("getCircuitBreakerStats", () => {
    it("returns current circuit breaker stats", () => {
      const stats = getCircuitBreakerStats();

      expect(stats).toHaveProperty("state");
      expect(stats).toHaveProperty("failureCount");
      expect(stats).toHaveProperty("successCount");
      expect(stats).toHaveProperty("lastFailureTime");
      expect(stats).toHaveProperty("halfOpenCalls");
    });
  });

  describe("resetCircuitBreaker", () => {
    it("resets circuit breaker to closed state", async () => {
      // Open the circuit using 501 to avoid ky retries
      for (let i = 0; i < 5; i++) {
        server.use(
          http.get(`${API_URL}/reset-fail-${i}`, () => {
            return HttpResponse.json({ error: "Server error" }, { status: 501 });
          }),
        );

        try {
          await apiClient.get(`reset-fail-${i}`).json();
        } catch {
          // Expected
        }
      }

      expect(getCircuitBreakerStats().state).toBe("OPEN");

      resetCircuitBreaker();

      expect(getCircuitBreakerStats().state).toBe("CLOSED");
    });
  });

  describe("authClient", () => {
    it("makes request without auth interceptors", async () => {
      let capturedAuth: string | null = null;

      server.use(
        http.post(`${API_URL}/auth/token`, ({ request }) => {
          capturedAuth = request.headers.get("Authorization");
          return HttpResponse.json({ token: "new-token" });
        }),
      );

      await authClient.post("auth/token").json();

      // authClient should NOT add Authorization header
      expect(capturedAuth).toBeNull();
    });
  });
});

describe("CircuitBreakerOpenError re-export", () => {
  it("is exported from client module", () => {
    expect(CircuitBreakerOpenError).toBeDefined();
    expect(typeof CircuitBreakerOpenError).toBe("function");
  });
});
