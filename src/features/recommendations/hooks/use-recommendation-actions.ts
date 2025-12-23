"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { recommendationsApi } from "../api/recommendations-api";
import type {
  ApplyRecommendationRequest,
  ApplyRecommendationsBatchRequest,
  DismissRecommendationRequest,
  DismissRecommendationsBatchRequest,
  RecommendationsResponse,
} from "../types";
import { RECOMMENDATIONS_QUERY_KEYS } from "./use-recommendations";

/**
 * Apply a single recommendation with optimistic update
 */
export function useApplyRecommendation(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ApplyRecommendationRequest) =>
      recommendationsApi.applyRecommendation(accountId, request),
    onMutate: async (request) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: RECOMMENDATIONS_QUERY_KEYS.list(accountId),
      });

      // Snapshot previous value
      const previousData = queryClient.getQueriesData<RecommendationsResponse>({
        queryKey: RECOMMENDATIONS_QUERY_KEYS.list(accountId),
      });

      // Optimistically remove the recommendation from all matching queries
      queryClient.setQueriesData<RecommendationsResponse>(
        { queryKey: RECOMMENDATIONS_QUERY_KEYS.list(accountId) },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            recommendations: old.recommendations.filter(
              (r) => r.recommendation_id !== request.recommendation_id,
            ),
            total_count: old.total_count - 1,
          };
        },
      );

      return { previousData };
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Recommendation applied successfully");
      } else {
        toast.error(`Failed to apply: ${response.error_message}`);
      }
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        for (const [queryKey, data] of context.previousData) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      toast.error(
        `Error applying recommendation: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    },
    onSettled: () => {
      // Refetch to ensure sync with server
      queryClient.invalidateQueries({
        queryKey: RECOMMENDATIONS_QUERY_KEYS.list(accountId),
      });
    },
  });
}

/**
 * Apply multiple recommendations at once with optimistic update
 */
export function useApplyRecommendationsBatch(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ApplyRecommendationsBatchRequest) =>
      recommendationsApi.applyRecommendationsBatch(accountId, request),
    onMutate: async (request) => {
      await queryClient.cancelQueries({
        queryKey: RECOMMENDATIONS_QUERY_KEYS.list(accountId),
      });

      const previousData = queryClient.getQueriesData<RecommendationsResponse>({
        queryKey: RECOMMENDATIONS_QUERY_KEYS.list(accountId),
      });

      // Optimistically remove all recommendations being applied
      const idsToRemove = new Set(request.recommendation_ids);
      queryClient.setQueriesData<RecommendationsResponse>(
        { queryKey: RECOMMENDATIONS_QUERY_KEYS.list(accountId) },
        (old) => {
          if (!old) return old;
          const filtered = old.recommendations.filter((r) => !idsToRemove.has(r.recommendation_id));
          return {
            ...old,
            recommendations: filtered,
            total_count: old.total_count - (old.recommendations.length - filtered.length),
          };
        },
      );

      return { previousData };
    },
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
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        for (const [queryKey, data] of context.previousData) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      toast.error(
        `Error applying recommendations: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: RECOMMENDATIONS_QUERY_KEYS.list(accountId),
      });
    },
  });
}

/**
 * Dismiss a single recommendation with optimistic update
 */
export function useDismissRecommendation(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: DismissRecommendationRequest) =>
      recommendationsApi.dismissRecommendation(accountId, request),
    onMutate: async (request) => {
      await queryClient.cancelQueries({
        queryKey: RECOMMENDATIONS_QUERY_KEYS.list(accountId),
      });

      const previousData = queryClient.getQueriesData<RecommendationsResponse>({
        queryKey: RECOMMENDATIONS_QUERY_KEYS.list(accountId),
      });

      // Optimistically mark as dismissed or remove from list
      queryClient.setQueriesData<RecommendationsResponse>(
        { queryKey: RECOMMENDATIONS_QUERY_KEYS.list(accountId) },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            recommendations: old.recommendations.filter(
              (r) => r.recommendation_id !== request.recommendation_id,
            ),
            total_count: old.total_count - 1,
          };
        },
      );

      return { previousData };
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Recommendation dismissed");
      } else {
        toast.error(`Failed to dismiss: ${response.error_message}`);
      }
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        for (const [queryKey, data] of context.previousData) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      toast.error(
        `Error dismissing recommendation: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: RECOMMENDATIONS_QUERY_KEYS.list(accountId),
      });
    },
  });
}

/**
 * Dismiss multiple recommendations at once with optimistic update
 */
export function useDismissRecommendationsBatch(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: DismissRecommendationsBatchRequest) =>
      recommendationsApi.dismissRecommendationsBatch(accountId, request),
    onMutate: async (request) => {
      await queryClient.cancelQueries({
        queryKey: RECOMMENDATIONS_QUERY_KEYS.list(accountId),
      });

      const previousData = queryClient.getQueriesData<RecommendationsResponse>({
        queryKey: RECOMMENDATIONS_QUERY_KEYS.list(accountId),
      });

      // Optimistically remove all recommendations being dismissed
      const idsToRemove = new Set(request.recommendation_ids);
      queryClient.setQueriesData<RecommendationsResponse>(
        { queryKey: RECOMMENDATIONS_QUERY_KEYS.list(accountId) },
        (old) => {
          if (!old) return old;
          const filtered = old.recommendations.filter((r) => !idsToRemove.has(r.recommendation_id));
          return {
            ...old,
            recommendations: filtered,
            total_count: old.total_count - (old.recommendations.length - filtered.length),
          };
        },
      );

      return { previousData };
    },
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
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        for (const [queryKey, data] of context.previousData) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      toast.error(
        `Error dismissing recommendations: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: RECOMMENDATIONS_QUERY_KEYS.list(accountId),
      });
    },
  });
}
