import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  useCompleteGoogleOAuth,
  useStartGoogleOAuth,
} from "@/features/auth/hooks/use-google-oauth";
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

// Mock window.location
const originalLocation = window.location;

// Get mocked router
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

describe("useStartGoogleOAuth", () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
      },
    });

    // Mock window.location
    Object.defineProperty(window, "location", {
      value: {
        ...originalLocation,
        origin: "http://localhost:3000",
        href: "http://localhost:3000/login",
      },
      writable: true,
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    server.resetHandlers();
    queryClient.clear();
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });

  it("starts OAuth flow and redirects to Google", async () => {
    const authUrl = "https://accounts.google.com/oauth/authorize?client_id=123&state=abc";

    server.use(
      http.post(`${API_URL}/auth/v1/google/start`, () => {
        return HttpResponse.json({
          authorization_url: authUrl,
          state: "abc123",
        });
      }),
    );

    const { result } = renderHook(() => useStartGoogleOAuth(), { wrapper });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Should redirect to Google OAuth
    expect(window.location.href).toBe(authUrl);
  });

  it("shows error toast on failure", async () => {
    const { toast } = await import("sonner");

    server.use(
      http.post(`${API_URL}/auth/v1/google/start`, () => {
        return HttpResponse.json({ detail: "OAuth configuration error" }, { status: 500 });
      }),
    );

    const { result } = renderHook(() => useStartGoogleOAuth(), { wrapper });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(toast.error).toHaveBeenCalledWith("Failed to start authentication", expect.any(Object));
  });

  it("uses correct redirect URI", async () => {
    let capturedBody: unknown;

    server.use(
      http.post(`${API_URL}/auth/v1/google/start`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          authorization_url: "https://google.com/oauth",
          state: "state123",
        });
      }),
    );

    const { result } = renderHook(() => useStartGoogleOAuth(), { wrapper });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(capturedBody).toEqual({
      redirect_uri: "http://localhost:3000/callback",
    });
  });
});

describe("useCompleteGoogleOAuth", () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const mockOAuthResponse = {
    user: {
      id: "user-123",
      email: "test@example.com",
      full_name: "Test User",
      role: "user",
      status: "active",
    },
    fixads_token: {
      access_token: "access-token-123",
      refresh_token: "refresh-token-123",
      token_type: "bearer",
      expires_in: 3600,
    },
    google_ads: {
      has_access: true,
      refresh_token: "google-ads-refresh-token",
    },
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
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

  it("completes OAuth and sets auth state", async () => {
    server.use(
      http.post(`${API_URL}/auth/v1/google/callback`, () => {
        return HttpResponse.json(mockOAuthResponse);
      }),
    );

    const { result } = renderHook(() => useCompleteGoogleOAuth(), { wrapper });

    await act(async () => {
      result.current.mutate({
        code: "auth-code-123",
        state: "state-123",
        redirect_uri: "http://localhost:3000/callback",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Auth state should be set
    const authState = useAuthStore.getState();
    expect(authState.isAuthenticated).toBe(true);
    expect(authState.accessToken).toBe("access-token-123");
    expect(authState.refreshToken).toBe("refresh-token-123");
    expect(authState.googleAdsRefreshToken).toBe("google-ads-refresh-token");
    expect(authState.user?.email).toBe("test@example.com");

    // Should redirect to home
    expect(mockRouter.replace).toHaveBeenCalledWith("/");
  });

  it("handles response without Google Ads access", async () => {
    const responseWithoutGoogleAds = {
      ...mockOAuthResponse,
      google_ads: {
        has_access: false,
      },
    };

    server.use(
      http.post(`${API_URL}/auth/v1/google/callback`, () => {
        return HttpResponse.json(responseWithoutGoogleAds);
      }),
    );

    const { result } = renderHook(() => useCompleteGoogleOAuth(), { wrapper });

    await act(async () => {
      result.current.mutate({
        code: "auth-code-123",
        state: "state-123",
        redirect_uri: "http://localhost:3000/callback",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Google Ads token should not be set
    expect(useAuthStore.getState().googleAdsRefreshToken).toBeNull();
  });

  it("shows success toast with Google Ads access", async () => {
    const { toast } = await import("sonner");

    server.use(
      http.post(`${API_URL}/auth/v1/google/callback`, () => {
        return HttpResponse.json(mockOAuthResponse);
      }),
    );

    const { result } = renderHook(() => useCompleteGoogleOAuth(), { wrapper });

    await act(async () => {
      result.current.mutate({
        code: "auth-code-123",
        state: "state-123",
        redirect_uri: "http://localhost:3000/callback",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(toast.success).toHaveBeenCalledWith("Welcome back!", {
      description: "Signed in as test@example.com with Google Ads access",
    });
  });

  it("shows success toast without Google Ads access", async () => {
    const { toast } = await import("sonner");

    const responseWithoutGoogleAds = {
      ...mockOAuthResponse,
      google_ads: { has_access: false },
    };

    server.use(
      http.post(`${API_URL}/auth/v1/google/callback`, () => {
        return HttpResponse.json(responseWithoutGoogleAds);
      }),
    );

    const { result } = renderHook(() => useCompleteGoogleOAuth(), { wrapper });

    await act(async () => {
      result.current.mutate({
        code: "auth-code-123",
        state: "state-123",
        redirect_uri: "http://localhost:3000/callback",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(toast.success).toHaveBeenCalledWith("Welcome back!", {
      description: "Signed in as test@example.com",
    });
  });

  it("shows error toast and redirects to login on failure", async () => {
    const { toast } = await import("sonner");

    server.use(
      http.post(`${API_URL}/auth/v1/google/callback`, () => {
        return HttpResponse.json({ detail: "Invalid OAuth code" }, { status: 400 });
      }),
    );

    const { result } = renderHook(() => useCompleteGoogleOAuth(), { wrapper });

    await act(async () => {
      result.current.mutate({
        code: "invalid-code",
        state: "state-123",
        redirect_uri: "http://localhost:3000/callback",
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(toast.error).toHaveBeenCalledWith("Authentication failed", expect.any(Object));
    expect(mockRouter.replace).toHaveBeenCalledWith("/login");
  });

  it("invalidates user query on success", async () => {
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    server.use(
      http.post(`${API_URL}/auth/v1/google/callback`, () => {
        return HttpResponse.json(mockOAuthResponse);
      }),
    );

    const { result } = renderHook(() => useCompleteGoogleOAuth(), { wrapper });

    await act(async () => {
      result.current.mutate({
        code: "auth-code-123",
        state: "state-123",
        redirect_uri: "http://localhost:3000/callback",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["user"] });
  });
});
