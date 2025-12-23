"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/lib/constants";
import { conversionsApi } from "../api/conversions-api";
import type { ConversionActionsFilters } from "../types";

/**
 * Hook to fetch conversion actions
 */
export function useConversionActions(filters: ConversionActionsFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.CONVERSIONS.list(filters),
    queryFn: () => conversionsApi.getConversionActions(filters),
    enabled: !!filters.account_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
