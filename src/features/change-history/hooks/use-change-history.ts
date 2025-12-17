"use client";

import { useQuery } from "@tanstack/react-query";
import { changeHistoryApi } from "../api/change-history-api";
import type { ChangeHistoryFilters } from "../types";

/**
 * Query keys for change history
 */
export const CHANGE_HISTORY_QUERY_KEYS = {
  all: ["change-history"] as const,
  list: (filters: ChangeHistoryFilters) =>
    [...CHANGE_HISTORY_QUERY_KEYS.all, "list", filters] as const,
};

/**
 * Hook to fetch change history
 */
export function useChangeHistory(filters: ChangeHistoryFilters) {
  return useQuery({
    queryKey: CHANGE_HISTORY_QUERY_KEYS.list(filters),
    queryFn: () => changeHistoryApi.getChangeHistory(filters),
    enabled: !!filters.account_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
