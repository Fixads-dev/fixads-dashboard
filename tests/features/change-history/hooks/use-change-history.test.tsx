import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useChangeHistory } from "@/features/change-history/hooks/use-change-history";
import { server } from "../../../utils/mocks/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const mockChangeHistoryResponse = {
  changes: [
    {
      resource_name: "customers/123/changeEvents/456",
      change_date_time: "2024-01-15T10:30:00Z",
      change_resource_type: "CAMPAIGN",
      change_resource_name: "customers/123/campaigns/789",
      user_email: "user@example.com",
      client_type: "GOOGLE_ADS_WEB_CLIENT",
      operation: "UPDATE",
    },
    {
      resource_name: "customers/123/changeEvents/457",
      change_date_time: "2024-01-15T09:00:00Z",
      change_resource_type: "ASSET",
      change_resource_name: "customers/123/assets/101",
      user_email: null,
      client_type: "GOOGLE_ADS_API",
      operation: "CREATE",
    },
    {
      resource_name: "customers/123/changeEvents/458",
      change_date_time: "2024-01-14T15:45:00Z",
      change_resource_type: "AD_GROUP",
      change_resource_name: "customers/123/adGroups/202",
      user_email: "admin@example.com",
      client_type: "GOOGLE_ADS_SCRIPTS",
      operation: "REMOVE",
    },
  ],
  total_count: 3,
};

describe("useChangeHistory hook", () => {
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

  it("fetches change history with account_id", async () => {
    server.use(
      http.get(`${API_URL}/google-ads/v1/change-history`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("account_id") === "acc-1") {
          return HttpResponse.json(mockChangeHistoryResponse);
        }
        return HttpResponse.json({ changes: [], total_count: 0 });
      }),
    );

    const { result } = renderHook(() => useChangeHistory({ account_id: "acc-1" }), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.changes).toHaveLength(3);
    expect(result.current.data?.total_count).toBe(3);
  });

  it("does not fetch when account_id is empty", () => {
    const { result } = renderHook(() => useChangeHistory({ account_id: "" }), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
  });

  it("filters by date range when provided", async () => {
    server.use(
      http.get(`${API_URL}/google-ads/v1/change-history`, ({ request }) => {
        const url = new URL(request.url);
        const startDate = url.searchParams.get("start_date");
        const endDate = url.searchParams.get("end_date");

        if (startDate === "2024-01-01" && endDate === "2024-01-31") {
          return HttpResponse.json(mockChangeHistoryResponse);
        }
        return HttpResponse.json({ changes: [], total_count: 0 });
      }),
    );

    const { result } = renderHook(
      () =>
        useChangeHistory({
          account_id: "acc-1",
          start_date: "2024-01-01",
          end_date: "2024-01-31",
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.changes).toHaveLength(3);
  });

  it("filters by resource_type when provided", async () => {
    const campaignOnlyResponse = {
      changes: [mockChangeHistoryResponse.changes[0]],
      total_count: 1,
    };

    server.use(
      http.get(`${API_URL}/google-ads/v1/change-history`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("resource_type") === "CAMPAIGN") {
          return HttpResponse.json(campaignOnlyResponse);
        }
        return HttpResponse.json(mockChangeHistoryResponse);
      }),
    );

    const { result } = renderHook(
      () =>
        useChangeHistory({
          account_id: "acc-1",
          resource_type: "CAMPAIGN",
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.changes).toHaveLength(1);
    expect(result.current.data?.changes[0].change_resource_type).toBe("CAMPAIGN");
  });

  it("respects limit parameter", async () => {
    server.use(
      http.get(`${API_URL}/google-ads/v1/change-history`, ({ request }) => {
        const url = new URL(request.url);
        const limit = url.searchParams.get("limit");

        if (limit === "1") {
          return HttpResponse.json({
            changes: [mockChangeHistoryResponse.changes[0]],
            total_count: 3,
          });
        }
        return HttpResponse.json(mockChangeHistoryResponse);
      }),
    );

    const { result } = renderHook(
      () =>
        useChangeHistory({
          account_id: "acc-1",
          limit: 1,
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.changes).toHaveLength(1);
    expect(result.current.data?.total_count).toBe(3);
  });

  it("handles error response", async () => {
    server.use(
      http.get(`${API_URL}/google-ads/v1/change-history`, () => {
        return HttpResponse.json({ detail: "Failed to fetch change history" }, { status: 501 });
      }),
    );

    const { result } = renderHook(() => useChangeHistory({ account_id: "acc-1" }), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it("handles empty change history", async () => {
    server.use(
      http.get(`${API_URL}/google-ads/v1/change-history`, () => {
        return HttpResponse.json({ changes: [], total_count: 0 });
      }),
    );

    const { result } = renderHook(() => useChangeHistory({ account_id: "acc-1" }), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.changes).toHaveLength(0);
    expect(result.current.data?.total_count).toBe(0);
  });
});
