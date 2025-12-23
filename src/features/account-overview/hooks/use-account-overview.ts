"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/lib/constants";
import { accountOverviewApi } from "../api/account-overview-api";
import type { AccountOverviewFilters } from "../types";

/**
 * Hook to fetch account overview
 */
export function useAccountOverview(filters: AccountOverviewFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.ACCOUNT_OVERVIEW.detail(filters),
    queryFn: () => accountOverviewApi.getAccountOverview(filters),
    enabled: !!filters.account_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
