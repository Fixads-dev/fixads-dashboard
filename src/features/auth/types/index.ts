import type { WithId, WithTimestamps } from "@/shared/types";

export interface User extends WithId, WithTimestamps {
  email: string;
  displayName: string;
  photoUrl?: string;
  isActive: boolean;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface GoogleOAuthResponse {
  user: User;
  fixads_token: TokenPair;
  google_oauth: {
    access_token: string;
    refresh_token: string;
  };
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  setAuth: (user: User, tokens: TokenPair) => void;
  setLoading: (isLoading: boolean) => void;
  refresh: () => Promise<boolean>;
  logout: () => void;
  reset: () => void;
}

export type AuthStore = AuthState & AuthActions;
