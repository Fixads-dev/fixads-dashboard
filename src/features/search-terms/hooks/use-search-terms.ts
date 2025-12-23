"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/lib/constants";
import { searchTermsApi } from "../api/search-terms-api";
import type { SearchTermsFilters } from "../types";

/**
 * Hook to fetch search terms
 */
export function useSearchTerms(filters: SearchTermsFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.SEARCH_TERMS.list(filters),
    queryFn: () => searchTermsApi.getSearchTerms(filters),
    enabled: !!filters.account_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
