import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  useAssetGroups,
  useCampaign,
  useCampaignDetail,
  useCampaigns,
  useDailyMetrics,
  useTextAssets,
} from "@/features/campaigns/hooks/use-campaigns";
import type { Campaign } from "@/features/campaigns/types";
import { server } from "../../../utils/mocks/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const mockCampaigns: Campaign[] = [
  {
    campaign_id: "123456",
    campaign_name: "Test Campaign 1",
    status: "ENABLED",
    impressions: 10000,
    clicks: 500,
    cost_micros: 50000000,
    conversions: 25,
  },
  {
    campaign_id: "789012",
    campaign_name: "Test Campaign 2",
    status: "PAUSED",
    impressions: 5000,
    clicks: 200,
    cost_micros: 20000000,
    conversions: 10,
  },
];

const mockAssetGroups = [
  {
    asset_group_id: "ag-1",
    asset_group_name: "Asset Group 1",
    status: "ENABLED",
    final_urls: ["https://example.com"],
  },
  {
    asset_group_id: "ag-2",
    asset_group_name: "Asset Group 2",
    status: "PAUSED",
    final_urls: ["https://example.com/page"],
  },
];

const mockTextAssets = {
  campaign_id: "123456",
  campaign_name: "Test Campaign 1",
  asset_groups: [
    {
      asset_group_id: "ag-1",
      asset_group_name: "Asset Group 1",
      assets: [
        {
          resource_name: "asset-1",
          field_type: "HEADLINE",
          text: "Test Headline",
          status: "OK",
        },
        {
          resource_name: "asset-2",
          field_type: "DESCRIPTION",
          text: "Test Description",
          status: "OK",
        },
      ],
    },
  ],
};

