"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/lib/constants";
import { insightsApi } from "../api/insights-api";
import type { GeographicLevel, SegmentType } from "../types";

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

// ==================== Demographics ====================

export function useDemographics(
  accountId: string,
  campaignId: string,
  dateRange: string = "LAST_30_DAYS",
) {
  return useQuery({
    queryKey: QUERY_KEYS.DEMOGRAPHICS(accountId, campaignId, dateRange),
    queryFn: () => insightsApi.getDemographics(accountId, campaignId, dateRange),
    enabled: !!accountId && !!campaignId,
    staleTime: 5 * 60 * 1000,
  });
}

// ==================== Time Performance (Heatmap) ====================

export function useTimePerformance(
  accountId: string,
  campaignId: string,
  dateRange: string = "LAST_30_DAYS",
) {
  return useQuery({
    queryKey: QUERY_KEYS.TIME_PERFORMANCE(accountId, campaignId, dateRange),
    queryFn: () => insightsApi.getTimePerformance(accountId, campaignId, dateRange),
    enabled: !!accountId && !!campaignId,
    staleTime: 5 * 60 * 1000,
  });
}

// ==================== Auction Insights ====================

export function useAuctionInsights(
  accountId: string,
  campaignId: string,
  dateRange: string = "LAST_30_DAYS",
) {
  return useQuery({
    queryKey: QUERY_KEYS.AUCTION_INSIGHTS(accountId, campaignId, dateRange),
    queryFn: () => insightsApi.getAuctionInsights(accountId, campaignId, dateRange),
    enabled: !!accountId && !!campaignId,
    staleTime: 5 * 60 * 1000,
  });
}

// ==================== Geographic Performance ====================

export function useGeographicPerformance(
  accountId: string,
  campaignId: string,
  options: {
    level?: GeographicLevel;
    parentId?: string;
    dateRange?: string;
  } = {},
) {
  const level = options.level ?? "country";
  const parentId = options.parentId;
  const dateRange = options.dateRange ?? "LAST_30_DAYS";

  return useQuery({
    queryKey: QUERY_KEYS.GEOGRAPHIC_PERFORMANCE(accountId, campaignId, level, parentId),
    queryFn: () =>
      insightsApi.getGeographicPerformance(accountId, campaignId, {
        level,
        parentId,
        dateRange,
      }),
    enabled: !!accountId && !!campaignId,
    staleTime: 5 * 60 * 1000,
  });
}
