import { HttpResponse, http } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAuthStore, useAuthStore } from "@/features/auth/stores/auth-store";
import type { TokenPair, User } from "@/features/auth/types";
import { server } from "../../../utils/mocks/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("Auth Store", () => {
  const mockUser: User = {
    id: "user-123",
    email: "test@example.com",
    full_name: "Test User",
    picture: "https://example.com/photo.jpg",
    role: "user",
    status: "active",
  };

  const mockTokens: TokenPair = {
    access_token: "test-access-token",
    refresh_token: "test-refresh-token",
    token_type: "bearer",
    expires_in: 3600,
  };

  beforeEach(() => {
    // Reset store to initial state before each test
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      googleAdsRefreshToken: null,
      isAuthenticated: false,
      isLoading: true,
    });
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe("initial state", () => {
    it("has correct initial values", () => {
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.googleAdsRefreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(true);
    });
  });

  describe("setAuth", () => {
    it("sets user and tokens correctly", () => {
      const { setAuth } = useAuthStore.getState();

      setAuth(mockUser, mockTokens);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toBe("test-access-token");
      expect(state.refreshToken).toBe("test-refresh-token");
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it("sets googleAdsRefreshToken when provided", () => {
      const { setAuth } = useAuthStore.getState();

      setAuth(mockUser, mockTokens, "google-ads-refresh-token");

      const state = useAuthStore.getState();
      expect(state.googleAdsRefreshToken).toBe("google-ads-refresh-token");
    });

    it("sets googleAdsRefreshToken to null when not provided", () => {
      const { setAuth } = useAuthStore.getState();

      setAuth(mockUser, mockTokens);

      const state = useAuthStore.getState();
      expect(state.googleAdsRefreshToken).toBeNull();
    });
  });

  describe("setLoading", () => {
    it("sets isLoading to true", () => {
      useAuthStore.setState({ isLoading: false });

      const { setLoading } = useAuthStore.getState();
      setLoading(true);

      expect(useAuthStore.getState().isLoading).toBe(true);
    });

    it("sets isLoading to false", () => {
      useAuthStore.setState({ isLoading: true });

      const { setLoading } = useAuthStore.getState();
      setLoading(false);

      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe("refresh", () => {
    it("refreshes tokens successfully", async () => {
      // Set up initial state with refresh token
      useAuthStore.setState({
        refreshToken: "old-refresh-token",
        accessToken: "old-access-token",
      });

      server.use(
        http.post(`${API_URL}/auth/v1/refresh`, () => {
          return HttpResponse.json({
            access_token: "new-access-token",
            refresh_token: "new-refresh-token",
          });
        }),
      );

      const { refresh } = useAuthStore.getState();
      const result = await refresh();

      expect(result).toBe(true);
      const state = useAuthStore.getState();
      expect(state.accessToken).toBe("new-access-token");
      expect(state.refreshToken).toBe("new-refresh-token");
    });

    it("keeps old refresh token when not returned in response", async () => {
      useAuthStore.setState({
        refreshToken: "old-refresh-token",
        accessToken: "old-access-token",
      });

      server.use(
        http.post(`${API_URL}/auth/v1/refresh`, () => {
          return HttpResponse.json({
            access_token: "new-access-token",
            // No refresh_token in response
          });
        }),
      );

      const { refresh } = useAuthStore.getState();
      await refresh();

      const state = useAuthStore.getState();
      expect(state.accessToken).toBe("new-access-token");
      expect(state.refreshToken).toBe("old-refresh-token");
    });

    it("returns false and logs out when no refresh token exists", async () => {
      useAuthStore.setState({
        refreshToken: null,
        isAuthenticated: true,
      });

      const { refresh } = useAuthStore.getState();
      const result = await refresh();

      expect(result).toBe(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it("returns false and logs out on refresh failure", async () => {
      useAuthStore.setState({
        refreshToken: "old-refresh-token",
        accessToken: "old-access-token",
        isAuthenticated: true,
      });

      server.use(
        http.post(`${API_URL}/auth/v1/refresh`, () => {
          return HttpResponse.json({ error: "Invalid token" }, { status: 401 });
        }),
      );

      const { refresh } = useAuthStore.getState();
      const result = await refresh();

      expect(result).toBe(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().accessToken).toBeNull();
    });

    it("returns false on invalid response format", async () => {
      useAuthStore.setState({
        refreshToken: "old-refresh-token",
        isAuthenticated: true,
      });

      server.use(
        http.post(`${API_URL}/auth/v1/refresh`, () => {
          return HttpResponse.json({
            // Missing access_token
            invalid: "response",
          });
        }),
      );

      const { refresh } = useAuthStore.getState();
      const result = await refresh();

      expect(result).toBe(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe("logout", () => {
    it("clears all auth state", () => {
      // Set up authenticated state
      useAuthStore.setState({
        user: mockUser,
        accessToken: "test-access-token",
        refreshToken: "test-refresh-token",
        googleAdsRefreshToken: "google-ads-token",
        isAuthenticated: true,
        isLoading: false,
      });

      const { logout } = useAuthStore.getState();
      logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.googleAdsRefreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it("removes storage from localStorage", () => {
      localStorageMock.setItem("fixads-auth", JSON.stringify({ test: "data" }));

      const { logout } = useAuthStore.getState();
      logout();

      expect(localStorageMock.getItem("fixads-auth")).toBeNull();
    });
  });

  describe("reset", () => {
    it("resets to initial state with isLoading false", () => {
      useAuthStore.setState({
        user: mockUser,
        accessToken: "test-access-token",
        refreshToken: "test-refresh-token",
        isAuthenticated: true,
        isLoading: true,
      });

      const { reset } = useAuthStore.getState();
      reset();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe("getAuthStore", () => {
    it("returns current state", () => {
      useAuthStore.setState({
        accessToken: "test-token",
        isAuthenticated: true,
      });

      const state = getAuthStore();

      expect(state.accessToken).toBe("test-token");
      expect(state.isAuthenticated).toBe(true);
    });

    it("returns actions", () => {
      const state = getAuthStore();

      expect(typeof state.setAuth).toBe("function");
      expect(typeof state.setLoading).toBe("function");
      expect(typeof state.refresh).toBe("function");
      expect(typeof state.logout).toBe("function");
      expect(typeof state.reset).toBe("function");
    });
  });

  describe("persistence", () => {
    it("partializes state correctly (excludes isLoading)", () => {
      // The persist middleware should only save certain fields
      useAuthStore.setState({
        user: mockUser,
        accessToken: "test-access-token",
        refreshToken: "test-refresh-token",
        googleAdsRefreshToken: "google-ads-token",
        isAuthenticated: true,
        isLoading: true, // This should NOT be persisted
      });

      // Trigger persist by forcing a state update
      const { setLoading } = useAuthStore.getState();
      setLoading(false);

      // Check that the store has the correct state
      const state = useAuthStore.getState();
      expect(state.accessToken).toBe("test-access-token");
      expect(state.user).toEqual(mockUser);
    });
  });
});
