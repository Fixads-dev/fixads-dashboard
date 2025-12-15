"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/lib/constants";
import { authApi } from "../api/auth-api";
import { useAuthStore } from "../stores/auth-store";

export function useCurrentUser() {
  const { isAuthenticated, accessToken, logout } = useAuthStore();

  return useQuery({
    queryKey: QUERY_KEYS.USER,
    queryFn: async () => {
      const user = await authApi.getCurrentUser();
      return user;
    },
    enabled: isAuthenticated && !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 errors
      if (error instanceof Error && error.message.includes("401")) {
        logout();
        return false;
      }
      return failureCount < 2;
    },
  });
}
