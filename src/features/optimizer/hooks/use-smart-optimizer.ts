"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/shared/lib/constants";
import { smartOptimizerApi } from "../api/smart-optimizer-api";
import type {
  SmartOptimizerApplyRequest,
  SmartOptimizerRequest,
  TargetCpaRequest,
} from "../types";

interface AnalyzeParams {
  accountId: string;
  request: SmartOptimizerRequest;
}

interface ApplyParams {
  accountId: string;
  request: SmartOptimizerApplyRequest;
}

interface SetTargetCpaParams {
  accountId: string;
  campaignId: string;
  request: TargetCpaRequest;
}

export function useSmartOptimizerAnalyze() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accountId, request }: AnalyzeParams) =>
      smartOptimizerApi.analyze(accountId, request),
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["smart-optimizer-result", data.optimization_run_id],
        data,
      );
      toast.success("Smart analysis complete", {
        description: `Found ${data.assets_to_remove.length} bad assets, generated ${data.assets_to_add.length} replacements`,
      });
    },
    onError: (error) => {
      toast.error("Analysis failed", {
        description: error.message,
      });
    },
  });
}

export function useApplySmartChanges() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accountId, request }: ApplyParams) =>
      smartOptimizerApi.applyChanges(accountId, request),
    onSuccess: (data, { accountId }) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["asset-groups"] });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BAD_ASSET_HISTORY(accountId),
      });
      toast.success("Changes applied", {
        description: `Removed ${data.assets_removed}, created ${data.assets_created} assets`,
      });
    },
    onError: (error) => {
      toast.error("Failed to apply changes", {
        description: error.message,
      });
    },
  });
}

export function useBadAssetHistory(accountId: string, campaignId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.BAD_ASSET_HISTORY(accountId),
    queryFn: () => smartOptimizerApi.getBadAssetHistory(accountId, campaignId),
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
    mutationFn: ({ accountId, campaignId, request }: SetTargetCpaParams) =>
      smartOptimizerApi.setTargetCpa(accountId, campaignId, request),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["target-cpa", variables.accountId, variables.campaignId],
      });
      const cpaDollars = data.target_cpa_micros / 1_000_000;
      toast.success(`Target CPA set to ${data.currency_code} ${cpaDollars.toFixed(2)}`);
    },
    onError: (error) => {
      toast.error("Failed to update target CPA", {
        description: error.message,
      });
    },
  });
}
