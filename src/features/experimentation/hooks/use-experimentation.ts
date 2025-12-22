"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { experimentationApi } from "../api/experimentation-api";
import type { BeliefUpdateRequest, MABStateCreateRequest, SelectionRequest } from "../types";

/**
 * Query keys for experimentation feature
 */
export const EXPERIMENTATION_QUERY_KEYS = {
  MAB_STATES: (accountId: string) => ["mab-states", accountId] as const,
  MAB_STATE: (assetId: string) => ["mab-state", assetId] as const,
  CAMPAIGN_PROBABILITIES: (campaignId: string) => ["campaign-probabilities", campaignId] as const,
  BELIEF_HISTORY: (assetId: string) => ["belief-history", assetId] as const,
  INDUSTRY_PRIORS: ["industry-priors"] as const,
  PENDING_OPTIMIZATIONS: (campaignId: string) => ["pending-optimizations", campaignId] as const,
} as const;

// ==================== MAB State Hooks ====================

/**
 * Fetch MAB states for an account/campaign
 */
export function useMABStates(accountId: string, campaignId?: string, platform?: string) {
  return useQuery({
    queryKey: [...EXPERIMENTATION_QUERY_KEYS.MAB_STATES(accountId), campaignId, platform],
    queryFn: () => experimentationApi.listStates(accountId, campaignId, platform),
    enabled: !!accountId,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Fetch a single MAB state for an asset
 */
export function useMABState(assetId: string, platform = "GOOGLE_ADS") {
  return useQuery({
    queryKey: [...EXPERIMENTATION_QUERY_KEYS.MAB_STATE(assetId), platform],
    queryFn: () => experimentationApi.getState(assetId, platform),
    enabled: !!assetId,
    staleTime: 60 * 1000,
  });
}

/**
 * Create a new MAB state
 */
export function useCreateMABState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: MABStateCreateRequest) => experimentationApi.createState(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: EXPERIMENTATION_QUERY_KEYS.MAB_STATES(data.account_id),
      });
      toast.success("MAB state initialized", {
        description: `Asset ${data.asset_id.slice(0, 8)}... initialized with ${data.prior_source} prior`,
      });
    },
    onError: (error) => {
      toast.error("Failed to initialize MAB state", {
        description: error.message,
      });
    },
  });
}

// ==================== Campaign Probabilities Hook ====================

/**
 * Fetch win probabilities for all assets in a campaign
 * This is the main hook for the experimentation dashboard
 */
export function useCampaignProbabilities(campaignId: string, platform = "GOOGLE_ADS") {
  return useQuery({
    queryKey: [...EXPERIMENTATION_QUERY_KEYS.CAMPAIGN_PROBABILITIES(campaignId), platform],
    queryFn: () => experimentationApi.getCampaignProbabilities(campaignId, platform),
    enabled: !!campaignId,
    staleTime: 30 * 1000, // 30 seconds - refresh frequently for live data
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });
}

// ==================== Belief History Hook ====================

/**
 * Fetch belief update history for an asset
 */
export function useBeliefHistory(assetId: string, limit = 50, platform?: string) {
  return useQuery({
    queryKey: [...EXPERIMENTATION_QUERY_KEYS.BELIEF_HISTORY(assetId), limit, platform],
    queryFn: () => experimentationApi.getBeliefHistory(assetId, limit, platform),
    enabled: !!assetId,
    staleTime: 60 * 1000,
  });
}

/**
 * Update belief state with conversion data
 * Note: Backend returns BeliefUpdateResponse (not full MABState)
 * Pass campaignId to invalidate campaign probabilities cache
 */
export function useUpdateBelief(campaignId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BeliefUpdateRequest) => experimentationApi.updateBelief(request),
    onSuccess: (data) => {
      // Invalidate the single asset state
      queryClient.invalidateQueries({
        queryKey: EXPERIMENTATION_QUERY_KEYS.MAB_STATE(data.asset_id),
      });
      // Invalidate campaign probabilities if campaignId provided
      if (campaignId) {
        queryClient.invalidateQueries({
          queryKey: EXPERIMENTATION_QUERY_KEYS.CAMPAIGN_PROBABILITIES(campaignId),
        });
      }
      toast.success("Belief state updated", {
        description: `Win probability: ${((data.alpha / (data.alpha + data.beta)) * 100).toFixed(1)}%`,
      });
    },
    onError: (error) => {
      toast.error("Failed to update belief state", {
        description: error.message,
      });
    },
  });
}

// ==================== Selection Hook ====================

/**
 * Select best assets using Thompson Sampling
 */
export function useSelectAssets() {
  return useMutation({
    mutationFn: (request: SelectionRequest) => experimentationApi.selectAssets(request),
    onSuccess: (data) => {
      toast.success(`Selected ${data.selected_asset_ids.length} assets`, {
        description: `Strategy: ${data.strategy_name}, from ${data.eligible_candidates} eligible candidates`,
      });
    },
    onError: (error) => {
      toast.error("Asset selection failed", {
        description: error.message,
      });
    },
  });
}

// ==================== Industry Priors Hook ====================

/**
 * Fetch available industry priors
 */
export function useIndustryPriors(platform?: string) {
  return useQuery({
    queryKey: [...EXPERIMENTATION_QUERY_KEYS.INDUSTRY_PRIORS, platform],
    queryFn: () => experimentationApi.listIndustryPriors(platform),
    staleTime: 5 * 60 * 1000, // 5 minutes - priors rarely change
  });
}

// ==================== Pending Optimizations Hook ====================

/**
 * Fetch pending optimization requests for a campaign
 */
export function usePendingOptimizations(campaignId: string) {
  return useQuery({
    queryKey: EXPERIMENTATION_QUERY_KEYS.PENDING_OPTIMIZATIONS(campaignId),
    queryFn: () => experimentationApi.getPendingOptimizations(campaignId),
    enabled: !!campaignId,
    staleTime: 30 * 1000,
  });
}
