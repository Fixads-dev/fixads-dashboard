"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/shared/lib/constants";
import { smartOptimizerApi } from "../api/smart-optimizer-api";
import type { SmartOptimizerApplyRequest, SmartOptimizerRequest } from "../types";

interface AnalyzeParams {
  accountId: string;
  request: SmartOptimizerRequest;
}

interface ApplyParams {
  accountId: string;
  request: SmartOptimizerApplyRequest;
}

export function useSmartOptimizerAnalyze() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accountId, request }: AnalyzeParams) =>
      smartOptimizerApi.analyze(accountId, request),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.SMART_OPTIMIZER_RESULT(data.optimization_run_id), data);
      const totalGenerated = data.summary.generated_headlines + data.summary.generated_descriptions;
      toast.success("Smart analysis complete", {
        description: `Generated ${totalGenerated} assets, found ${data.summary.bad_assets_found} bad assets`,
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
        description: `Created ${data.assets_created}, removed ${data.assets_removed} assets`,
      });
    },
    onError: (error) => {
      toast.error("Failed to apply changes", {
        description: error.message,
      });
    },
  });
}
