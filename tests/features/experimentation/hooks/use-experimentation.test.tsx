import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  useBeliefHistory,
  useCampaignProbabilities,
  useCreateMABState,
  useIndustryPriors,
  useMABState,
  useMABStates,
  usePendingOptimizations,
  useSelectAssets,
  useUpdateBelief,
} from "@/features/experimentation/hooks/use-experimentation";
import { server } from "../../../utils/mocks/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const EXPERIMENTATION_PATH = `${API_URL}/experimentation/api/v1`;

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockMABState = {
  id: "state-1",
  asset_id: "asset-1",
  campaign_id: "campaign-1",
  asset_group_id: "ag-1",
  account_id: "acc-1",
  platform: "GOOGLE_ADS",
  alpha: 10,
  beta: 90,
  expected_value: 0.1,
  win_probability: 0.1,
  total_trials: 100,
  total_successes: 10,
  status: "LEARNING",
  prior_source: "DEFAULT",
  created_at: "2024-01-01T00:00:00Z",
  last_updated_at: "2024-01-02T00:00:00Z",
};

const mockMABStatesResponse = {
  items: [mockMABState],
  total: 1,
  platform: "GOOGLE_ADS",
  campaign_id: "campaign-1",
};

const mockBeliefHistoryResponse = {
  asset_id: "asset-1",
  events: [
    {
      id: "event-1",
      event_type: "INITIALIZED",
      delta_alpha: 1,
      delta_beta: 1,
      alpha_after: 1,
      beta_after: 1,
      source: "default",
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "event-2",
      event_type: "SUCCESS",
      delta_alpha: 1,
      delta_beta: 0,
      alpha_after: 2,
      beta_after: 1,
      source: "batch",
      created_at: "2024-01-02T00:00:00Z",
    },
  ],
  total_events: 2,
};

const mockBeliefUpdateResponse = {
  asset_id: "asset-1",
  alpha: 15,
  beta: 95,
  expected_value: 0.136,
  total_trials: 110,
  status: "LEARNING",
};

const mockCampaignProbabilitiesResponse = {
  campaign_id: "campaign-1",
  platform: "GOOGLE_ADS",
  total_assets: 2,
  assets: [
    {
      asset_id: "asset-1",
      win_probability: 0.12,
      alpha: 12,
      beta: 88,
      status: "LEARNING",
      prior_context: "default",
      prior_source: "DEFAULT",
      mature_clicks: 100,
      mature_conversions: 12,
      z_score: 0.5,
    },
    {
      asset_id: "asset-2",
      win_probability: 0.08,
      alpha: 8,
      beta: 92,
      status: "STABLE",
      prior_context: "industry:retail",
      prior_source: "INDUSTRY",
      mature_clicks: 100,
      mature_conversions: 8,
      z_score: -0.3,
    },
  ],
};

const mockSelectionResponse = {
  selected_asset_ids: ["asset-1", "asset-3"],
  scores: { "asset-1": 0.15, "asset-3": 0.12 },
  strategy_name: "thompson_sampling",
  total_candidates: 5,
  eligible_candidates: 3,
};

const mockIndustryPriorsResponse = {
  items: [
    {
      id: "prior-1",
      industry_code: "retail",
      industry_name: "Retail",
      platform: "GOOGLE_ADS",
      asset_field_type: "HEADLINE",
      benchmark_ctr: 0.05,
      benchmark_cvr: 0.02,
      prior_alpha: 2,
      prior_beta: 98,
      prior_strength: 100,
    },
  ],
  total: 1,
};

const mockPendingOptimizationsResponse = {
  campaign_id: "campaign-1",
  pending_count: 2,
  requests: [
    {
      asset_id: "asset-bad-1",
      campaign_id: "campaign-1",
      reason: "LOW_CTR",
      requested_at: "2024-01-01T00:00:00Z",
    },
    {
      asset_id: "asset-bad-2",
      campaign_id: "campaign-1",
      reason: "DECAYED",
      requested_at: "2024-01-02T00:00:00Z",
    },
  ],
};

