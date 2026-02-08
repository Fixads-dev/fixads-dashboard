"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/lib/constants";
import { budgetApi } from "../api/budget-api";
import type { UpdateBudgetRequest } from "../types";

/** @deprecated Use QUERY_KEYS.BUDGET from shared/lib/constants instead */
export const BUDGET_KEYS = QUERY_KEYS.BUDGET;

/**
 * Hook to get campaign budget details
 */
export function useCampaignBudget(accountId: string, campaignId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.BUDGET.campaign(accountId, campaignId),
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
    queryKey: QUERY_KEYS.BUDGET.spend(accountId, campaignId, dateRange),
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
    queryKey: QUERY_KEYS.BUDGET.history(accountId, campaignId),
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
    queryKey: QUERY_KEYS.BUDGET.accountOverview(accountId),
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUDGET.campaign(accountId, campaignId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUDGET.spend(accountId, campaignId, "LAST_30_DAYS") });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUDGET.accountOverview(accountId) });
    },
  });
}
