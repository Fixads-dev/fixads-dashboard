"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { recommendationsApi } from "../api/recommendations-api";
import type {
  ApplyRecommendationRequest,
  ApplyRecommendationsBatchRequest,
  DismissRecommendationRequest,
  DismissRecommendationsBatchRequest,
} from "../types";
import { RECOMMENDATIONS_QUERY_KEYS } from "./use-recommendations";

/**
 * Apply a single recommendation
 */
export function useApplyRecommendation(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ApplyRecommendationRequest) =>
      recommendationsApi.applyRecommendation(accountId, request),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Recommendation applied successfully");
        // Invalidate recommendations list to refresh
        queryClient.invalidateQueries({
          queryKey: RECOMMENDATIONS_QUERY_KEYS.list(accountId),
        });
      } else {
        toast.error(`Failed to apply: ${response.error_message}`);
      }
    },
    onError: (error) => {
      toast.error(
        `Error applying recommendation: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    },
  });
}

/**
 * Apply multiple recommendations at once
 */
export function useApplyRecommendationsBatch(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ApplyRecommendationsBatchRequest) =>
      recommendationsApi.applyRecommendationsBatch(accountId, request),
    onSuccess: (response) => {
      if (response.total_failed === 0) {
        toast.success(`Applied ${response.total_applied} recommendation(s) successfully`);
      } else if (response.total_applied > 0) {
        toast.warning(
          `Applied ${response.total_applied} recommendation(s), ${response.total_failed} failed`,
        );
      } else {
        toast.error(`Failed to apply recommendations`);
      }
      // Invalidate recommendations list to refresh
      queryClient.invalidateQueries({
        queryKey: RECOMMENDATIONS_QUERY_KEYS.list(accountId),
      });
    },
    onError: (error) => {
      toast.error(
        `Error applying recommendations: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    },
  });
}

/**
 * Dismiss a single recommendation
 */
export function useDismissRecommendation(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: DismissRecommendationRequest) =>
      recommendationsApi.dismissRecommendation(accountId, request),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Recommendation dismissed");
        // Invalidate recommendations list to refresh
        queryClient.invalidateQueries({
          queryKey: RECOMMENDATIONS_QUERY_KEYS.list(accountId),
        });
      } else {
        toast.error(`Failed to dismiss: ${response.error_message}`);
      }
    },
    onError: (error) => {
      toast.error(
        `Error dismissing recommendation: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    },
  });
}

/**
 * Dismiss multiple recommendations at once
 */
export function useDismissRecommendationsBatch(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: DismissRecommendationsBatchRequest) =>
      recommendationsApi.dismissRecommendationsBatch(accountId, request),
    onSuccess: (response) => {
      if (response.total_failed === 0) {
        toast.success(`Dismissed ${response.total_dismissed} recommendation(s)`);
      } else if (response.total_dismissed > 0) {
        toast.warning(
          `Dismissed ${response.total_dismissed} recommendation(s), ${response.total_failed} failed`,
        );
      } else {
        toast.error(`Failed to dismiss recommendations`);
      }
      // Invalidate recommendations list to refresh
      queryClient.invalidateQueries({
        queryKey: RECOMMENDATIONS_QUERY_KEYS.list(accountId),
      });
    },
    onError: (error) => {
      toast.error(
        `Error dismissing recommendations: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    },
  });
}
