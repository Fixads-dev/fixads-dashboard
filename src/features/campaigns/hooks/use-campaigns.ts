"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/lib/constants";
import { campaignsApi } from "../api/campaigns-api";
import type { CampaignFilters } from "../types";

export function useCampaigns(filters?: CampaignFilters) {
  return useQuery({
    queryKey: [...QUERY_KEYS.CAMPAIGNS(filters?.accountId ?? "all"), filters],
    queryFn: () => campaignsApi.getCampaigns(filters),
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

export function useAssetGroups(accountId: string, campaignId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ASSET_GROUPS(campaignId),
    queryFn: () => campaignsApi.getAssetGroups(accountId, campaignId),
    enabled: !!accountId && !!campaignId,
    staleTime: 2 * 60 * 1000,
  });
}
