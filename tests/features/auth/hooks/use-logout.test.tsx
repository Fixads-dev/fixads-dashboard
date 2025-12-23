import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { server } from "../../../utils/mocks/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Get mocked router from setup
const mockRouter = {
  replace: vi.fn(),
  push: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

describe("useLogout", () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Set up authenticated state
    useAuthStore.setState({
      user: { id: "user-1", email: "test@example.com", role: "user", status: "active" },
      accessToken: "test-token",
      refreshToken: "test-refresh-token",
      isAuthenticated: true,
      isLoading: false,
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    server.resetHandlers();
    queryClient.clear();
  });

  it("calls logout API and clears auth state on success", async () => {
    server.use(
      http.post(`${API_URL}/auth/v1/logout`, () => {
        return HttpResponse.json({ message: "Logged out successfully" });
      }),
    );

    const { result } = renderHook(() => useLogout(), { wrapper });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Auth state should be cleared
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();

    // Should redirect to login
    expect(mockRouter.replace).toHaveBeenCalledWith("/login");
  });

  it("clears auth state even when API call fails", async () => {
    server.use(
      http.post(`${API_URL}/auth/v1/logout`, () => {
        return HttpResponse.json({ error: "Server error" }, { status: 500 });
      }),
    );

    const { result } = renderHook(() => useLogout(), { wrapper });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true); // mutationFn catches errors
    });

    // Auth state should still be cleared
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(mockRouter.replace).toHaveBeenCalledWith("/login");
  });

  it("clears query client cache", async () => {
    // Add some data to the cache
    queryClient.setQueryData(["user"], { id: "user-1" });
    queryClient.setQueryData(["accounts"], [{ id: "account-1" }]);

    server.use(
      http.post(`${API_URL}/auth/v1/logout`, () => {
        return HttpResponse.json({ message: "Logged out" });
      }),
    );

    const { result } = renderHook(() => useLogout(), { wrapper });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Cache should be cleared
    expect(queryClient.getQueryData(["user"])).toBeUndefined();
    expect(queryClient.getQueryData(["accounts"])).toBeUndefined();
  });

  it("returns mutation state correctly", () => {
    const { result } = renderHook(() => useLogout(), { wrapper });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(typeof result.current.mutate).toBe("function");
    expect(typeof result.current.mutateAsync).toBe("function");
  });
});
