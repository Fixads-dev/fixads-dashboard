"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ROUTES } from "@/shared/lib/constants";
import { authApi } from "../api/auth-api";
import { useAuthStore } from "../stores/auth-store";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } catch {
        // Ignore errors, we'll logout anyway
      }
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success("Signed out successfully");
      router.replace(ROUTES.LOGIN);
    },
    onError: () => {
      // Still logout even if API call fails
      logout();
      queryClient.clear();
      router.replace(ROUTES.LOGIN);
    },
  });
}
