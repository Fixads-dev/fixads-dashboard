"use client";

import { useQuery } from "@tanstack/react-query";
import { searchTermsApi } from "../api/search-terms-api";
import type { SearchTermsFilters } from "../types";

/**
 * Query keys for search terms
 */
export const SEARCH_TERMS_QUERY_KEYS = {
  all: ["search-terms"] as const,
  list: (filters: SearchTermsFilters) => [...SEARCH_TERMS_QUERY_KEYS.all, "list", filters] as const,
};

/**
 * Hook to fetch search terms
 */
export function useSearchTerms(filters: SearchTermsFilters) {
  return useQuery({
    queryKey: SEARCH_TERMS_QUERY_KEYS.list(filters),
    queryFn: () => searchTermsApi.getSearchTerms(filters),
    enabled: !!filters.account_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
