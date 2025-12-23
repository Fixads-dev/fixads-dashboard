"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/shared/lib/constants";
import { experimentationApi } from "../api/experimentation-api";
import type {
  BeliefUpdateRequest,
  MABState,
  MABStateCreateRequest,
  SelectionRequest,
} from "../types";

// ==================== MAB State Hooks ====================

/**
 * Fetch MAB states for an account/campaign
 */
export function useMABStates(accountId: string, campaignId?: string, platform?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.EXPERIMENTATION.mabStates(accountId), campaignId, platform],
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
    queryKey: [...QUERY_KEYS.EXPERIMENTATION.mabState(assetId), platform],
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
        queryKey: QUERY_KEYS.EXPERIMENTATION.mabStates(data.account_id),
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
    queryKey: [...QUERY_KEYS.EXPERIMENTATION.campaignProbabilities(campaignId), platform],
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
    queryKey: [...QUERY_KEYS.EXPERIMENTATION.beliefHistory(assetId), limit, platform],
    queryFn: () => experimentationApi.getBeliefHistory(assetId, limit, platform),
    enabled: !!assetId,
    staleTime: 60 * 1000,
  });
}

/**
 * Update belief state with conversion data
 * Uses optimistic update to show new probability immediately
 * Note: Backend returns BeliefUpdateResponse (not full MABState)
 * Pass campaignId to invalidate campaign probabilities cache
 */
export function useUpdateBelief(campaignId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BeliefUpdateRequest) => experimentationApi.updateBelief(request),
    onMutate: async (request) => {
      const stateQueryKey = QUERY_KEYS.EXPERIMENTATION.mabState(request.asset_id);

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: stateQueryKey });
      if (campaignId) {
        await queryClient.cancelQueries({
          queryKey: QUERY_KEYS.EXPERIMENTATION.campaignProbabilities(campaignId),
        });
      }

      // Snapshot previous values
      const previousState = queryClient.getQueryData<MABState>(stateQueryKey);

      // Optimistically update belief state
      if (previousState) {
        // Calculate new alpha/beta: alpha += conversions, beta += (clicks - conversions)
        const newAlpha = previousState.alpha + request.conversions;
        const newBeta = previousState.beta + (request.clicks - request.conversions);
        const newExpectedValue = newAlpha / (newAlpha + newBeta);

        queryClient.setQueryData<MABState>(stateQueryKey, {
          ...previousState,
          alpha: newAlpha,
          beta: newBeta,
          expected_value: newExpectedValue,
          win_probability: newExpectedValue,
          total_trials: previousState.total_trials + request.clicks,
          total_successes: previousState.total_successes + request.conversions,
          last_updated_at: new Date().toISOString(),
        });
      }

      return { previousState, stateQueryKey };
    },
    onSuccess: (data) => {
      // Update with server response values
      const stateQueryKey = QUERY_KEYS.EXPERIMENTATION.mabState(data.asset_id);
      queryClient.setQueryData<MABState>(stateQueryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          alpha: data.alpha,
          beta: data.beta,
          expected_value: data.expected_value,
          win_probability: data.expected_value,
          total_trials: data.total_trials,
          status: data.status,
        };
      });

      toast.success("Belief state updated", {
        description: `Win probability: ${((data.alpha / (data.alpha + data.beta)) * 100).toFixed(1)}%`,
      });
    },
    onError: (error, _request, context) => {
      // Rollback on error
      if (context?.previousState && context?.stateQueryKey) {
        queryClient.setQueryData(context.stateQueryKey, context.previousState);
      }
      toast.error("Failed to update belief state", {
        description: error.message,
      });
    },
    onSettled: (_data, _error, request) => {
      // Refetch to ensure sync with server
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.EXPERIMENTATION.mabState(request.asset_id),
      });
      if (campaignId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.EXPERIMENTATION.campaignProbabilities(campaignId),
        });
      }
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
    queryKey: [...QUERY_KEYS.EXPERIMENTATION.industryPriors, platform],
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
    queryKey: QUERY_KEYS.EXPERIMENTATION.pendingOptimizations(campaignId),
    queryFn: () => experimentationApi.getPendingOptimizations(campaignId),
    enabled: !!campaignId,
    staleTime: 30 * 1000,
  });
}
