"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/lib/constants";
import { insightsApi } from "../api/insights-api";
import type { SegmentType } from "../types";

// ==================== Placements ====================

export function usePlacements(accountId: string, campaignId: string, limit: number = 100) {
  return useQuery({
    queryKey: QUERY_KEYS.PLACEMENTS(accountId, campaignId),
    queryFn: () => insightsApi.getPlacements(accountId, campaignId, limit),
    enabled: !!accountId && !!campaignId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ==================== Top Combinations ====================

export function useTopCombinations(accountId: string, assetGroupId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.TOP_COMBINATIONS(accountId, assetGroupId),
    queryFn: () => insightsApi.getTopCombinations(accountId, assetGroupId),
    enabled: !!accountId && !!assetGroupId,
    staleTime: 5 * 60 * 1000,
  });
}

// ==================== Segmented Performance ====================

export function useSegmentedPerformance(
  accountId: string,
  campaignId: string,
  segmentBy: SegmentType = "device",
) {
  return useQuery({
    queryKey: QUERY_KEYS.SEGMENTED_PERFORMANCE(accountId, campaignId, segmentBy),
    queryFn: () => insightsApi.getSegmentedPerformance(accountId, campaignId, segmentBy),
    enabled: !!accountId && !!campaignId,
    staleTime: 5 * 60 * 1000,
  });
}

// ==================== Asset Group Signals ====================

export function useSignals(accountId: string, assetGroupId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.SIGNALS(accountId, assetGroupId),
    queryFn: () => insightsApi.getSignals(accountId, assetGroupId),
    enabled: !!accountId && !!assetGroupId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAddSearchThemeSignal(accountId: string, assetGroupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (searchTheme: string) =>
      insightsApi.addSearchThemeSignal(accountId, assetGroupId, searchTheme),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SIGNALS(accountId, assetGroupId),
      });
    },
  });
}

export function useAddAudienceSignal(accountId: string, assetGroupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (audienceId: string) =>
      insightsApi.addAudienceSignal(accountId, assetGroupId, audienceId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SIGNALS(accountId, assetGroupId),
      });
    },
  });
}

export function useRemoveSignal(accountId: string, assetGroupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (signalId: string) =>
      insightsApi.removeSignal(accountId, assetGroupId, signalId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SIGNALS(accountId, assetGroupId),
      });
    },
  });
}

// ==================== Products ====================

export function useProducts(accountId: string, campaignId: string, limit: number = 100) {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCTS(accountId, campaignId),
    queryFn: () => insightsApi.getProducts(accountId, campaignId, limit),
    enabled: !!accountId && !!campaignId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductGroups(accountId: string, campaignId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCT_GROUPS(accountId, campaignId),
    queryFn: () => insightsApi.getProductGroups(accountId, campaignId),
    enabled: !!accountId && !!campaignId,
    staleTime: 5 * 60 * 1000,
  });
}

// ==================== Simulations ====================

export function useSimulations(accountId: string, campaignId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.SIMULATIONS(accountId, campaignId),
    queryFn: () => insightsApi.getSimulations(accountId, campaignId),
    enabled: !!accountId && !!campaignId,
    staleTime: 10 * 60 * 1000, // 10 minutes - simulations don't change often
  });
}

// ==================== Audiences ====================

export function useAudiences(accountId: string, customerId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.AUDIENCES.all(accountId),
    queryFn: () => insightsApi.getAudiences(accountId, customerId),
    enabled: !!accountId && !!customerId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserLists(accountId: string, customerId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.AUDIENCES.userLists(accountId),
    queryFn: () => insightsApi.getUserLists(accountId, customerId),
    enabled: !!accountId && !!customerId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCombinedAudiences(accountId: string, customerId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.AUDIENCES.combined(accountId),
    queryFn: () => insightsApi.getCombinedAudiences(accountId, customerId),
    enabled: !!accountId && !!customerId,
    staleTime: 5 * 60 * 1000,
  });
}
