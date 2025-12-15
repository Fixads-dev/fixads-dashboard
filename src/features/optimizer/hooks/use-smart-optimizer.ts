"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { POLLING_INTERVALS, QUERY_KEYS } from "@/shared/lib/constants";
import { smartOptimizerApi } from "../api/smart-optimizer-api";
import type { ApplyChangesRequest, SmartOptimizerRequest } from "../types";

export function useSmartOptimizerAnalyze() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SmartOptimizerRequest) => smartOptimizerApi.analyze(request),
    onSuccess: (data) => {
      queryClient.setQueryData(["smart-optimizer-status", data.runId], data);
      toast.info("Smart analysis started", {
        description: "Detecting underperforming assets...",
      });
    },
    onError: (error) => {
      toast.error("Analysis failed", {
        description: error.message,
      });
    },
  });
}

export function useSmartOptimizerStatus(runId: string | null) {
  return useQuery({
    queryKey: ["smart-optimizer-status", runId],
    queryFn: () => smartOptimizerApi.getStatus(runId as string),
    enabled: !!runId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "completed" || status === "failed") {
        return false;
      }
      return POLLING_INTERVALS.OPTIMIZATION_STATUS;
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useApplySmartChanges() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ApplyChangesRequest) => smartOptimizerApi.applyChanges(request),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["asset-groups"] });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BAD_ASSET_HISTORY(variables.accountId),
      });
      toast.success("Changes applied", {
        description: `Successfully updated ${data.assetsModified} assets`,
      });
    },
    onError: (error) => {
      toast.error("Failed to apply changes", {
        description: error.message,
      });
    },
  });
}

export function useBadAssetHistory(accountId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.BAD_ASSET_HISTORY(accountId),
    queryFn: () => smartOptimizerApi.getBadAssetHistory(accountId),
    enabled: !!accountId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTargetCpa(accountId: string, campaignId: string) {
  return useQuery({
    queryKey: ["target-cpa", accountId, campaignId],
    queryFn: () => smartOptimizerApi.getTargetCpa(accountId, campaignId),
    enabled: !!accountId && !!campaignId,
  });
}

export function useSetTargetCpa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      accountId,
      campaignId,
      targetCpa,
    }: {
      accountId: string;
      campaignId: string;
      targetCpa: number;
    }) => smartOptimizerApi.setTargetCpa(accountId, campaignId, targetCpa),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["target-cpa", variables.accountId, variables.campaignId],
      });
      toast.success("Target CPA updated");
    },
    onError: (error) => {
      toast.error("Failed to update target CPA", {
        description: error.message,
      });
    },
  });
}
