"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/lib/constants";
import { accountsApi } from "../api/accounts-api";

export function useAccounts() {
  return useQuery({
    queryKey: QUERY_KEYS.ACCOUNTS,
    queryFn: accountsApi.getAccounts,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useAccount(accountId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ACCOUNT(accountId),
    queryFn: () => accountsApi.getAccount(accountId),
    enabled: !!accountId,
    staleTime: 2 * 60 * 1000,
  });
}
