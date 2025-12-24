import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useSearchTerms } from "@/features/search-terms/hooks/use-search-terms";
import { server } from "../../../utils/mocks/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const mockSearchTermsResponse = {
  search_terms: [
    {
      search_term: "buy running shoes online",
      status: "ADDED",
      campaign_id: "campaign-1",
      campaign_name: "Running Shoes Campaign",
      ad_group_id: "ag-1",
      ad_group_name: "Running Shoes",
      impressions: 5000,
      clicks: 250,
      ctr: 5.0,
      cost_micros: 25000000,
      conversions: 15,
      conversions_value: 1500.0,
    },
    {
      search_term: "cheap sneakers",
      status: "EXCLUDED",
      campaign_id: "campaign-1",
      campaign_name: "Running Shoes Campaign",
      ad_group_id: "ag-1",
      ad_group_name: "Running Shoes",
      impressions: 2000,
      clicks: 50,
      ctr: 2.5,
      cost_micros: 5000000,
      conversions: 0,
      conversions_value: 0,
    },
    {
      search_term: "best marathon shoes",
      status: "NONE",
      campaign_id: "campaign-1",
      campaign_name: "Running Shoes Campaign",
      ad_group_id: "ag-2",
      ad_group_name: "Marathon Shoes",
      impressions: 3000,
      clicks: 180,
      ctr: 6.0,
      cost_micros: 18000000,
      conversions: 12,
      conversions_value: 1200.0,
    },
  ],
  total_count: 3,
};

describe("useSearchTerms hook", () => {
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

  it("fetches search terms with account_id", async () => {
    server.use(
      http.get(`${API_URL}/google-ads/v1/search-terms`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("account_id") === "acc-1") {
          return HttpResponse.json(mockSearchTermsResponse);
        }
        return HttpResponse.json({ search_terms: [], total_count: 0 });
      }),
    );

    const { result } = renderHook(() => useSearchTerms({ account_id: "acc-1" }), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.search_terms).toHaveLength(3);
    expect(result.current.data?.total_count).toBe(3);
  });

  it("does not fetch when account_id is empty", () => {
    const { result } = renderHook(() => useSearchTerms({ account_id: "" }), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
  });

  it("filters by campaign_id when provided", async () => {
    server.use(
      http.get(`${API_URL}/google-ads/v1/search-terms`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("campaign_id") === "campaign-1") {
          return HttpResponse.json(mockSearchTermsResponse);
        }
        return HttpResponse.json({ search_terms: [], total_count: 0 });
      }),
    );

    const { result } = renderHook(
      () => useSearchTerms({ account_id: "acc-1", campaign_id: "campaign-1" }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.search_terms).toHaveLength(3);
  });

  it("filters by ad_group_id when provided", async () => {
    const filteredResponse = {
      search_terms: [mockSearchTermsResponse.search_terms[0]],
      total_count: 1,
    };

    server.use(
      http.get(`${API_URL}/google-ads/v1/search-terms`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("ad_group_id") === "ag-1") {
          return HttpResponse.json(filteredResponse);
        }
        return HttpResponse.json(mockSearchTermsResponse);
      }),
    );

    const { result } = renderHook(
      () => useSearchTerms({ account_id: "acc-1", ad_group_id: "ag-1" }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.search_terms).toHaveLength(1);
  });

  it("filters by date_range when provided", async () => {
    server.use(
      http.get(`${API_URL}/google-ads/v1/search-terms`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("date_range") === "LAST_30_DAYS") {
          return HttpResponse.json(mockSearchTermsResponse);
        }
        return HttpResponse.json({ search_terms: [], total_count: 0 });
      }),
    );

    const { result } = renderHook(
      () => useSearchTerms({ account_id: "acc-1", date_range: "LAST_30_DAYS" }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.search_terms).toHaveLength(3);
  });

  it("respects limit parameter", async () => {
    server.use(
      http.get(`${API_URL}/google-ads/v1/search-terms`, ({ request }) => {
        const url = new URL(request.url);
        const limit = url.searchParams.get("limit");

        if (limit === "1") {
          return HttpResponse.json({
            search_terms: [mockSearchTermsResponse.search_terms[0]],
            total_count: 3,
          });
        }
        return HttpResponse.json(mockSearchTermsResponse);
      }),
    );

    const { result } = renderHook(() => useSearchTerms({ account_id: "acc-1", limit: 1 }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.search_terms).toHaveLength(1);
    expect(result.current.data?.total_count).toBe(3);
  });

  it("returns search term details correctly", async () => {
    server.use(
      http.get(`${API_URL}/google-ads/v1/search-terms`, () => {
        return HttpResponse.json(mockSearchTermsResponse);
      }),
    );

    const { result } = renderHook(() => useSearchTerms({ account_id: "acc-1" }), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const firstTerm = result.current.data?.search_terms[0];
    expect(firstTerm?.search_term).toBe("buy running shoes online");
    expect(firstTerm?.status).toBe("ADDED");
    expect(firstTerm?.impressions).toBe(5000);
    expect(firstTerm?.clicks).toBe(250);
    expect(firstTerm?.conversions).toBe(15);
  });

  it("handles error response", async () => {
    server.use(
      http.get(`${API_URL}/google-ads/v1/search-terms`, () => {
        return HttpResponse.json({ detail: "Failed to fetch search terms" }, { status: 501 });
      }),
    );

    const { result } = renderHook(() => useSearchTerms({ account_id: "acc-1" }), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it("handles empty search terms", async () => {
    server.use(
      http.get(`${API_URL}/google-ads/v1/search-terms`, () => {
        return HttpResponse.json({ search_terms: [], total_count: 0 });
      }),
    );

    const { result } = renderHook(() => useSearchTerms({ account_id: "acc-1" }), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.search_terms).toHaveLength(0);
    expect(result.current.data?.total_count).toBe(0);
  });
});
