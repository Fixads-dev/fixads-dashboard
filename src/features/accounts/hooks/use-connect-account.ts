"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { QUERY_KEYS, ROUTES } from "@/shared/lib/constants";
import { accountsApi } from "../api/accounts-api";
import type { GoogleAdsOAuthCallbackParams } from "../types";

/**
 * Hook to start the Google Ads OAuth flow
 */
export function useStartConnectAccount() {
  return useMutation({
    mutationFn: async () => {
      const redirectUri = `${window.location.origin}/accounts/connect/callback`;
      const response = await accountsApi.startConnect(redirectUri);
      return response;
    },
    onSuccess: (data) => {
      window.location.href = data.auth_url;
    },
    onError: (error) => {
      toast.error("Failed to start account connection", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to complete the Google Ads OAuth callback
 */
export function useCompleteConnectAccount() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: GoogleAdsOAuthCallbackParams) => accountsApi.completeConnect(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACCOUNTS });
      toast.success("Account connected successfully", {
        description: `Connected ${data.descriptiveName}`,
      });
      router.replace(ROUTES.ACCOUNTS);
    },
    onError: (error) => {
      toast.error("Failed to connect account", {
        description: error.message,
      });
      router.replace(ROUTES.ACCOUNTS);
    },
  });
}

/**
 * Hook to disconnect an account
 */
export function useDisconnectAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountsApi.disconnectAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACCOUNTS });
      toast.success("Account disconnected");
    },
    onError: (error) => {
      toast.error("Failed to disconnect account", {
        description: error.message,
      });
    },
  });
}
