import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  useApplySmartChanges,
  useSmartOptimizerAnalyze,
} from "@/features/optimizer/hooks/use-smart-optimizer";
import { server } from "../../../utils/mocks/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockSmartAnalyzeResponse = {
  optimization_run_id: "smart-run-123",
  campaign_id: "campaign-1",
  campaign_name: "Test Campaign",
  asset_group_id: "ag-1",
  asset_group_name: "Asset Group 1",
  generated_assets: [
    {
      asset_type: "HEADLINE",
      text: "New AI Headline 1",
      char_count: 17,
      compliance_passed: true,
    },
    {
      asset_type: "HEADLINE",
      text: "New AI Headline 2",
      char_count: 17,
      compliance_passed: true,
    },
    {
      asset_type: "DESCRIPTION",
      text: "New AI Description",
      char_count: 18,
      compliance_passed: true,
    },
  ],
  assets_to_remove: [
    {
      asset_id: "asset-1",
      asset_type: "HEADLINE",
      text: "Old Bad Headline",
      reason_code: "ZOMBIE",
      severity_score: 0.9,
      metrics: { impressions: 50, clicks: 0 },
    },
  ],
  summary: {
    total_assets_analyzed: 10,
    generated_headlines: 2,
    generated_descriptions: 1,
    bad_assets_found: 1,
    compliance_passed: 3,
    compliance_failed: 0,
  },
};

const mockSmartApplyResponse = {
  optimization_run_id: "smart-run-123",
  assets_created: 3,
  assets_removed: 1,
  bad_assets_logged: 1,
  errors: [],
};

describe("useSmartOptimizer hooks", () => {
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

  describe("useSmartOptimizerAnalyze", () => {
    it("analyzes campaign with smart optimizer", async () => {
      server.use(
        http.post(`${API_URL}/google-ads/v1/pmax/smart-optimizer/analyze`, () => {
          return HttpResponse.json(mockSmartAnalyzeResponse);
        }),
      );

      const { result } = renderHook(() => useSmartOptimizerAnalyze(), { wrapper });

      result.current.mutate({
        accountId: "acc-1",
        request: {
          campaign_id: "campaign-1",
          asset_group_ids: ["ag-1"],
        },
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.optimization_run_id).toBe("smart-run-123");
      expect(result.current.data?.summary.generated_headlines).toBe(2);
      expect(result.current.data?.summary.bad_assets_found).toBe(1);
    });

    it("shows success toast with summary", async () => {
      const { toast } = await import("sonner");
      server.use(
        http.post(`${API_URL}/google-ads/v1/pmax/smart-optimizer/analyze`, () => {
          return HttpResponse.json(mockSmartAnalyzeResponse);
        }),
      );

      const { result } = renderHook(() => useSmartOptimizerAnalyze(), { wrapper });

      result.current.mutate({
        accountId: "acc-1",
        request: { campaign_id: "campaign-1", asset_group_ids: ["ag-1"] },
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(toast.success).toHaveBeenCalledWith(
        "Smart analysis complete",
        expect.objectContaining({
          description: expect.stringContaining("Generated 3 assets"),
        }),
      );
    });

    it("shows error toast on failure", async () => {
      const { toast } = await import("sonner");
      server.use(
        http.post(`${API_URL}/google-ads/v1/pmax/smart-optimizer/analyze`, () => {
          return HttpResponse.json({ detail: "Smart analysis failed" }, { status: 501 });
        }),
      );

      const { result } = renderHook(() => useSmartOptimizerAnalyze(), { wrapper });

      result.current.mutate({
        accountId: "acc-1",
        request: { campaign_id: "campaign-1", asset_group_ids: ["ag-1"] },
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

  describe("useApplySmartChanges", () => {
    it("applies smart optimizer changes", async () => {
      server.use(
        http.post(`${API_URL}/google-ads/v1/pmax/smart-optimizer/apply`, () => {
          return HttpResponse.json(mockSmartApplyResponse);
        }),
      );

      const { result } = renderHook(() => useApplySmartChanges(), { wrapper });

      result.current.mutate({
        accountId: "acc-1",
        request: {
          campaign_id: "campaign-1",
          optimization_run_id: "smart-run-123",
          assets_to_add: [{ asset_group_id: "ag-1", field_type: "HEADLINE", text: "New Headline" }],
          assets_to_remove: ["asset-1"],
        },
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.assets_created).toBe(3);
      expect(result.current.data?.assets_removed).toBe(1);
    });

    it("shows success toast after applying", async () => {
      const { toast } = await import("sonner");
      server.use(
        http.post(`${API_URL}/google-ads/v1/pmax/smart-optimizer/apply`, () => {
          return HttpResponse.json(mockSmartApplyResponse);
        }),
      );

      const { result } = renderHook(() => useApplySmartChanges(), { wrapper });

      result.current.mutate({
        accountId: "acc-1",
        request: {
          campaign_id: "campaign-1",
          optimization_run_id: "smart-run-123",
          assets_to_add: [],
          assets_to_remove: [],
        },
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(toast.success).toHaveBeenCalledWith(
        "Changes applied",
        expect.objectContaining({
          description: expect.stringContaining("Created 3"),
        }),
      );
    });

    it("shows error toast on failure", async () => {
      const { toast } = await import("sonner");
      server.use(
        http.post(`${API_URL}/google-ads/v1/pmax/smart-optimizer/apply`, () => {
          return HttpResponse.json({ detail: "Apply failed" }, { status: 501 });
        }),
      );

      const { result } = renderHook(() => useApplySmartChanges(), { wrapper });

      result.current.mutate({
        accountId: "acc-1",
        request: {
          campaign_id: "campaign-1",
          optimization_run_id: "smart-run-123",
          assets_to_add: [],
          assets_to_remove: [],
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
});
