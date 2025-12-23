"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/shared/lib/constants";
import { accountsApi } from "../api/accounts-api";
import type {
  ConnectAccountRequest,
  GoogleAdsAccount,
  GoogleAdsOAuthCallbackParams,
} from "../types";

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
      window.location.href = data.authorization_url;
    },
    onError: (error) => {
      toast.error("Failed to start account connection", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to exchange OAuth code for tokens
 */
export function useExchangeCodeForTokens() {
  return useMutation({
    mutationFn: (params: GoogleAdsOAuthCallbackParams) => accountsApi.exchangeCodeForTokens(params),
    onError: (error) => {
      toast.error("Failed to exchange authorization code", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to get accessible customers with a refresh token
 */
export function useGetAccessibleCustomers() {
  return useMutation({
    mutationFn: (refreshToken: string) => accountsApi.getAccessibleCustomers(refreshToken),
    onError: (error) => {
      toast.error("Failed to list accessible accounts", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to connect account directly with refresh token
 */
export function useConnectAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: ConnectAccountRequest) => accountsApi.connectAccount(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACCOUNTS });
      toast.success("Account connected successfully", {
        description: `Connected ${data.descriptive_name ?? data.customer_id}`,
      });
    },
    onError: (error) => {
      toast.error("Failed to connect account", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to disconnect an account with optimistic update
 */
export function useDisconnectAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountsApi.disconnectAccount,
    onMutate: async (accountId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.ACCOUNTS });

      // Snapshot previous value
      const previousAccounts = queryClient.getQueryData<GoogleAdsAccount[]>(QUERY_KEYS.ACCOUNTS);

      // Optimistically remove the account
      queryClient.setQueryData<GoogleAdsAccount[]>(QUERY_KEYS.ACCOUNTS, (old) => {
        if (!old) return old;
        return old.filter((account) => account.id !== accountId);
      });

      return { previousAccounts };
    },
    onSuccess: () => {
      toast.success("Account disconnected");
    },
    onError: (error, _accountId, context) => {
      // Rollback on error
      if (context?.previousAccounts) {
        queryClient.setQueryData(QUERY_KEYS.ACCOUNTS, context.previousAccounts);
      }
      toast.error("Failed to disconnect account", {
        description: error.message,
      });
    },
    onSettled: () => {
      // Refetch to ensure sync with server
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACCOUNTS });
    },
  });
}
