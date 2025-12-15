"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { textOptimizerApi } from "../api/text-optimizer-api";
import type { TextOptimizerApplyRequest, TextOptimizerRequest } from "../types";

interface AnalyzeParams {
  accountId: string;
  request: TextOptimizerRequest;
}

interface ApplyParams {
  accountId: string;
  request: TextOptimizerApplyRequest;
}

export function useTextOptimizerAnalyze() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accountId, request }: AnalyzeParams) =>
      textOptimizerApi.analyze(accountId, request),
    onSuccess: (data) => {
      queryClient.setQueryData(["text-optimizer-result", data.campaign_id], data);
      toast.success("Analysis complete", {
        description: `Found suggestions for ${data.asset_groups.length} asset groups`,
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["asset-groups"] });
      toast.success("Changes applied", {
        description: `Created ${data.assets_created} assets, paused ${data.assets_paused}`,
      });
    },
    onError: (error) => {
      toast.error("Failed to apply changes", {
        description: error.message,
      });
    },
  });
}

export function useComplianceCheck() {
  return useMutation({
    mutationFn: textOptimizerApi.checkCompliance,
  });
}
