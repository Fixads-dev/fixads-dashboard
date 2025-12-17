"use client";

import { useQuery } from "@tanstack/react-query";
import { recommendationsApi } from "../api/recommendations-api";
import type { RecommendationFilters, RecommendationType } from "../types";

/**
 * Query keys for recommendations
 */
export const RECOMMENDATIONS_QUERY_KEYS = {
  all: ["recommendations"] as const,
  list: (accountId: string) => ["recommendations", accountId] as const,
  listFiltered: (filters: RecommendationFilters) =>
    ["recommendations", filters.account_id, filters] as const,
  detail: (accountId: string, id: string) => ["recommendations", accountId, "detail", id] as const,
  campaign: (accountId: string, campaignId: string) =>
    ["recommendations", accountId, "campaign", campaignId] as const,
};

/**
 * Fetch recommendations for an account with optional filters
 */
export function useRecommendations(filters: RecommendationFilters) {
  return useQuery({
    queryKey: RECOMMENDATIONS_QUERY_KEYS.listFiltered(filters),
    queryFn: () => recommendationsApi.getRecommendations(filters),
    enabled: !!filters.account_id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetch a single recommendation by ID
 */
export function useRecommendation(accountId: string, recommendationId: string) {
  return useQuery({
    queryKey: RECOMMENDATIONS_QUERY_KEYS.detail(accountId, recommendationId),
    queryFn: () => recommendationsApi.getRecommendation(accountId, recommendationId),
    enabled: !!accountId && !!recommendationId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Fetch recommendations for a specific campaign
 */
export function useCampaignRecommendations(
  accountId: string,
  campaignId: string,
  types?: RecommendationType[],
) {
  return useQuery({
    queryKey: [...RECOMMENDATIONS_QUERY_KEYS.campaign(accountId, campaignId), types],
    queryFn: () => recommendationsApi.getCampaignRecommendations(accountId, campaignId, types),
    enabled: !!accountId && !!campaignId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get summary stats for campaign recommendations (for widget)
 */
export function useCampaignRecommendationsSummary(accountId: string, campaignId: string) {
  const { data, isLoading, error } = useCampaignRecommendations(accountId, campaignId);

  const summary = data
    ? {
        total: data.total_count,
        byCategory: data.recommendations.reduce(
          (acc, rec) => {
            const category = getCategory(rec.type);
            acc[category] = (acc[category] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
        highImpact: data.recommendations.filter((rec) => hasHighImpact(rec.impact)).length,
      }
    : null;

  return { summary, isLoading, error };
}

// Helper to categorize recommendation types
function getCategory(type: RecommendationType): string {
  const budgetTypes = ["CAMPAIGN_BUDGET", "MOVE_UNUSED_BUDGET", "FORECASTING_CAMPAIGN_BUDGET"];
  const biddingTypes = ["TARGET_CPA_OPT_IN", "TARGET_ROAS_OPT_IN", "MAXIMIZE_CONVERSIONS_OPT_IN"];
  const keywordTypes = ["KEYWORD", "KEYWORD_MATCH_TYPE", "USE_BROAD_MATCH_KEYWORD"];
  const adTypes = ["TEXT_AD", "RESPONSIVE_SEARCH_AD", "RESPONSIVE_SEARCH_AD_ASSET"];

  if (budgetTypes.includes(type)) return "Budget";
  if (biddingTypes.includes(type)) return "Bidding";
  if (keywordTypes.includes(type)) return "Keywords";
  if (adTypes.includes(type)) return "Ads";
  return "Other";
}

// Helper to determine if impact is significant
function hasHighImpact(
  impact: {
    base_metrics: { conversions: number };
    potential_metrics: { conversions: number };
  } | null,
): boolean {
  if (!impact) return false;
  const base = impact.base_metrics.conversions;
  const potential = impact.potential_metrics.conversions;
  if (base === 0) return potential > 0;
  return (potential - base) / base > 0.1; // 10% improvement
}