describe("useCampaigns hooks", () => {
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

  describe("useCampaigns", () => {
    it("fetches campaigns with account_id filter", async () => {
      server.use(
        http.get(`${API_URL}/google-ads/v1/pmax/campaigns`, ({ request }) => {
          const url = new URL(request.url);
          const accountId = url.searchParams.get("account_id");
          if (accountId === "acc-1") {
            return HttpResponse.json(mockCampaigns);
          }
          return HttpResponse.json([]);
        }),
      );

      const { result } = renderHook(() => useCampaigns({ account_id: "acc-1" }), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockCampaigns);
      expect(result.current.data).toHaveLength(2);
    });

    it("does not fetch when account_id is missing", () => {
      const { result } = renderHook(() => useCampaigns({}), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
      expect(result.current.data).toBeUndefined();
    });

    it("does not fetch when filters are undefined", () => {
      const { result } = renderHook(() => useCampaigns(undefined), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
    });

    it("filters by status", async () => {
      server.use(
        http.get(`${API_URL}/google-ads/v1/pmax/campaigns`, ({ request }) => {
          const url = new URL(request.url);
          const status = url.searchParams.get("status");
          if (status === "ENABLED") {
            return HttpResponse.json([mockCampaigns[0]]);
          }
          return HttpResponse.json(mockCampaigns);
        }),
      );

      const { result } = renderHook(
        () => useCampaigns({ account_id: "acc-1", status: "ENABLED" }),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0].status).toBe("ENABLED");
    });

    it("handles error response", async () => {
      server.use(
        http.get(`${API_URL}/google-ads/v1/pmax/campaigns`, () => {
          return HttpResponse.json({ detail: "Failed to fetch campaigns" }, { status: 500 });
        }),
      );

      const { result } = renderHook(() => useCampaigns({ account_id: "acc-1" }), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe("useCampaign", () => {
    it("fetches single campaign via GAQL query", async () => {
      server.use(
        http.post(`${API_URL}/google-ads/v1/query`, () => {
          return HttpResponse.json({
            rows: [
              {
                "campaign.id": "123456",
                "campaign.name": "Test Campaign 1",
                "campaign.status": "ENABLED",
                "campaign.advertising_channel_type": "PERFORMANCE_MAX",
                "metrics.impressions": 10000,
                "metrics.clicks": 500,
                "metrics.conversions": 25,
                "metrics.cost_micros": 50000000,
                "metrics.conversions_value": 250000,
              },
            ],
          });
        }),
      );

      const { result } = renderHook(() => useCampaign("acc-1", "123456"), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.campaign_id).toBe("123456");
      expect(result.current.data?.impressions).toBe(10000);
    });

    it("does not fetch when accountId is empty", () => {
      const { result } = renderHook(() => useCampaign("", "123456"), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
    });

    it("does not fetch when campaignId is empty", () => {
      const { result } = renderHook(() => useCampaign("acc-1", ""), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
    });

    it("handles campaign not found", async () => {
      server.use(
        http.post(`${API_URL}/google-ads/v1/query`, () => {
          return HttpResponse.json({ rows: [] });
        }),
      );

      const { result } = renderHook(() => useCampaign("acc-1", "nonexistent"), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe("useCampaignDetail", () => {
    it("fetches campaign detail from dedicated endpoint", async () => {
      server.use(
        http.get(`${API_URL}/google-ads/v1/pmax/campaigns/123456`, () => {
          return HttpResponse.json({
            campaign_id: "123456",
            campaign_name: "Test Campaign 1",
            status: "ENABLED",
            bidding_strategy_type: "MAXIMIZE_CONVERSIONS",
            optimization_score: 0.85,
            start_date: "2024-01-01",
            end_date: null,
            budget_amount_micros: 100000000,
            impressions: 10000,
            clicks: 500,
            cost_micros: 50000000,
            conversions: 25,
            ctr: 5.0,
            average_cpc: 100000,
            average_cpm: 5000000,
            conversions_value: 250000,
            cost_per_conversion: 2000000,
            conversion_rate: 5.0,
            all_conversions: 30,
            all_conversions_value: 300000,
            view_through_conversions: 5,
            interactions: 550,
            engagements: 100,
            invalid_clicks: 10,
          });
        }),
      );

      const { result } = renderHook(() => useCampaignDetail("acc-1", "123456"), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.campaign_id).toBe("123456");
      expect(result.current.data?.metrics.impressions).toBe(10000);
    });

    it("does not fetch when accountId is empty", () => {
      const { result } = renderHook(() => useCampaignDetail("", "123456"), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
    });

    it("does not fetch when campaignId is empty", () => {
      const { result } = renderHook(() => useCampaignDetail("acc-1", ""), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
    });
  });

  describe("useDailyMetrics", () => {
    it("fetches daily metrics for campaign", async () => {
      server.use(
        http.post(`${API_URL}/google-ads/v1/query`, () => {
          return HttpResponse.json({
            rows: [
              {
                "segments.date": "2024-01-01",
                "metrics.impressions": 1000,
                "metrics.clicks": 50,
                "metrics.cost_micros": 5000000,
                "metrics.conversions": 3,
                "metrics.ctr": 5.0,
                "metrics.average_cpc": 100000,
              },
              {
                "segments.date": "2024-01-02",
                "metrics.impressions": 1200,
                "metrics.clicks": 60,
                "metrics.cost_micros": 6000000,
                "metrics.conversions": 4,
                "metrics.ctr": 5.0,
                "metrics.average_cpc": 100000,
              },
            ],
          });
        }),
      );

      const { result } = renderHook(() => useDailyMetrics("acc-1", "123456", 30), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.[0].date).toBe("2024-01-01");
    });

    it("uses default 30 days when not specified", async () => {
      server.use(
        http.post(`${API_URL}/google-ads/v1/query`, () => {
          return HttpResponse.json({ rows: [] });
        }),
      );

      const { result } = renderHook(() => useDailyMetrics("acc-1", "123456"), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it("does not fetch when accountId is empty", () => {
      const { result } = renderHook(() => useDailyMetrics("", "123456"), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
    });

    it("does not fetch when campaignId is empty", () => {
      const { result } = renderHook(() => useDailyMetrics("acc-1", ""), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
    });
  });

  describe("useAssetGroups", () => {
    it("fetches asset groups for campaign", async () => {
      server.use(
        http.get(`${API_URL}/google-ads/v1/pmax/campaigns/123456/asset-groups`, () => {
          return HttpResponse.json(mockAssetGroups);
        }),
      );

      const { result } = renderHook(() => useAssetGroups("acc-1", "123456"), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.[0].asset_group_id).toBe("ag-1");
      expect(result.current.data?.[0].final_url).toBe("https://example.com");
    });

    it("does not fetch when accountId is empty", () => {
      const { result } = renderHook(() => useAssetGroups("", "123456"), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
    });

    it("does not fetch when campaignId is empty", () => {
      const { result } = renderHook(() => useAssetGroups("acc-1", ""), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
    });
  });

  describe("useTextAssets", () => {
    it("fetches text assets for campaign", async () => {
      server.use(
        http.get(`${API_URL}/google-ads/v1/pmax/campaigns/123456/text-assets`, () => {
          return HttpResponse.json(mockTextAssets);
        }),
      );

      const { result } = renderHook(() => useTextAssets("acc-1", "123456"), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0].asset_group_id).toBe("ag-1");
      expect(result.current.data?.[0].headlines).toHaveLength(1);
      expect(result.current.data?.[0].descriptions).toHaveLength(1);
    });

    it("does not fetch when accountId is empty", () => {
      const { result } = renderHook(() => useTextAssets("", "123456"), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
    });

    it("does not fetch when campaignId is empty", () => {
      const { result } = renderHook(() => useTextAssets("acc-1", ""), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
    });
  });
});
