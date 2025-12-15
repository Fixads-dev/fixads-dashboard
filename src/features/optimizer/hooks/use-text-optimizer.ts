"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { POLLING_INTERVALS } from "@/shared/lib/constants";
import { textOptimizerApi } from "../api/text-optimizer-api";
import type { ApplyChangesRequest, TextOptimizerRequest } from "../types";

export function useTextOptimizerAnalyze() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: TextOptimizerRequest) => textOptimizerApi.analyze(request),
    onSuccess: (data) => {
      queryClient.setQueryData(["text-optimizer-status", data.runId], data);
      toast.info("Analysis started", {
        description: "We're analyzing your campaign assets...",
      });
    },
    onError: (error) => {
      toast.error("Analysis failed", {
        description: error.message,
      });
    },
  });
}

export function useTextOptimizerStatus(runId: string | null) {
  return useQuery({
    queryKey: ["text-optimizer-status", runId],
    queryFn: () => textOptimizerApi.getStatus(runId as string),
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

export function useApplyTextChanges() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ApplyChangesRequest) => textOptimizerApi.applyChanges(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["asset-groups"] });
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

export function useComplianceCheck() {
  return useMutation({
    mutationFn: textOptimizerApi.checkCompliance,
  });
}
