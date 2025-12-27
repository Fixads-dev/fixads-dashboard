import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  useApplyTextChanges,
  useBadAssetHistory,
  useSetTargetCpa,
  useTargetCpa,
  useTextOptimizerAnalyze,
} from "@/features/optimizer/hooks/use-text-optimizer";
import { server } from "../../../utils/mocks/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockAnalyzeResponse = {
  optimization_run_id: "run-123",
  campaign_id: "campaign-1",
  campaign_name: "Test Campaign",
  asset_group_id: "ag-1",
  asset_group_name: "Asset Group 1",
  assets_to_remove: [
    {
      asset_id: "asset-1",
      asset_type: "HEADLINE",
      text: "Bad Headline",
      reason_code: "ZOMBIE",
      severity_score: 0.8,
      metrics: { impressions: 100, clicks: 0 },
    },
  ],
  assets_to_add: [
    {
      asset_type: "HEADLINE",
      text: "New Headline",
      category: "replacement",
      char_count: 12,
      compliance_passed: true,
    },
  ],
  summary: {
    total_assets_analyzed: 10,
    bad_assets_found: 1,
    assets_to_remove: 1,
    assets_to_add: 1,
    compliance_passed: 1,
    compliance_failed: 0,
    bad_history_used: 0,
    target_cpa_micros: null,
  },
};

const mockApplyResponse = {
  optimization_run_id: "run-123",
  assets_removed: 1,
  assets_created: 1,
  bad_assets_logged: 1,
  errors: [],
};

const mockBadAssetHistory = {
  items: [
    {
      id: "history-1",
      asset_id: "asset-1",
      asset_type: "HEADLINE",
      asset_text: "Bad Headline",
      failure_reason_code: "ZOMBIE",
      snapshot_impressions: 100,
      snapshot_clicks: 0,
      created_at: "2024-01-01T00:00:00Z",
    },
  ],
  total: 1,
};

