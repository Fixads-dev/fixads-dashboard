import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import type { User } from "@/features/auth/types";
import { server } from "../../../utils/mocks/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const mockUser: User = {
  id: "user-123",
  email: "test@example.com",
  full_name: "Test User",
  role: "user",
  status: "active",
};

describe("useCurrentUser", () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });

    // Reset auth store
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      googleAdsRefreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    server.resetHandlers();
    queryClient.clear();
  });

  it("fetches current user when authenticated", async () => {
    // Set authenticated state
    useAuthStore.setState({
      isAuthenticated: true,
      accessToken: "test-token",
    });

    server.use(
      http.get(`${API_URL}/auth/v1/me`, () => {
        return HttpResponse.json(mockUser);
      }),
    );

    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockUser);
  });

  it("does not fetch when not authenticated", () => {
    useAuthStore.setState({
      isAuthenticated: false,
      accessToken: null,
    });

    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    // Query should not be enabled
    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.data).toBeUndefined();
  });

  it("does not fetch when authenticated but no token", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      accessToken: null,
    });

    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
  });

  it("logs out on 401 error via retry callback", async () => {
    // Create a new query client that allows retry to test the retry callback
    const retryQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          gcTime: 0,
          // Allow the hook's retry logic to run
          retry: 1,
        },
      },
    });

    const retryWrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={retryQueryClient}>{children}</QueryClientProvider>
    );

    useAuthStore.setState({
      isAuthenticated: true,
      accessToken: "test-token",
    });

    server.use(
      http.get(`${API_URL}/auth/v1/me`, () => {
        return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
      }),
    );

    const { result } = renderHook(() => useCurrentUser(), { wrapper: retryWrapper });

    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 5000 },
    );

    // The retry callback should have triggered logout on 401
    expect(useAuthStore.getState().isAuthenticated).toBe(false);

    retryQueryClient.clear();
  });

  it("is not stale after successful fetch", async () => {
    useAuthStore.setState({
      isAuthenticated: true,
      accessToken: "test-token",
    });

    server.use(
      http.get(`${API_URL}/auth/v1/me`, () => {
        return HttpResponse.json(mockUser);
      }),
    );

    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    // Wait for the data to be fetched
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // After successful fetch, data should not be stale (within 5 minute stale time)
    expect(result.current.isStale).toBe(false);
  });
});
