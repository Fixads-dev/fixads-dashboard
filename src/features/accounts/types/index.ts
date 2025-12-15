/**
 * Google Ads Account - matches API response (snake_case)
 */
export interface GoogleAdsAccount {
  id: string;
  customer_id: string;
  descriptive_name: string | null;
  currency_code?: string;
  time_zone?: string;
  status: "active" | "inactive" | "pending";
  is_manager?: boolean;
  can_manage_clients?: boolean;
  login_customer_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AccountMetrics {
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  ctr: number;
  cpc: number;
  conversion_rate: number;
}

export interface AccountWithMetrics extends GoogleAdsAccount {
  metrics?: AccountMetrics;
}

/**
 * GET /google-ads/accounts returns array directly
 */
export type AccountsResponse = GoogleAdsAccount[];

/**
 * POST /google-ads/oauth/start response
 */
export interface ConnectAccountResponse {
  authorization_url: string;
  state: string;
}

/**
 * POST /google-ads/oauth/callback params
 */
export interface GoogleAdsOAuthCallbackParams {
  code: string;
  state: string;
  redirect_uri: string;
}

/**
 * POST /google-ads/accounts request - connect with refresh token
 */
export interface ConnectAccountRequest {
  customer_id: string;
  refresh_token: string;
  login_customer_id?: string;
}

/**
 * Accessible customer from /google-ads/customers
 */
export interface AccessibleCustomer {
  customer_id: string;
  descriptive_name: string;
  is_manager: boolean;
  can_manage_clients: boolean;
}
