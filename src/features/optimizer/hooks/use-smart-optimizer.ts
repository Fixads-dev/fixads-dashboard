"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
      queryClient.setQueryData(["smart-optimizer-result", data.optimization_run_id], data);
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["asset-groups"] });
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
