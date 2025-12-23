"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/shared/lib/constants";
import { textOptimizerApi } from "../api/text-optimizer-api";
import type { TargetCpaRequest, TextOptimizerApplyRequest, TextOptimizerRequest } from "../types";

interface AnalyzeParams {
  accountId: string;
  request: TextOptimizerRequest;
}

interface ApplyParams {
  accountId: string;
  request: TextOptimizerApplyRequest;
}

interface SetTargetCpaParams {
  accountId: string;
  campaignId: string;
  request: TargetCpaRequest;
}

export function useTextOptimizerAnalyze() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accountId, request }: AnalyzeParams) =>
      textOptimizerApi.analyze(accountId, request),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.TEXT_OPTIMIZER_RESULT(data.optimization_run_id), data);
      toast.success("Text analysis complete", {
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

export function useApplyTextChanges() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accountId, request }: ApplyParams) =>
      textOptimizerApi.applyChanges(accountId, request),
    onSuccess: (data, { accountId, request }) => {
      // Selective cache invalidation - only invalidate affected resources
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CAMPAIGNS(accountId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CAMPAIGN(accountId, request.campaign_id),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ASSET_GROUPS(request.campaign_id),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TEXT_ASSETS(request.campaign_id),
      });
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
    queryFn: () => textOptimizerApi.getBadAssetHistory(accountId, campaignId),
    enabled: !!accountId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTargetCpa(accountId: string, campaignId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.TARGET_CPA(accountId, campaignId),
    queryFn: () => textOptimizerApi.getTargetCpa(accountId, campaignId),
    enabled: !!accountId && !!campaignId,
  });
}

export function useSetTargetCpa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accountId, campaignId, request }: SetTargetCpaParams) =>
      textOptimizerApi.setTargetCpa(accountId, campaignId, request),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TARGET_CPA(variables.accountId, variables.campaignId),
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
