import { apiMethods } from "@/shared/api";
import type {
  AccountsResponse,
  ConnectAccountResponse,
  GoogleAdsAccount,
  GoogleAdsOAuthCallbackParams,
} from "../types";

const GOOGLE_ADS_PATH = "google-ads";

export const accountsApi = {
  /**
   * Get all connected Google Ads accounts
   */
  getAccounts: () => apiMethods.get<AccountsResponse>(`${GOOGLE_ADS_PATH}/accounts`),

  /**
   * Get a single account by ID
   */
  getAccount: (accountId: string) =>
    apiMethods.get<GoogleAdsAccount>(`${GOOGLE_ADS_PATH}/accounts/${accountId}`),

  /**
   * Start Google Ads OAuth flow to connect a new account
   */
  startConnect: (redirectUri: string) =>
    apiMethods.post<ConnectAccountResponse>(`${GOOGLE_ADS_PATH}/oauth/start`, {
      redirect_uri: redirectUri,
    }),

  /**
   * Complete Google Ads OAuth callback
   */
  completeConnect: (params: GoogleAdsOAuthCallbackParams) =>
    apiMethods.post<GoogleAdsAccount>(`${GOOGLE_ADS_PATH}/oauth/callback`, params),

  /**
   * Disconnect an account
   */
  disconnectAccount: (accountId: string) =>
    apiMethods.delete<{ message: string }>(`${GOOGLE_ADS_PATH}/accounts/${accountId}`),

  /**
   * Refresh account data from Google Ads API
   */
  refreshAccount: (accountId: string) =>
    apiMethods.post<GoogleAdsAccount>(`${GOOGLE_ADS_PATH}/accounts/${accountId}/refresh`),
};
