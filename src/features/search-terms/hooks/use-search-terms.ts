"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/lib/constants";
import { searchTermsApi } from "../api/search-terms-api";
import type {
  AddKeywordRequest,
  BulkAddKeywordsRequest,
  SearchTermsFilters,
} from "../types";

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

/**
 * Hook to fetch search term recommendations
 */
export function useSearchTermRecommendations(
  accountId: string,
  campaignId?: string,
  dateRange: string = "LAST_30_DAYS",
) {
  return useQuery({
    queryKey: [...QUERY_KEYS.SEARCH_TERMS.all, "recommendations", accountId, campaignId, dateRange],
    queryFn: () => searchTermsApi.getRecommendations(accountId, campaignId, dateRange),
    enabled: !!accountId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to add a single keyword
 */
export function useAddKeyword(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AddKeywordRequest) =>
      searchTermsApi.addKeyword(accountId, request),
    onSuccess: () => {
      // Invalidate search terms to refresh status
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SEARCH_TERMS.all });
    },
  });
}

/**
 * Hook to bulk add keywords
 */
export function useBulkAddKeywords(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BulkAddKeywordsRequest) =>
      searchTermsApi.bulkAddKeywords(accountId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SEARCH_TERMS.all });
    },
  });
}
