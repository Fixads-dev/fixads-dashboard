"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/lib/constants";
import { changeHistoryApi } from "../api/change-history-api";
import type { ChangeHistoryFilters } from "../types";

/**
 * Hook to fetch change history
 */
export function useChangeHistory(filters: ChangeHistoryFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.CHANGE_HISTORY.list(filters),
    queryFn: () => changeHistoryApi.getChangeHistory(filters),
    enabled: !!filters.account_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