const mockTargetCpa = {
  id: "cpa-1",
  account_id: "acc-1",
  campaign_id: "campaign-1",
  target_cpa_micros: 5000000,
  currency_code: "USD",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("useTextOptimizer hooks", () => {
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

  describe("useTextOptimizerAnalyze", () => {
    it("analyzes campaign and returns results", async () => {
      server.use(
        http.post(`${API_URL}/google-ads/v1/pmax/text-optimizer/analyze`, () => {
          return HttpResponse.json(mockAnalyzeResponse);
        }),
      );

      const { result } = renderHook(() => useTextOptimizerAnalyze(), { wrapper });

      result.current.mutate({
        accountId: "acc-1",
        request: {
          campaign_id: "campaign-1",
          asset_group_id: "ag-1",
          product_description: "Test product description",
        },
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.optimization_run_id).toBe("run-123");
      expect(result.current.data?.assets_to_remove).toHaveLength(1);
      expect(result.current.data?.assets_to_add).toHaveLength(1);
    });

    it("shows success toast after analysis", async () => {
      const { toast } = await import("sonner");
      server.use(
        http.post(`${API_URL}/google-ads/v1/pmax/text-optimizer/analyze`, () => {
          return HttpResponse.json(mockAnalyzeResponse);
        }),
      );

      const { result } = renderHook(() => useTextOptimizerAnalyze(), { wrapper });

      result.current.mutate({
        accountId: "acc-1",
        request: { campaign_id: "campaign-1", asset_group_id: "ag-1", product_description: "Test product" },
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(toast.success).toHaveBeenCalledWith(
        "Text analysis complete",
        expect.objectContaining({
          description: expect.stringContaining("1 bad assets"),
        }),
      );
    });

    it("shows error toast on failure", async () => {
      const { toast } = await import("sonner");
      server.use(
        http.post(`${API_URL}/google-ads/v1/pmax/text-optimizer/analyze`, () => {
          return HttpResponse.json({ detail: "Analysis failed" }, { status: 501 });
        }),
      );

      const { result } = renderHook(() => useTextOptimizerAnalyze(), { wrapper });

      result.current.mutate({
        accountId: "acc-1",
        request: { campaign_id: "campaign-1", asset_group_id: "ag-1", product_description: "Test product" },
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith(
        "Analysis failed",
        expect.objectContaining({ description: expect.any(String) }),
      );
    });
  });

  describe("useApplyTextChanges", () => {
    it("applies changes successfully", async () => {
      server.use(
        http.post(`${API_URL}/google-ads/v1/pmax/text-optimizer/apply`, () => {
          return HttpResponse.json(mockApplyResponse);
        }),
      );

      const { result } = renderHook(() => useApplyTextChanges(), { wrapper });

      result.current.mutate({
        accountId: "acc-1",
        request: {
          campaign_id: "campaign-1",
          asset_group_id: "ag-1",
          optimization_run_id: "run-123",
          asset_ids_to_remove: ["asset-1"],
          assets_to_add: [{ asset_type: "HEADLINE", text: "New Headline", category: "Scarcity", char_count: 12, compliance_passed: true }],
        },
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.assets_removed).toBe(1);
      expect(result.current.data?.assets_created).toBe(1);
    });

    it("shows success toast after applying", async () => {
      const { toast } = await import("sonner");
      server.use(
        http.post(`${API_URL}/google-ads/v1/pmax/text-optimizer/apply`, () => {
          return HttpResponse.json(mockApplyResponse);
        }),
      );

      const { result } = renderHook(() => useApplyTextChanges(), { wrapper });

      result.current.mutate({
        accountId: "acc-1",
        request: {
          campaign_id: "campaign-1",
          asset_group_id: "ag-1",
          optimization_run_id: "run-123",
          asset_ids_to_remove: [],
          assets_to_add: [],
        },
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(toast.success).toHaveBeenCalledWith(
        "Changes applied",
        expect.objectContaining({
          description: expect.stringContaining("Removed 1"),
        }),
      );
    });

    it("shows error toast on failure", async () => {
      const { toast } = await import("sonner");
      server.use(
        http.post(`${API_URL}/google-ads/v1/pmax/text-optimizer/apply`, () => {
          return HttpResponse.json({ detail: "Apply failed" }, { status: 501 });
        }),
      );

      const { result } = renderHook(() => useApplyTextChanges(), { wrapper });

      result.current.mutate({
        accountId: "acc-1",
        request: {
          campaign_id: "campaign-1",
          asset_group_id: "ag-1",
          optimization_run_id: "run-123",
          asset_ids_to_remove: [],
          assets_to_add: [],
        },
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith(
        "Failed to apply changes",
        expect.objectContaining({ description: expect.any(String) }),
      );
    });
  });

  describe("useBadAssetHistory", () => {
    it("fetches bad asset history", async () => {
      server.use(
        http.get(`${API_URL}/google-ads/v1/accounts/acc-1/bad-asset-history`, () => {
          return HttpResponse.json(mockBadAssetHistory);
        }),
      );

      const { result } = renderHook(() => useBadAssetHistory("acc-1"), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.items).toHaveLength(1);
      expect(result.current.data?.items[0].failure_reason_code).toBe("ZOMBIE");
    });

    it("does not fetch when accountId is empty", () => {
      const { result } = renderHook(() => useBadAssetHistory(""), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
    });

    it("filters by campaign_id when provided", async () => {
      server.use(
        http.get(`${API_URL}/google-ads/v1/accounts/acc-1/bad-asset-history`, ({ request }) => {
          const url = new URL(request.url);
          const campaignId = url.searchParams.get("campaign_id");
          if (campaignId === "campaign-1") {
            return HttpResponse.json(mockBadAssetHistory);
          }
          return HttpResponse.json({ items: [], total: 0 });
        }),
      );

      const { result } = renderHook(() => useBadAssetHistory("acc-1", "campaign-1"), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.items).toHaveLength(1);
    });
  });

  describe("useTargetCpa", () => {
    it("fetches target CPA for campaign", async () => {
      server.use(
        http.get(`${API_URL}/google-ads/v1/accounts/acc-1/campaigns/campaign-1/target-cpa`, () => {
          return HttpResponse.json(mockTargetCpa);
        }),
      );

      const { result } = renderHook(() => useTargetCpa("acc-1", "campaign-1"), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.target_cpa_micros).toBe(5000000);
      expect(result.current.data?.currency_code).toBe("USD");
    });

    it("does not fetch when accountId is empty", () => {
      const { result } = renderHook(() => useTargetCpa("", "campaign-1"), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
    });

    it("does not fetch when campaignId is empty", () => {
      const { result } = renderHook(() => useTargetCpa("acc-1", ""), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
    });
  });

  describe("useSetTargetCpa", () => {
    it("sets target CPA successfully", async () => {
      const updatedCpa = { ...mockTargetCpa, target_cpa_micros: 7500000 };
      server.use(
        http.put(`${API_URL}/google-ads/v1/accounts/acc-1/campaigns/campaign-1/target-cpa`, () => {
          return HttpResponse.json(updatedCpa);
        }),
        http.get(`${API_URL}/google-ads/v1/accounts/acc-1/campaigns/campaign-1/target-cpa`, () => {
          return HttpResponse.json(updatedCpa);
        }),
      );

      const { result } = renderHook(() => useSetTargetCpa(), { wrapper });

      result.current.mutate({
        accountId: "acc-1",
        campaignId: "campaign-1",
        request: { target_cpa_micros: 7500000, currency_code: "USD" },
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.target_cpa_micros).toBe(7500000);
    });

    it("shows success toast with formatted CPA", async () => {
      const { toast } = await import("sonner");
      const updatedCpa = { ...mockTargetCpa, target_cpa_micros: 7500000 };
      server.use(
        http.put(`${API_URL}/google-ads/v1/accounts/acc-1/campaigns/campaign-1/target-cpa`, () => {
          return HttpResponse.json(updatedCpa);
        }),
        http.get(`${API_URL}/google-ads/v1/accounts/acc-1/campaigns/campaign-1/target-cpa`, () => {
          return HttpResponse.json(updatedCpa);
        }),
      );

      const { result } = renderHook(() => useSetTargetCpa(), { wrapper });

      result.current.mutate({
        accountId: "acc-1",
        campaignId: "campaign-1",
        request: { target_cpa_micros: 7500000, currency_code: "USD" },
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(toast.success).toHaveBeenCalledWith("Target CPA set to USD 7.50");
    });

    it("shows error toast on failure", async () => {
      const { toast } = await import("sonner");
      server.use(
        http.put(`${API_URL}/google-ads/v1/accounts/acc-1/campaigns/campaign-1/target-cpa`, () => {
          return HttpResponse.json({ detail: "Invalid CPA" }, { status: 400 });
        }),
        http.get(`${API_URL}/google-ads/v1/accounts/acc-1/campaigns/campaign-1/target-cpa`, () => {
          return HttpResponse.json(mockTargetCpa);
        }),
      );

      const { result } = renderHook(() => useSetTargetCpa(), { wrapper });

      result.current.mutate({
        accountId: "acc-1",
        campaignId: "campaign-1",
        request: { target_cpa_micros: -1, currency_code: "USD" },
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith(
        "Failed to update target CPA",
        expect.objectContaining({ description: expect.any(String) }),
      );
    });
  });
});
