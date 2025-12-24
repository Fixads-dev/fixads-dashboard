import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useAccountOverview } from "@/features/account-overview/hooks/use-account-overview";
import { server } from "../../../utils/mocks/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const mockOverviewResponse = {
  customer_id: "123-456-7890",
  customer_name: "Test Account",
  currency_code: "USD",
  date_range: "LAST_30_DAYS",
  metrics: {
    impressions: 150000,
    clicks: 7500,
    ctr: 5.0,
    cost_micros: 250000000,
    conversions: 150,
    conversions_value: 15000.0,
    average_cpc_micros: 33333,
    roas: 6.0,
    cost_per_conversion_micros: 1666667,
  },
  top_campaigns: [
    {
      campaign_id: "campaign-1",
      campaign_name: "Performance Max Campaign",
      status: "ENABLED",
      campaign_type: "PERFORMANCE_MAX",
      impressions: 50000,
      clicks: 2500,
      cost_micros: 100000000,
      conversions: 75,
      conversions_value: 7500.0,
    },
    {
      campaign_id: "campaign-2",
      campaign_name: "Search Campaign",
      status: "ENABLED",
      campaign_type: "SEARCH",
      impressions: 40000,
      clicks: 2000,
      cost_micros: 80000000,
      conversions: 50,
      conversions_value: 5000.0,
    },
  ],
  campaign_type_counts: {
    PERFORMANCE_MAX: 3,
    SEARCH: 5,
    DISPLAY: 2,
  },
  total_campaigns: 10,
};

describe("useAccountOverview hook", () => {
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

  it("fetches account overview with account_id", async () => {
    server.use(
      http.get(`${API_URL}/google-ads/v1/overview`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("account_id") === "acc-1") {
          return HttpResponse.json(mockOverviewResponse);
        }
        return HttpResponse.json({}, { status: 404 });
      }),
    );

    const { result } = renderHook(
      () => useAccountOverview({ account_id: "acc-1" }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.customer_id).toBe("123-456-7890");
    expect(result.current.data?.customer_name).toBe("Test Account");
    expect(result.current.data?.total_campaigns).toBe(10);
  });

  it("does not fetch when account_id is empty", () => {
    const { result } = renderHook(
      () => useAccountOverview({ account_id: "" }),
      { wrapper },
    );

    expect(result.current.fetchStatus).toBe("idle");
  });

  it("fetches with date_range filter", async () => {
    server.use(
      http.get(`${API_URL}/google-ads/v1/overview`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("date_range") === "LAST_7_DAYS") {
          return HttpResponse.json({
            ...mockOverviewResponse,
            date_range: "LAST_7_DAYS",
          });
        }
        return HttpResponse.json(mockOverviewResponse);
      }),
    );

    const { result } = renderHook(
      () => useAccountOverview({ account_id: "acc-1", date_range: "LAST_7_DAYS" }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.date_range).toBe("LAST_7_DAYS");
  });

  it("returns metrics correctly", async () => {
    server.use(
      http.get(`${API_URL}/google-ads/v1/overview`, () => {
        return HttpResponse.json(mockOverviewResponse);
      }),
    );

    const { result } = renderHook(
      () => useAccountOverview({ account_id: "acc-1" }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const metrics = result.current.data?.metrics;
    expect(metrics?.impressions).toBe(150000);
    expect(metrics?.clicks).toBe(7500);
    expect(metrics?.ctr).toBe(5.0);
    expect(metrics?.cost_micros).toBe(250000000);
    expect(metrics?.conversions).toBe(150);
    expect(metrics?.conversions_value).toBe(15000.0);
    expect(metrics?.average_cpc_micros).toBe(33333);
    expect(metrics?.roas).toBe(6.0);
    expect(metrics?.cost_per_conversion_micros).toBe(1666667);
  });

  it("returns top campaigns correctly", async () => {
    server.use(
      http.get(`${API_URL}/google-ads/v1/overview`, () => {
        return HttpResponse.json(mockOverviewResponse);
      }),
    );

    const { result } = renderHook(
      () => useAccountOverview({ account_id: "acc-1" }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const topCampaigns = result.current.data?.top_campaigns;
    expect(topCampaigns).toHaveLength(2);
    expect(topCampaigns?.[0].campaign_name).toBe("Performance Max Campaign");
    expect(topCampaigns?.[0].campaign_type).toBe("PERFORMANCE_MAX");
    expect(topCampaigns?.[1].campaign_name).toBe("Search Campaign");
    expect(topCampaigns?.[1].campaign_type).toBe("SEARCH");
  });

  it("returns campaign type counts correctly", async () => {
    server.use(
      http.get(`${API_URL}/google-ads/v1/overview`, () => {
        return HttpResponse.json(mockOverviewResponse);
      }),
    );

    const { result } = renderHook(
      () => useAccountOverview({ account_id: "acc-1" }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const typeCounts = result.current.data?.campaign_type_counts;
    expect(typeCounts?.PERFORMANCE_MAX).toBe(3);
    expect(typeCounts?.SEARCH).toBe(5);
    expect(typeCounts?.DISPLAY).toBe(2);
  });

  it("handles null customer_name and currency_code", async () => {
    server.use(
      http.get(`${API_URL}/google-ads/v1/overview`, () => {
        return HttpResponse.json({
          ...mockOverviewResponse,
          customer_name: null,
          currency_code: null,
        });
      }),
    );

    const { result } = renderHook(
      () => useAccountOverview({ account_id: "acc-1" }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.customer_name).toBeNull();
    expect(result.current.data?.currency_code).toBeNull();
  });

  it("handles error response", async () => {
    server.use(
      http.get(`${API_URL}/google-ads/v1/overview`, () => {
        return HttpResponse.json({ detail: "Account not found" }, { status: 501 });
      }),
    );

    const { result } = renderHook(
      () => useAccountOverview({ account_id: "acc-1" }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it("handles empty top campaigns", async () => {
    server.use(
      http.get(`${API_URL}/google-ads/v1/overview`, () => {
        return HttpResponse.json({
          ...mockOverviewResponse,
          top_campaigns: [],
          total_campaigns: 0,
        });
      }),
    );

    const { result } = renderHook(
      () => useAccountOverview({ account_id: "acc-1" }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.top_campaigns).toHaveLength(0);
    expect(result.current.data?.total_campaigns).toBe(0);
  });
});
