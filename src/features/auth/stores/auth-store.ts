"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthStore, TokenPair, User } from "../types";

const STORAGE_KEY = "fixads-auth";

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAuth: (user: User, tokens: TokenPair) =>
        set({
          user,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          isAuthenticated: true,
          isLoading: false,
        }),

      setLoading: (isLoading: boolean) => set({ isLoading }),

      refresh: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          get().logout();
          return false;
        }

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/v1/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (!response.ok) {
            get().logout();
            return false;
          }

          const tokens = (await response.json()) as TokenPair;
          set({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
          });
          return true;
        } catch {
          get().logout();
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