describe("useExperimentation hooks", () => {
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
    vi.clearAllMocks();
  });

  afterEach(() => {
    server.resetHandlers();
    queryClient.clear();
  });

  describe("useMABStates", () => {
    it("fetches MAB states for an account", async () => {
      server.use(
        http.get(`${EXPERIMENTATION_PATH}/accounts/acc-1/states`, () => {
          return HttpResponse.json(mockMABStatesResponse);
        }),
      );

      const { result } = renderHook(() => useMABStates("acc-1"), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.items).toHaveLength(1);
      expect(result.current.data?.total).toBe(1);
    });

    it("filters by campaignId when provided", async () => {
      server.use(
        http.get(`${EXPERIMENTATION_PATH}/accounts/acc-1/states`, ({ request }) => {
          const url = new URL(request.url);
          if (url.searchParams.get("campaign_id") === "campaign-1") {
            return HttpResponse.json(mockMABStatesResponse);
          }
          return HttpResponse.json({ items: [], total: 0 });
        }),
      );

      const { result } = renderHook(() => useMABStates("acc-1", "campaign-1"), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.items).toHaveLength(1);
    });

    it("does not fetch when accountId is empty", () => {
      const { result } = renderHook(() => useMABStates(""), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
    });
  });

  describe("useMABState", () => {
    it("fetches a single MAB state", async () => {
      server.use(
        http.get(`${EXPERIMENTATION_PATH}/states/asset-1`, () => {
          return HttpResponse.json(mockMABState);
        }),
      );

      const { result } = renderHook(() => useMABState("asset-1"), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.asset_id).toBe("asset-1");
      expect(result.current.data?.alpha).toBe(10);
      expect(result.current.data?.beta).toBe(90);
    });

    it("does not fetch when assetId is empty", () => {
      const { result } = renderHook(() => useMABState(""), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
    });
  });

  describe("useCreateMABState", () => {
    it("creates a MAB state successfully", async () => {
      server.use(
        http.post(`${EXPERIMENTATION_PATH}/states`, () => {
          return HttpResponse.json(mockMABState);
        }),
      );

      const { result } = renderHook(() => useCreateMABState(), { wrapper });

      result.current.mutate({
        asset_id: "asset-1",
        campaign_id: "campaign-1",
        account_id: "acc-1",
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.asset_id).toBe("asset-1");
    });

    it("shows success toast when created", async () => {
      const { toast } = await import("sonner");
      server.use(
        http.post(`${EXPERIMENTATION_PATH}/states`, () => {
          return HttpResponse.json(mockMABState);
        }),
      );

      const { result } = renderHook(() => useCreateMABState(), { wrapper });

      result.current.mutate({
        asset_id: "asset-1",
        campaign_id: "campaign-1",
        account_id: "acc-1",
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(toast.success).toHaveBeenCalledWith(
        "MAB state initialized",
        expect.objectContaining({ description: expect.any(String) }),
      );
    });

    it("shows error toast on failure", async () => {
      const { toast } = await import("sonner");
      server.use(
        http.post(`${EXPERIMENTATION_PATH}/states`, () => {
          return HttpResponse.json({ detail: "Asset already exists" }, { status: 501 });
        }),
      );

      const { result } = renderHook(() => useCreateMABState(), { wrapper });

      result.current.mutate({
        asset_id: "asset-1",
        campaign_id: "campaign-1",
        account_id: "acc-1",
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith(
        "Failed to initialize MAB state",
        expect.objectContaining({ description: expect.any(String) }),
      );
    });
  });

  describe("useCampaignProbabilities", () => {
    it("fetches campaign probabilities", async () => {
      server.use(
        http.get(`${EXPERIMENTATION_PATH}/campaigns/campaign-1/probabilities`, () => {
          return HttpResponse.json(mockCampaignProbabilitiesResponse);
        }),
      );

      const { result } = renderHook(() => useCampaignProbabilities("campaign-1"), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.assets).toHaveLength(2);
      expect(result.current.data?.total_assets).toBe(2);
    });

    it("does not fetch when campaignId is empty", () => {
      const { result } = renderHook(() => useCampaignProbabilities(""), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
    });
  });

  describe("useBeliefHistory", () => {
    it("fetches belief history for an asset", async () => {
      server.use(
        http.get(`${EXPERIMENTATION_PATH}/beliefs/asset-1/history`, () => {
          return HttpResponse.json(mockBeliefHistoryResponse);
        }),
      );

      const { result } = renderHook(() => useBeliefHistory("asset-1"), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.events).toHaveLength(2);
      expect(result.current.data?.total_events).toBe(2);
    });

    it("does not fetch when assetId is empty", () => {
      const { result } = renderHook(() => useBeliefHistory(""), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
    });
  });

  describe("useUpdateBelief", () => {
    it("updates belief state successfully", async () => {
      server.use(
        http.post(`${EXPERIMENTATION_PATH}/beliefs/update`, () => {
          return HttpResponse.json(mockBeliefUpdateResponse);
        }),
      );

      const { result } = renderHook(() => useUpdateBelief(), { wrapper });

      result.current.mutate({
        asset_id: "asset-1",
        conversions: 5,
        clicks: 10,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.alpha).toBe(15);
      expect(result.current.data?.beta).toBe(95);
    });

    it("shows success toast with win probability", async () => {
      const { toast } = await import("sonner");
      server.use(
        http.post(`${EXPERIMENTATION_PATH}/beliefs/update`, () => {
          return HttpResponse.json(mockBeliefUpdateResponse);
        }),
      );

      const { result } = renderHook(() => useUpdateBelief(), { wrapper });

      result.current.mutate({
        asset_id: "asset-1",
        conversions: 5,
        clicks: 10,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(toast.success).toHaveBeenCalledWith(
        "Belief state updated",
        expect.objectContaining({ description: expect.stringContaining("Win probability") }),
      );
    });

    it("shows error toast on failure", async () => {
      const { toast } = await import("sonner");
      server.use(
        http.post(`${EXPERIMENTATION_PATH}/beliefs/update`, () => {
          return HttpResponse.json({ detail: "Asset not found" }, { status: 501 });
        }),
      );

      const { result } = renderHook(() => useUpdateBelief(), { wrapper });

      result.current.mutate({
        asset_id: "asset-1",
        conversions: 5,
        clicks: 10,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith(
        "Failed to update belief state",
        expect.objectContaining({ description: expect.any(String) }),
      );
    });
  });

  describe("useSelectAssets", () => {
    it("selects assets using Thompson Sampling", async () => {
      server.use(
        http.post(`${EXPERIMENTATION_PATH}/select`, () => {
          return HttpResponse.json(mockSelectionResponse);
        }),
      );

      const { result } = renderHook(() => useSelectAssets(), { wrapper });

      result.current.mutate({
        campaign_id: "campaign-1",
        k: 2,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.selected_asset_ids).toHaveLength(2);
      expect(result.current.data?.strategy_name).toBe("thompson_sampling");
    });

    it("shows success toast with selection details", async () => {
      const { toast } = await import("sonner");
      server.use(
        http.post(`${EXPERIMENTATION_PATH}/select`, () => {
          return HttpResponse.json(mockSelectionResponse);
        }),
      );

      const { result } = renderHook(() => useSelectAssets(), { wrapper });

      result.current.mutate({
        campaign_id: "campaign-1",
        k: 2,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(toast.success).toHaveBeenCalledWith(
        "Selected 2 assets",
        expect.objectContaining({
          description: expect.stringContaining("thompson_sampling"),
        }),
      );
    });

    it("shows error toast on failure", async () => {
      const { toast } = await import("sonner");
      server.use(
        http.post(`${EXPERIMENTATION_PATH}/select`, () => {
          return HttpResponse.json({ detail: "No eligible candidates" }, { status: 501 });
        }),
      );

      const { result } = renderHook(() => useSelectAssets(), { wrapper });

      result.current.mutate({
        campaign_id: "campaign-1",
        k: 2,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith(
        "Asset selection failed",
        expect.objectContaining({ description: expect.any(String) }),
      );
    });
  });

  describe("useIndustryPriors", () => {
    it("fetches industry priors", async () => {
      server.use(
        http.get(`${EXPERIMENTATION_PATH}/priors`, () => {
          return HttpResponse.json(mockIndustryPriorsResponse);
        }),
      );

      const { result } = renderHook(() => useIndustryPriors(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.items).toHaveLength(1);
      expect(result.current.data?.items[0].industry_code).toBe("retail");
    });

    it("filters by platform when provided", async () => {
      server.use(
        http.get(`${EXPERIMENTATION_PATH}/priors`, ({ request }) => {
          const url = new URL(request.url);
          if (url.searchParams.get("platform") === "GOOGLE_ADS") {
            return HttpResponse.json(mockIndustryPriorsResponse);
          }
          return HttpResponse.json({ items: [], total: 0 });
        }),
      );

      const { result } = renderHook(() => useIndustryPriors("GOOGLE_ADS"), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.items).toHaveLength(1);
    });
  });

  describe("usePendingOptimizations", () => {
    it("fetches pending optimizations for a campaign", async () => {
      server.use(
        http.get(`${EXPERIMENTATION_PATH}/campaigns/campaign-1/optimization-requests`, () => {
          return HttpResponse.json(mockPendingOptimizationsResponse);
        }),
      );

      const { result } = renderHook(() => usePendingOptimizations("campaign-1"), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.pending_count).toBe(2);
      expect(result.current.data?.requests).toHaveLength(2);
    });

    it("does not fetch when campaignId is empty", () => {
      const { result } = renderHook(() => usePendingOptimizations(""), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
    });
  });
});
