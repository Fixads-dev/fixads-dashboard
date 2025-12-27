"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { budgetApi } from "../api/budget-api";
import type { UpdateBudgetRequest } from "../types";

// Budget-specific query keys
const BUDGET_KEYS = {
  all: ["budget"] as const,
  campaign: (accountId: string, campaignId: string) =>
    ["budget", "campaign", accountId, campaignId] as const,
  spend: (accountId: string, campaignId: string, dateRange: string) =>
    ["budget", "spend", accountId, campaignId, dateRange] as const,
  history: (accountId: string, campaignId: string) =>
    ["budget", "history", accountId, campaignId] as const,
  accountOverview: (accountId: string) =>
    ["budget", "overview", accountId] as const,
};

/**
 * Hook to get campaign budget details
 */
export function useCampaignBudget(accountId: string, campaignId: string) {
  return useQuery({
    queryKey: BUDGET_KEYS.campaign(accountId, campaignId),
    queryFn: () => budgetApi.getCampaignBudget(accountId, campaignId),
    enabled: !!accountId && !!campaignId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get budget spending details
 */
export function useBudgetSpend(
  accountId: string,
  campaignId: string,
  dateRange: string = "LAST_30_DAYS",
) {
  return useQuery({
    queryKey: BUDGET_KEYS.spend(accountId, campaignId, dateRange),
    queryFn: () => budgetApi.getBudgetSpend(accountId, campaignId, dateRange),
    enabled: !!accountId && !!campaignId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get budget change history
 */
export function useBudgetHistory(accountId: string, campaignId: string) {
  return useQuery({
    queryKey: BUDGET_KEYS.history(accountId, campaignId),
    queryFn: () => budgetApi.getBudgetHistory(accountId, campaignId),
    enabled: !!accountId && !!campaignId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get account-wide budget overview
 */
export function useAccountBudgetOverview(accountId: string) {
  return useQuery({
    queryKey: BUDGET_KEYS.accountOverview(accountId),
    queryFn: () => budgetApi.getAccountBudgetOverview(accountId),
    enabled: !!accountId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to update a campaign's budget
 */
export function useUpdateBudget(accountId: string, campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateBudgetRequest) =>
      budgetApi.updateBudget(accountId, campaignId, request),
    onSuccess: () => {
      // Invalidate budget-related queries
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.campaign(accountId, campaignId) });
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.spend(accountId, campaignId, "LAST_30_DAYS") });
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.accountOverview(accountId) });
    },
  });
}
