import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/shared/lib/constants";
import { accountsApi } from "../api/accounts-api";
import type { SyncAccountRequest, SyncAccountResponse } from "../types";

/**
 * Hook to trigger manual sync of account data from Google Ads.
 * Invalidates relevant queries on success.
 */
export function useSyncAccount() {
  const queryClient = useQueryClient();

  return useMutation<SyncAccountResponse, Error, SyncAccountRequest>({
    mutationFn: (params) => accountsApi.syncAccount(params),
    onSuccess: (data) => {
      // Invalidate accounts and campaigns queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACCOUNTS });
      // Invalidate all campaign queries (campaigns list starts with "campaigns")
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === "campaigns" });

      toast.success("Sync completed", {
        description: `Synced ${data.campaigns_synced} campaigns, ${data.asset_groups_synced} asset groups in ${data.duration_seconds.toFixed(1)}s`,
      });
    },
    onError: (error) => {
      toast.error("Sync failed", {
        description: error.message || "Failed to sync account data. Please try again.",
      });
    },
  });
}

/**
 * Hook to enqueue background sync task (non-blocking).
 * Useful for large accounts that may take longer to sync.
 */
export function useEnqueueSync() {
  return useMutation({
    mutationFn: accountsApi.enqueueSyncTask,
    onSuccess: (data) => {
      if (data.status === "enqueued") {
        toast.success("Sync started", {
          description: "Background sync has been queued. Data will update automatically.",
        });
      } else {
        toast.error("Failed to start sync", {
          description: "Could not enqueue sync task. Please try again.",
        });
      }
    },
    onError: (error: Error) => {
      toast.error("Sync failed", {
        description: error.message || "Failed to start background sync.",
      });
    },
  });
}
