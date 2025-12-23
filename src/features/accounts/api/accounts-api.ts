import { apiMethods } from "@/shared/api";
import type {
  AccessibleCustomer,
  AccountsResponse,
  ConnectAccountRequest,
  ConnectAccountResponse,
  GoogleAdsAccount,
  GoogleAdsOAuthCallbackParams,
  OAuth2TokenResponse,
} from "../types";

const GOOGLE_ADS_PATH = "google-ads/v1";

export const accountsApi = {
  /**
   * Get all connected Google Ads accounts
   * GET /google-ads/accounts
   */
  getAccounts: () => apiMethods.get<AccountsResponse>(`${GOOGLE_ADS_PATH}/accounts`),

  /**
   * Get a single account by ID
   * GET /google-ads/accounts/{accountId}
   */
  getAccount: (accountId: string) =>
    apiMethods.get<GoogleAdsAccount>(`${GOOGLE_ADS_PATH}/accounts/${accountId}`),

  /**
   * Get accessible customers (for account selection during connect)
   * GET /google-ads/customers?refresh_token=xxx
   */
  getAccessibleCustomers: (refreshToken: string) =>
    apiMethods.get<{ customers: AccessibleCustomer[] }>(
      `${GOOGLE_ADS_PATH}/customers?refresh_token=${encodeURIComponent(refreshToken)}`,
    ),

  /**
   * Start Google Ads OAuth flow to connect a new account
   * POST /google-ads/oauth/start
   */
  startConnect: (redirectUri: string) =>
    apiMethods.post<ConnectAccountResponse>(`${GOOGLE_ADS_PATH}/oauth/start`, {
      redirect_uri: redirectUri,
    }),

  /**
   * Complete Google Ads OAuth callback - exchanges code for tokens
   * POST /google-ads/oauth/callback
   */
  exchangeCodeForTokens: (params: GoogleAdsOAuthCallbackParams) =>
    apiMethods.post<OAuth2TokenResponse>(`${GOOGLE_ADS_PATH}/oauth/callback`, params),

  /**
   * Connect account directly with refresh token (after OAuth)
   * POST /google-ads/accounts
   */
  connectAccount: (params: ConnectAccountRequest) =>
    apiMethods.post<GoogleAdsAccount>(`${GOOGLE_ADS_PATH}/accounts`, params),

  /**
   * Disconnect an account
   * DELETE /google-ads/accounts/{accountId}
   */
  disconnectAccount: (accountId: string) =>
    apiMethods.delete<{ message: string }>(`${GOOGLE_ADS_PATH}/accounts/${accountId}`),

  /**
   * Refresh account data from Google Ads API
   * POST /google-ads/accounts/{accountId}/refresh
   */
  refreshAccount: (accountId: string) =>
    apiMethods.post<GoogleAdsAccount>(`${GOOGLE_ADS_PATH}/accounts/${accountId}/refresh`),
};
