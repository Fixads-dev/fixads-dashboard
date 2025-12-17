"use client";

import { useQuery } from "@tanstack/react-query";
import { accountOverviewApi } from "../api/account-overview-api";
import type { AccountOverviewFilters } from "../types";

/**
 * Query keys for account overview
 */
export const ACCOUNT_OVERVIEW_QUERY_KEYS = {
  all: ["account-overview"] as const,
  detail: (filters: AccountOverviewFilters) =>
    [...ACCOUNT_OVERVIEW_QUERY_KEYS.all, "detail", filters] as const,
};

/**
 * Hook to fetch account overview
 */
export function useAccountOverview(filters: AccountOverviewFilters) {
  return useQuery({
    queryKey: ACCOUNT_OVERVIEW_QUERY_KEYS.detail(filters),
    queryFn: () => accountOverviewApi.getAccountOverview(filters),
    enabled: !!filters.account_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
