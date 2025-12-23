import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  useApplyRecommendation,
  useApplyRecommendationsBatch,
  useDismissRecommendation,
  useDismissRecommendationsBatch,
} from "@/features/recommendations/hooks/use-recommendation-actions";
import { server } from "../../../utils/mocks/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

const mockApplyResponse = {
  recommendation_id: "rec-1",
  success: true,
  resource_name: "customers/123/recommendations/rec-1",
  error_message: null,
};

const mockApplyBatchResponse = {
  results: [
    { recommendation_id: "rec-1", success: true, resource_name: "r1", error_message: null },
    { recommendation_id: "rec-2", success: true, resource_name: "r2", error_message: null },
  ],
  total_applied: 2,
  total_failed: 0,
};

const mockDismissResponse = {
  recommendation_id: "rec-1",
  success: true,
  error_message: null,
};

const mockDismissBatchResponse = {
  results: [
    { recommendation_id: "rec-1", success: true, error_message: null },
    { recommendation_id: "rec-2", success: true, error_message: null },
  ],
  total_dismissed: 2,
  total_failed: 0,
};

describe("useRecommendationActions hooks", () => {
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

  describe("useApplyRecommendation", () => {
    it("applies recommendation successfully", async () => {
      server.use(
        http.post(`${API_URL}/google-ads/v1/recommendations/apply`, () => {
          return HttpResponse.json(mockApplyResponse);
        }),
      );

      const { result } = renderHook(() => useApplyRecommendation("acc-1"), { wrapper });

      result.current.mutate({ recommendation_id: "rec-1" });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.success).toBe(true);
    });

    it("shows success toast when applied", async () => {
      const { toast } = await import("sonner");
      server.use(
        http.post(`${API_URL}/google-ads/v1/recommendations/apply`, () => {
          return HttpResponse.json(mockApplyResponse);
        }),
      );

      const { result } = renderHook(() => useApplyRecommendation("acc-1"), { wrapper });

      result.current.mutate({ recommendation_id: "rec-1" });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(toast.success).toHaveBeenCalledWith("Recommendation applied successfully");
    });

    it("shows error toast when apply fails from API", async () => {
      const { toast } = await import("sonner");
      const failedResponse = {
        ...mockApplyResponse,
        success: false,
        error_message: "Cannot apply to paused campaign",
      };
      server.use(
        http.post(`${API_URL}/google-ads/v1/recommendations/apply`, () => {
          return HttpResponse.json(failedResponse);
        }),
      );

      const { result } = renderHook(() => useApplyRecommendation("acc-1"), { wrapper });

      result.current.mutate({ recommendation_id: "rec-1" });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith("Failed to apply: Cannot apply to paused campaign");
    });

    it("shows error toast on network error", async () => {
      const { toast } = await import("sonner");
      server.use(
        http.post(`${API_URL}/google-ads/v1/recommendations/apply`, () => {
          return HttpResponse.json({ detail: "Server error" }, { status: 501 });
        }),
      );

      const { result } = renderHook(() => useApplyRecommendation("acc-1"), { wrapper });

      result.current.mutate({ recommendation_id: "rec-1" });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("Error applying recommendation"));
    });
  });

  describe("useApplyRecommendationsBatch", () => {
    it("applies batch of recommendations", async () => {
      server.use(
        http.post(`${API_URL}/google-ads/v1/recommendations/apply-batch`, () => {
          return HttpResponse.json(mockApplyBatchResponse);
        }),
      );

      const { result } = renderHook(() => useApplyRecommendationsBatch("acc-1"), { wrapper });

      result.current.mutate({ recommendation_ids: ["rec-1", "rec-2"] });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.total_applied).toBe(2);
    });

    it("shows success toast when all applied", async () => {
      const { toast } = await import("sonner");
      server.use(
        http.post(`${API_URL}/google-ads/v1/recommendations/apply-batch`, () => {
          return HttpResponse.json(mockApplyBatchResponse);
        }),
      );

      const { result } = renderHook(() => useApplyRecommendationsBatch("acc-1"), { wrapper });

      result.current.mutate({ recommendation_ids: ["rec-1", "rec-2"] });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(toast.success).toHaveBeenCalledWith("Applied 2 recommendation(s) successfully");
    });

    it("shows warning toast when some fail", async () => {
      const { toast } = await import("sonner");
      const partialResponse = { ...mockApplyBatchResponse, total_applied: 1, total_failed: 1 };
      server.use(
        http.post(`${API_URL}/google-ads/v1/recommendations/apply-batch`, () => {
          return HttpResponse.json(partialResponse);
        }),
      );

      const { result } = renderHook(() => useApplyRecommendationsBatch("acc-1"), { wrapper });

      result.current.mutate({ recommendation_ids: ["rec-1", "rec-2"] });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(toast.warning).toHaveBeenCalledWith("Applied 1 recommendation(s), 1 failed");
    });

    it("shows error toast when all fail", async () => {
      const { toast } = await import("sonner");
      const failedResponse = { ...mockApplyBatchResponse, total_applied: 0, total_failed: 2 };
      server.use(
        http.post(`${API_URL}/google-ads/v1/recommendations/apply-batch`, () => {
          return HttpResponse.json(failedResponse);
        }),
      );

      const { result } = renderHook(() => useApplyRecommendationsBatch("acc-1"), { wrapper });

      result.current.mutate({ recommendation_ids: ["rec-1", "rec-2"] });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith("Failed to apply recommendations");
    });
  });

  describe("useDismissRecommendation", () => {
    it("dismisses recommendation successfully", async () => {
      server.use(
        http.post(`${API_URL}/google-ads/v1/recommendations/dismiss`, () => {
          return HttpResponse.json(mockDismissResponse);
        }),
      );

      const { result } = renderHook(() => useDismissRecommendation("acc-1"), { wrapper });

      result.current.mutate({ recommendation_id: "rec-1" });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.success).toBe(true);
    });

    it("shows success toast when dismissed", async () => {
      const { toast } = await import("sonner");
      server.use(
        http.post(`${API_URL}/google-ads/v1/recommendations/dismiss`, () => {
          return HttpResponse.json(mockDismissResponse);
        }),
      );

      const { result } = renderHook(() => useDismissRecommendation("acc-1"), { wrapper });

      result.current.mutate({ recommendation_id: "rec-1" });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(toast.success).toHaveBeenCalledWith("Recommendation dismissed");
    });

    it("shows error toast when dismiss fails from API", async () => {
      const { toast } = await import("sonner");
      const failedResponse = {
        ...mockDismissResponse,
        success: false,
        error_message: "Cannot dismiss already applied",
      };
      server.use(
        http.post(`${API_URL}/google-ads/v1/recommendations/dismiss`, () => {
          return HttpResponse.json(failedResponse);
        }),
      );

      const { result } = renderHook(() => useDismissRecommendation("acc-1"), { wrapper });

      result.current.mutate({ recommendation_id: "rec-1" });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith("Failed to dismiss: Cannot dismiss already applied");
    });
  });

  describe("useDismissRecommendationsBatch", () => {
    it("dismisses batch of recommendations", async () => {
      server.use(
        http.post(`${API_URL}/google-ads/v1/recommendations/dismiss-batch`, () => {
          return HttpResponse.json(mockDismissBatchResponse);
        }),
      );

      const { result } = renderHook(() => useDismissRecommendationsBatch("acc-1"), { wrapper });

      result.current.mutate({ recommendation_ids: ["rec-1", "rec-2"] });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.total_dismissed).toBe(2);
    });

    it("shows success toast when all dismissed", async () => {
      const { toast } = await import("sonner");
      server.use(
        http.post(`${API_URL}/google-ads/v1/recommendations/dismiss-batch`, () => {
          return HttpResponse.json(mockDismissBatchResponse);
        }),
      );

      const { result } = renderHook(() => useDismissRecommendationsBatch("acc-1"), { wrapper });

      result.current.mutate({ recommendation_ids: ["rec-1", "rec-2"] });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(toast.success).toHaveBeenCalledWith("Dismissed 2 recommendation(s)");
    });

    it("shows warning toast when some fail", async () => {
      const { toast } = await import("sonner");
      const partialResponse = { ...mockDismissBatchResponse, total_dismissed: 1, total_failed: 1 };
      server.use(
        http.post(`${API_URL}/google-ads/v1/recommendations/dismiss-batch`, () => {
          return HttpResponse.json(partialResponse);
        }),
      );

      const { result } = renderHook(() => useDismissRecommendationsBatch("acc-1"), { wrapper });

      result.current.mutate({ recommendation_ids: ["rec-1", "rec-2"] });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(toast.warning).toHaveBeenCalledWith("Dismissed 1 recommendation(s), 1 failed");
    });

    it("shows error toast when all fail", async () => {
      const { toast } = await import("sonner");
      const failedResponse = { ...mockDismissBatchResponse, total_dismissed: 0, total_failed: 2 };
      server.use(
        http.post(`${API_URL}/google-ads/v1/recommendations/dismiss-batch`, () => {
          return HttpResponse.json(failedResponse);
        }),
      );

      const { result } = renderHook(() => useDismissRecommendationsBatch("acc-1"), { wrapper });

      result.current.mutate({ recommendation_ids: ["rec-1", "rec-2"] });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith("Failed to dismiss recommendations");
    });
  });
});
