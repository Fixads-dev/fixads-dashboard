import { apiMethods } from "@/shared/api";
import type { GoogleOAuthResponse, TokenPair, User } from "../types";

const AUTH_PATH = "auth/v1";

export interface GoogleOAuthStartResponse {
  auth_url: string;
  state: string;
}

export interface GoogleOAuthCallbackParams {
  code: string;
  state: string;
}

export const authApi = {
  /**
   * Get the current authenticated user
   */
  getCurrentUser: () => apiMethods.get<User>(`${AUTH_PATH}/me`),

  /**
   * Start Google OAuth flow - returns the OAuth URL to redirect to
   */
  startGoogleOAuth: (redirectUri: string) =>
    apiMethods.post<GoogleOAuthStartResponse>(`${AUTH_PATH}/google/start`, {
      redirect_uri: redirectUri,
    }),

  /**
   * Complete Google OAuth flow - exchange code for tokens
   */
  completeGoogleOAuth: (params: GoogleOAuthCallbackParams) =>
    apiMethods.post<GoogleOAuthResponse>(`${AUTH_PATH}/google/callback`, params),

  /**
   * Refresh the access token using refresh token
   */
  refreshToken: (refreshToken: string) =>
    apiMethods.post<TokenPair>(`${AUTH_PATH}/refresh`, {
      refresh_token: refreshToken,
    }),

  /**
   * Logout the current user
   */
  logout: () => apiMethods.post<{ message: string }>(`${AUTH_PATH}/logout`),
};
