/**
 * User from API response (snake_case)
 */
export interface User {
  id: string;
  email: string;
  full_name?: string;
  picture?: string;
  role?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Computed properties for UI convenience
export function getUserDisplayName(user: User): string {
  return user.full_name ?? user.email.split("@")[0];
}

export function getUserPhotoUrl(user: User): string | undefined {
  return user.picture;
}

/**
 * Token pair from fixads_token
 */
export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  expires_in?: number;
}

/**
 * Google Ads access info from OAuth response
 */
export interface GoogleAdsAccess {
  has_access: boolean;
  refresh_token?: string;
  message?: string;
}

/**
 * POST /auth/v1/google/callback response
 */
export interface GoogleOAuthResponse {
  user: User;
  fixads_token: TokenPair;
  google_ads?: GoogleAdsAccess;
}

/**
 * POST /auth/v1/refresh response
 */
export interface RefreshTokenResponse {
  access_token: string;
  refresh_token?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  googleAdsRefreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  setAuth: (user: User, tokens: TokenPair, googleAdsRefreshToken?: string) => void;
  setLoading: (isLoading: boolean) => void;
  refresh: () => Promise<boolean>;
  logout: () => void;
  reset: () => void;
}

export type AuthStore = AuthState & AuthActions;
