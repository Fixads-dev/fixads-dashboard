import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useConversionActions } from "@/features/conversions/hooks/use-conversions";
import { server } from "../../../utils/mocks/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const mockConversionActionsResponse = {
  conversion_actions: [
    {
      conversion_action_id: "conv-1",
      name: "Purchase",
      type: "WEBPAGE",
      status: "ENABLED",
      category: "PURCHASE",
      primary_for_goal: true,
      counting_type: "ONE_PER_CLICK",
      default_value: 50.0,
      always_use_default_value: false,
      attribution_model: "GOOGLE_SEARCH_ATTRIBUTION_DATA_DRIVEN",
    },
    {
      conversion_action_id: "conv-2",
      name: "Lead Form Submit",
      type: "WEBPAGE",
      status: "ENABLED",
      category: "SUBMIT_LEAD_FORM",
      primary_for_goal: true,
      counting_type: "ONE_PER_CLICK",
      default_value: null,
      always_use_default_value: false,
      attribution_model: "GOOGLE_ADS_LAST_CLICK",
    },
    {
      conversion_action_id: "conv-3",
      name: "Phone Call",
      type: "CLICK_TO_CALL",
      status: "PAUSED",
      category: "PHONE_CALL_LEAD",
      primary_for_goal: false,
      counting_type: "MANY_PER_CLICK",
      default_value: 25.0,
      always_use_default_value: true,
      attribution_model: null,
    },
  ],
  total_count: 3,
};

describe("useConversionActions hook", () => {
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

  it("fetches conversion actions with account_id", async () => {
    server.use(
      http.get(`${API_URL}/google-ads/v1/conversions`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("account_id") === "acc-1") {
          return HttpResponse.json(mockConversionActionsResponse);
        }
        return HttpResponse.json({ conversion_actions: [], total_count: 0 });
      }),
    );

    const { result } = renderHook(() => useConversionActions({ account_id: "acc-1" }), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.conversion_actions).toHaveLength(3);
    expect(result.current.data?.total_count).toBe(3);
  });

  it("does not fetch when account_id is empty", () => {
    const { result } = renderHook(() => useConversionActions({ account_id: "" }), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
  });

  it("returns conversion action details correctly", async () => {
    server.use(
      http.get(`${API_URL}/google-ads/v1/conversions`, () => {
        return HttpResponse.json(mockConversionActionsResponse);
      }),
    );

    const { result } = renderHook(() => useConversionActions({ account_id: "acc-1" }), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const purchaseAction = result.current.data?.conversion_actions[0];
    expect(purchaseAction?.name).toBe("Purchase");
    expect(purchaseAction?.type).toBe("WEBPAGE");
    expect(purchaseAction?.category).toBe("PURCHASE");
    expect(purchaseAction?.primary_for_goal).toBe(true);
    expect(purchaseAction?.default_value).toBe(50.0);
  });

  it("handles error response", async () => {
    server.use(
      http.get(`${API_URL}/google-ads/v1/conversions`, () => {
        return HttpResponse.json({ detail: "Failed to fetch conversions" }, { status: 501 });
      }),
    );

    const { result } = renderHook(() => useConversionActions({ account_id: "acc-1" }), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it("handles empty conversion actions", async () => {
    server.use(
      http.get(`${API_URL}/google-ads/v1/conversions`, () => {
        return HttpResponse.json({ conversion_actions: [], total_count: 0 });
      }),
    );

    const { result } = renderHook(() => useConversionActions({ account_id: "acc-1" }), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.conversion_actions).toHaveLength(0);
    expect(result.current.data?.total_count).toBe(0);
  });
});
