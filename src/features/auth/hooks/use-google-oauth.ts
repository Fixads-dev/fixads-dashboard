"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { QUERY_KEYS, ROUTES } from "@/shared/lib/constants";
import { authApi, type GoogleOAuthCallbackParams } from "../api/auth-api";
import { useAuthStore } from "../stores/auth-store";

/**
 * Hook to start the Google OAuth flow
 */
export function useStartGoogleOAuth() {
  return useMutation({
    mutationFn: async () => {
      const redirectUri = `${window.location.origin}/callback`;
      const response = await authApi.startGoogleOAuth(redirectUri);
      return response;
    },
    onSuccess: (data) => {
      // Redirect to Google OAuth
      window.location.href = data.authorization_url;
    },
    onError: (error) => {
      toast.error("Failed to start authentication", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to complete the Google OAuth callback
 */
export function useCompleteGoogleOAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (params: GoogleOAuthCallbackParams) => authApi.completeGoogleOAuth(params),
    onSuccess: (data) => {
      // Extract Google Ads refresh token if available
      const googleAdsRefreshToken = data.google_ads?.has_access
        ? data.google_ads.refresh_token
        : undefined;

      setAuth(data.user, data.fixads_token, googleAdsRefreshToken);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER });

      // Show appropriate message based on Google Ads access
      if (data.google_ads?.has_access && googleAdsRefreshToken) {
        toast.success("Welcome back!", {
          description: `Signed in as ${data.user.email} with Google Ads access`,
        });
      } else {
        toast.success("Welcome back!", {
          description: `Signed in as ${data.user.email}`,
        });
      }

      router.replace(ROUTES.HOME);
    },
    onError: (error) => {
      toast.error("Authentication failed", {
        description: error.message,
      });
      router.replace(ROUTES.LOGIN);
    },
  });
}
