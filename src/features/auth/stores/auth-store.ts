"use client";

import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { authClient } from "@/shared/api/client";
import type { AuthStore, TokenPair, User } from "../types";

// Zod schema for runtime validation of refresh response
const refreshTokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
});

const STORAGE_KEY = "fixads-auth";

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  googleAdsRefreshToken: null,
  isAuthenticated: false,
  isLoading: true,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAuth: (user: User, tokens: TokenPair, googleAdsRefreshToken?: string) =>
        set({
          user,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          googleAdsRefreshToken: googleAdsRefreshToken ?? null,
          isAuthenticated: true,
          isLoading: false,
        }),

      setLoading: (isLoading: boolean) => set({ isLoading }),

      refresh: async () => {
        // Capture state upfront to avoid inconsistent reads
        const { refreshToken, logout } = get();
        const currentRefreshToken = refreshToken;

        if (!currentRefreshToken) {
          logout();
          return false;
        }

        try {
          // Use authClient (ky) for consistent error handling
          const response = await authClient
            .post("auth/v1/refresh", {
              json: { refresh_token: currentRefreshToken },
            })
            .json();

          // Validate response with Zod
          const tokens = refreshTokenResponseSchema.parse(response);

          set({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token ?? currentRefreshToken,
          });
          return true;
        } catch {
          logout();
          return false;
        }
      },

      logout: () => {
        set({ ...initialState, isLoading: false });
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEY);
        }
      },

      reset: () => set({ ...initialState, isLoading: false }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        googleAdsRefreshToken: state.googleAdsRefreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setLoading(false);
        }
      },
    },
  ),
);

/**
 * Non-hook accessor for use in API interceptors
 */
export const getAuthStore = () => useAuthStore.getState();
