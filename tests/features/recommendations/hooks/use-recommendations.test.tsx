import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  useCampaignRecommendations,
  useCampaignRecommendationsSummary,
  useRecommendation,
  useRecommendations,
} from "@/features/recommendations/hooks/use-recommendations";
import { server } from "../../../utils/mocks/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const mockRecommendation = {
  recommendation_id: "rec-1",
  resource_name: "customers/123/recommendations/rec-1",
  type: "TARGET_CPA_OPT_IN",
  campaign_id: "campaign-1",
  campaign_name: "Test Campaign",
  ad_group_id: null,
  dismissed: false,
  impact: {
    base_metrics: { impressions: 1000, clicks: 50, cost_micros: 5000000, conversions: 5 },
    potential_metrics: { impressions: 1200, clicks: 70, cost_micros: 5500000, conversions: 8 },
  },
  details: { recommended_target_cpa_micros: 3000000 },
};

const mockRecommendationsResponse = {
  recommendations: [
    mockRecommendation,
    {
      recommendation_id: "rec-2",
      resource_name: "customers/123/recommendations/rec-2",
      type: "CAMPAIGN_BUDGET",
      campaign_id: "campaign-1",
      campaign_name: "Test Campaign",
      ad_group_id: null,
      dismissed: false,
      impact: {
        base_metrics: { impressions: 1000, clicks: 50, cost_micros: 5000000, conversions: 5 },
        potential_metrics: { impressions: 1500, clicks: 80, cost_micros: 7000000, conversions: 10 },
      },
      details: { recommended_budget_amount_micros: 10000000 },
    },
  ],
  total_count: 2,
};

describe("useRecommendations hooks", () => {
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

  describe("useRecommendations", () => {
    it("fetches recommendations with account_id filter", async () => {
      server.use(
        http.get(`${API_URL}/google-ads/v1/recommendations`, ({ request }) => {
          const url = new URL(request.url);
          if (url.searchParams.get("account_id") === "acc-1") {
            return HttpResponse.json(mockRecommendationsResponse);
          }
          return HttpResponse.json({ recommendations: [], total_count: 0 });
        }),
      );

      const { result } = renderHook(() => useRecommendations({ account_id: "acc-1" }), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.recommendations).toHaveLength(2);
      expect(result.current.data?.total_count).toBe(2);
    });

    it("does not fetch when account_id is missing", () => {
      const { result } = renderHook(() => useRecommendations({} as { account_id: string }), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
    });

    it("filters by type", async () => {
      server.use(
        http.get(`${API_URL}/google-ads/v1/recommendations`, ({ request }) => {
          const url = new URL(request.url);
          const types = url.searchParams.get("types");
          if (types?.includes("TARGET_CPA_OPT_IN")) {
            return HttpResponse.json({
              recommendations: [mockRecommendation],
              total_count: 1,
            });
          }
          return HttpResponse.json(mockRecommendationsResponse);
        }),
      );

      const { result } = renderHook(
        () => useRecommendations({ account_id: "acc-1", types: ["TARGET_CPA_OPT_IN"] }),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.recommendations).toHaveLength(1);
    });

    it("handles error response", async () => {
      server.use(
        http.get(`${API_URL}/google-ads/v1/recommendations`, () => {
          return HttpResponse.json({ detail: "Failed to fetch" }, { status: 501 });
        }),
      );

      const { result } = renderHook(() => useRecommendations({ account_id: "acc-1" }), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe("useRecommendation", () => {
    it("fetches a single recommendation", async () => {
      server.use(
        http.get(`${API_URL}/google-ads/v1/recommendations/rec-1`, () => {
          return HttpResponse.json(mockRecommendation);
        }),
      );

      const { result } = renderHook(() => useRecommendation("acc-1", "rec-1"), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.recommendation_id).toBe("rec-1");
      expect(result.current.data?.type).toBe("TARGET_CPA_OPT_IN");
    });

    it("does not fetch when accountId is empty", () => {
      const { result } = renderHook(() => useRecommendation("", "rec-1"), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
    });

    it("does not fetch when recommendationId is empty", () => {
      const { result } = renderHook(() => useRecommendation("acc-1", ""), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
    });
  });

  describe("useCampaignRecommendations", () => {
    it("fetches recommendations for a campaign", async () => {
      server.use(
        http.get(`${API_URL}/google-ads/v1/recommendations`, ({ request }) => {
          const url = new URL(request.url);
          if (url.searchParams.get("campaign_id") === "campaign-1") {
            return HttpResponse.json(mockRecommendationsResponse);
          }
          return HttpResponse.json({ recommendations: [], total_count: 0 });
        }),
      );

      const { result } = renderHook(() => useCampaignRecommendations("acc-1", "campaign-1"), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.recommendations).toHaveLength(2);
    });

    it("filters by types when provided", async () => {
      server.use(
        http.get(`${API_URL}/google-ads/v1/recommendations`, () => {
          return HttpResponse.json({
            recommendations: [mockRecommendation],
            total_count: 1,
          });
        }),
      );

      const { result } = renderHook(
        () => useCampaignRecommendations("acc-1", "campaign-1", ["TARGET_CPA_OPT_IN"]),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.recommendations).toHaveLength(1);
    });

    it("does not fetch when accountId is empty", () => {
      const { result } = renderHook(() => useCampaignRecommendations("", "campaign-1"), {
        wrapper,
      });

      expect(result.current.fetchStatus).toBe("idle");
    });

    it("does not fetch when campaignId is empty", () => {
      const { result } = renderHook(() => useCampaignRecommendations("acc-1", ""), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
    });
  });

  describe("useCampaignRecommendationsSummary", () => {
    it("returns summary with category counts", async () => {
      server.use(
        http.get(`${API_URL}/google-ads/v1/recommendations`, () => {
          return HttpResponse.json(mockRecommendationsResponse);
        }),
      );

      const { result } = renderHook(() => useCampaignRecommendationsSummary("acc-1", "campaign-1"), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.summary).not.toBeNull();
      });

      expect(result.current.summary?.total).toBe(2);
      expect(result.current.summary?.byCategory).toHaveProperty("Bidding");
      expect(result.current.summary?.byCategory).toHaveProperty("Budget");
    });

    it("counts high impact recommendations", async () => {
      server.use(
        http.get(`${API_URL}/google-ads/v1/recommendations`, () => {
          return HttpResponse.json(mockRecommendationsResponse);
        }),
      );

      const { result } = renderHook(() => useCampaignRecommendationsSummary("acc-1", "campaign-1"), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.summary).not.toBeNull();
      });

      // Both have >10% conversion improvement
      expect(result.current.summary?.highImpact).toBe(2);
    });

    it("returns null summary when loading", () => {
      const { result } = renderHook(() => useCampaignRecommendationsSummary("acc-1", "campaign-1"), {
        wrapper,
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.summary).toBeNull();
    });
  });
});
