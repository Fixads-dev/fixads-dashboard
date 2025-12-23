import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useAccount, useAccounts } from "@/features/accounts/hooks/use-accounts";
import type { GoogleAdsAccount } from "@/features/accounts/types";
import { server } from "../../../utils/mocks/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const mockAccounts: GoogleAdsAccount[] = [
  {
    id: "acc-1",
    customer_id: "1234567890",
    descriptive_name: "Test Account 1",
    status: "active",
    currency_code: "USD",
    time_zone: "America/New_York",
  },
  {
    id: "acc-2",
    customer_id: "0987654321",
    descriptive_name: "Test Account 2",
    status: "inactive",
    is_manager: true,
  },
];

describe("useAccounts", () => {
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
  });

  afterEach(() => {
    server.resetHandlers();
    queryClient.clear();
  });

  describe("useAccounts", () => {
    it("fetches accounts successfully", async () => {
      server.use(
        http.get(`${API_URL}/google-ads/v1/accounts`, () => {
          return HttpResponse.json(mockAccounts);
        }),
      );

      const { result } = renderHook(() => useAccounts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockAccounts);
      expect(result.current.data).toHaveLength(2);
    });

    it("returns empty array when no accounts", async () => {
      server.use(
        http.get(`${API_URL}/google-ads/v1/accounts`, () => {
          return HttpResponse.json([]);
        }),
      );

      const { result } = renderHook(() => useAccounts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it("handles error response", async () => {
      server.use(
        http.get(`${API_URL}/google-ads/v1/accounts`, () => {
          return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 });
        }),
      );

      const { result } = renderHook(() => useAccounts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it("uses 2-minute stale time", async () => {
      server.use(
        http.get(`${API_URL}/google-ads/v1/accounts`, () => {
          return HttpResponse.json(mockAccounts);
        }),
      );

      const { result } = renderHook(() => useAccounts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Data should not be stale immediately after fetch
      expect(result.current.isStale).toBe(false);
    });
  });

  describe("useAccount", () => {
    it("fetches single account by ID", async () => {
      const accountId = "acc-1";
      server.use(
        http.get(`${API_URL}/google-ads/v1/accounts/${accountId}`, () => {
          return HttpResponse.json(mockAccounts[0]);
        }),
      );

      const { result } = renderHook(() => useAccount(accountId), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockAccounts[0]);
      expect(result.current.data?.customer_id).toBe("1234567890");
    });

    it("does not fetch when accountId is empty", () => {
      const { result } = renderHook(() => useAccount(""), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
      expect(result.current.data).toBeUndefined();
    });

    it("handles non-existent account", async () => {
      const accountId = "non-existent";
      server.use(
        http.get(`${API_URL}/google-ads/v1/accounts/${accountId}`, () => {
          return HttpResponse.json({ detail: "Account not found" }, { status: 404 });
        }),
      );

      const { result } = renderHook(() => useAccount(accountId), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it("refetches when accountId changes", async () => {
      server.use(
        http.get(`${API_URL}/google-ads/v1/accounts/acc-1`, () => {
          return HttpResponse.json(mockAccounts[0]);
        }),
        http.get(`${API_URL}/google-ads/v1/accounts/acc-2`, () => {
          return HttpResponse.json(mockAccounts[1]);
        }),
      );

      const { result, rerender } = renderHook(({ id }) => useAccount(id), {
        wrapper,
        initialProps: { id: "acc-1" },
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(result.current.data?.customer_id).toBe("1234567890");

      rerender({ id: "acc-2" });

      await waitFor(() => {
        expect(result.current.data?.customer_id).toBe("0987654321");
      });
    });
  });
});
