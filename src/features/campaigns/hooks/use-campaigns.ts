"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/lib/constants";
import { campaignsApi } from "../api/campaigns-api";
import type { CampaignFilters } from "../types";

export function useCampaigns(filters?: CampaignFilters) {
  return useQuery({
    queryKey: [...QUERY_KEYS.CAMPAIGNS(filters?.account_id ?? "all"), filters],
    queryFn: () => campaignsApi.getCampaigns(filters),
    enabled: !!filters?.account_id, // Require account_id
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCampaign(accountId: string, campaignId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.CAMPAIGN(accountId, campaignId),
    queryFn: () => campaignsApi.getCampaign(accountId, campaignId),
    enabled: !!accountId && !!campaignId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCampaignDetail(accountId: string, campaignId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.CAMPAIGN(accountId, campaignId), "detail"],
    queryFn: () => campaignsApi.getCampaignDetail(accountId, campaignId),
    enabled: !!accountId && !!campaignId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useDailyMetrics(accountId: string, campaignId: string, days: number = 30) {
  return useQuery({
    queryKey: [...QUERY_KEYS.CAMPAIGN(accountId, campaignId), "daily", days],
    queryFn: () => campaignsApi.getDailyMetrics(accountId, campaignId, days),
    enabled: !!accountId && !!campaignId,
    staleTime: 5 * 60 * 1000, // 5 minutes - daily data doesn't change as often
  });
}

export function useAssetGroups(accountId: string, campaignId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ASSET_GROUPS(campaignId),
    queryFn: () => campaignsApi.getAssetGroups(accountId, campaignId),
    enabled: !!accountId && !!campaignId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useTextAssets(accountId: string, campaignId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.TEXT_ASSETS(campaignId),
    queryFn: () => campaignsApi.getTextAssets(accountId, campaignId),
    enabled: !!accountId && !!campaignId,
    staleTime: 2 * 60 * 1000,
  });
}
