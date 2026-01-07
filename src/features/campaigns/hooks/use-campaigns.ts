"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/lib/constants";
import { campaignsApi } from "../api/campaigns-api";
import type { AccountCampaigns, CampaignFilters, CampaignStatus, GroupedCampaignsData } from "../types";

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

/**
 * Fetch campaigns for all accounts using single endpoint
 * Returns campaigns grouped by account for the "All Accounts" view
 * Uses GET /google-ads/v1/pmax/campaigns/all
 */
export function useAllAccountsCampaigns(status?: CampaignStatus): GroupedCampaignsData {
  const query = useQuery({
    queryKey: [...QUERY_KEYS.CAMPAIGNS("all"), "grouped", status],
    queryFn: () => campaignsApi.getAllCampaigns(status),
    staleTime: 2 * 60 * 1000,
  });

  const accountCampaigns: AccountCampaigns[] = (query.data?.accounts ?? []).map((account) => ({
    account_id: account.account_id,
    account_name: account.account_name || `Account ${account.customer_id}`,
    customer_id: account.customer_id,
    campaigns: account.campaigns,
    isLoading: false,
    isError: !!account.error,
    error: account.error,
  }));

  return {
    accounts: accountCampaigns,
    totalCampaigns: query.data?.total_campaigns ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
