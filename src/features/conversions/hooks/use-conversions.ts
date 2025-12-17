"use client";

import { useQuery } from "@tanstack/react-query";
import { conversionsApi } from "../api/conversions-api";
import type { ConversionActionsFilters } from "../types";

/**
 * Query keys for conversions
 */
export const CONVERSIONS_QUERY_KEYS = {
  all: ["conversions"] as const,
  list: (filters: ConversionActionsFilters) =>
    [...CONVERSIONS_QUERY_KEYS.all, "list", filters] as const,
};

/**
 * Hook to fetch conversion actions
 */
export function useConversionActions(filters: ConversionActionsFilters) {
  return useQuery({
    queryKey: CONVERSIONS_QUERY_KEYS.list(filters),
    queryFn: () => conversionsApi.getConversionActions(filters),
    enabled: !!filters.account_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
