import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  useConnectAccount,
  useDisconnectAccount,
  useExchangeCodeForTokens,
  useGetAccessibleCustomers,
  useStartConnectAccount,
} from "@/features/accounts/hooks/use-connect-account";
import type { GoogleAdsAccount } from "@/features/accounts/types";
import { server } from "../../../utils/mocks/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// Mock window.location
const mockLocation = {
  origin: "http://localhost:3000",
  href: "",
};

Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockAccount: GoogleAdsAccount = {
  id: "acc-1",
  customer_id: "1234567890",
  descriptive_name: "Test Account",
  status: "active",
};

describe("useConnectAccount hooks", () => {
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
        mutations: {
          retry: false,
        },
      },
    });
    mockLocation.href = "";
    vi.clearAllMocks();
  });

  afterEach(() => {
    server.resetHandlers();
    queryClient.clear();
  });

  describe("useStartConnectAccount", () => {
    it("starts OAuth flow and redirects on success", async () => {
      const authUrl = "https://accounts.google.com/oauth?client_id=xxx";
      server.use(
        http.post(`${API_URL}/google-ads/v1/oauth/start`, () => {
          return HttpResponse.json({
            authorization_url: authUrl,
            state: "random-state-123",
          });
        }),
      );

      const { result } = renderHook(() => useStartConnectAccount(), { wrapper });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockLocation.href).toBe(authUrl);
    });

    it("shows error toast on failure", async () => {
      const { toast } = await import("sonner");
      server.use(
        http.post(`${API_URL}/google-ads/v1/oauth/start`, () => {
          return HttpResponse.json({ detail: "OAuth start failed" }, { status: 500 });
        }),
      );

      const { result } = renderHook(() => useStartConnectAccount(), { wrapper });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith(
        "Failed to start account connection",
        expect.objectContaining({ description: expect.any(String) }),
      );
    });
  });

  describe("useExchangeCodeForTokens", () => {
    it("exchanges code for tokens successfully", async () => {
      server.use(
        http.post(`${API_URL}/google-ads/v1/oauth/callback`, () => {
          return HttpResponse.json({
            access_token: "access-token-123",
            refresh_token: "refresh-token-456",
            expires_in: 3600,
            token_type: "Bearer",
          });
        }),
      );

      const { result } = renderHook(() => useExchangeCodeForTokens(), { wrapper });

      result.current.mutate({
        code: "auth-code",
        state: "state-123",
        redirect_uri: "http://localhost:3000/callback",
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.refresh_token).toBe("refresh-token-456");
    });

    it("shows error toast on failure", async () => {
      const { toast } = await import("sonner");
      server.use(
        http.post(`${API_URL}/google-ads/v1/oauth/callback`, () => {
          return HttpResponse.json({ detail: "Invalid code" }, { status: 400 });
        }),
      );

      const { result } = renderHook(() => useExchangeCodeForTokens(), { wrapper });

      result.current.mutate({
        code: "invalid-code",
        state: "state",
        redirect_uri: "http://localhost:3000/callback",
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith(
        "Failed to exchange authorization code",
        expect.objectContaining({ description: expect.any(String) }),
      );
    });
  });

  describe("useGetAccessibleCustomers", () => {
    it("fetches accessible customers successfully", async () => {
      const customers = [
        {
          customer_id: "111",
          descriptive_name: "Account 1",
          is_manager: false,
          can_manage_clients: false,
        },
        {
          customer_id: "222",
          descriptive_name: "Account 2",
          is_manager: true,
          can_manage_clients: true,
        },
      ];

      server.use(
        http.get(`${API_URL}/google-ads/v1/customers`, () => {
          return HttpResponse.json({ customers });
        }),
      );

      const { result } = renderHook(() => useGetAccessibleCustomers(), { wrapper });

      result.current.mutate("refresh-token-123");

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.customers).toHaveLength(2);
      expect(result.current.data?.customers[0].customer_id).toBe("111");
    });

    it("shows error toast on failure", async () => {
      const { toast } = await import("sonner");
      server.use(
        http.get(`${API_URL}/google-ads/v1/customers`, () => {
          return HttpResponse.json({ detail: "Invalid token" }, { status: 401 });
        }),
      );

      const { result } = renderHook(() => useGetAccessibleCustomers(), { wrapper });

      result.current.mutate("invalid-token");

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith(
        "Failed to list accessible accounts",
        expect.objectContaining({ description: expect.any(String) }),
      );
    });
  });

  describe("useConnectAccount", () => {
    it("connects account successfully", async () => {
      server.use(
        http.post(`${API_URL}/google-ads/v1/accounts`, () => {
          return HttpResponse.json(mockAccount);
        }),
        http.get(`${API_URL}/google-ads/v1/accounts`, () => {
          return HttpResponse.json([mockAccount]);
        }),
      );

      const { result } = renderHook(() => useConnectAccount(), { wrapper });

      result.current.mutate({
        customer_id: "1234567890",
        refresh_token: "token-123",
        login_customer_id: "manager-id",
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockAccount);
    });

    it("shows success toast after connecting", async () => {
      const { toast } = await import("sonner");
      server.use(
        http.post(`${API_URL}/google-ads/v1/accounts`, () => {
          return HttpResponse.json(mockAccount);
        }),
        http.get(`${API_URL}/google-ads/v1/accounts`, () => {
          return HttpResponse.json([mockAccount]);
        }),
      );

      const { result } = renderHook(() => useConnectAccount(), { wrapper });

      result.current.mutate({
        customer_id: "1234567890",
        refresh_token: "token-123",
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(toast.success).toHaveBeenCalledWith(
        "Account connected successfully",
        expect.objectContaining({ description: expect.stringContaining("Test Account") }),
      );
    });

    it("shows error toast on failure", async () => {
      const { toast } = await import("sonner");

      server.use(
        http.post(`${API_URL}/google-ads/v1/accounts`, () => {
          return HttpResponse.json({ detail: "Connection failed" }, { status: 501 });
        }),
        http.get(`${API_URL}/google-ads/v1/accounts`, () => {
          return HttpResponse.json([]);
        }),
      );

      const { result } = renderHook(() => useConnectAccount(), { wrapper });

      result.current.mutate({
        customer_id: "1234567890",
        refresh_token: "token-123",
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith(
        "Failed to connect account",
        expect.objectContaining({ description: expect.any(String) }),
      );
    });
  });

  describe("useDisconnectAccount", () => {
    it("disconnects account successfully", async () => {
      server.use(
        http.delete(`${API_URL}/google-ads/v1/accounts/acc-1`, () => {
          return HttpResponse.json({ message: "Disconnected" });
        }),
        http.get(`${API_URL}/google-ads/v1/accounts`, () => {
          return HttpResponse.json([]);
        }),
      );

      const { result } = renderHook(() => useDisconnectAccount(), { wrapper });

      result.current.mutate("acc-1");

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it("shows success toast after disconnecting", async () => {
      const { toast } = await import("sonner");
      server.use(
        http.delete(`${API_URL}/google-ads/v1/accounts/acc-1`, () => {
          return HttpResponse.json({ message: "Disconnected" });
        }),
        http.get(`${API_URL}/google-ads/v1/accounts`, () => {
          return HttpResponse.json([]);
        }),
      );

      const { result } = renderHook(() => useDisconnectAccount(), { wrapper });

      result.current.mutate("acc-1");

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(toast.success).toHaveBeenCalledWith("Account disconnected");
    });

    it("shows error toast on disconnect failure", async () => {
      const { toast } = await import("sonner");

      server.use(
        http.delete(`${API_URL}/google-ads/v1/accounts/acc-1`, () => {
          return HttpResponse.json({ detail: "Cannot disconnect" }, { status: 400 });
        }),
        http.get(`${API_URL}/google-ads/v1/accounts`, () => {
          return HttpResponse.json([mockAccount]);
        }),
      );

      const { result } = renderHook(() => useDisconnectAccount(), { wrapper });

      result.current.mutate("acc-1");

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith(
        "Failed to disconnect account",
        expect.objectContaining({ description: expect.any(String) }),
      );
    });
  });
});
