/**
 * Account status enum - matches backend AccountStatus serialized values
 * Backend enum values are lowercase strings
 * @see fixads-api/services/google-ads-service/src/google_ads_service/domain/models.py
 */
export type AccountStatus = "active" | "inactive" | "error" | "pending";

/**
 * Google Ads Account - matches API response (snake_case)
 */
export interface GoogleAdsAccount {
  id: string;
  customer_id: string;
  descriptive_name: string | null;
  currency_code?: string;
  time_zone?: string;
  status: AccountStatus;
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
 * POST /google-ads/oauth/callback response - returns tokens, not account
 */
export interface OAuth2TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
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

// ==================== Sync Types ====================

/**
 * Staleness information for cached data
 */
export interface StalenessInfo {
  last_synced_at: string | null;
  is_stale: boolean;
}

/**
 * Account with staleness info
 */
export interface GoogleAdsAccountWithStaleness extends GoogleAdsAccount, StalenessInfo {}

/**
 * POST /google-ads/v1/accounts/sync request
 */
export interface SyncAccountRequest {
  account_id: string;
  force_full_sync?: boolean;
}

/**
 * POST /google-ads/v1/accounts/sync response
 */
export interface SyncAccountResponse {
  account_id: string;
  campaigns_synced: number;
  asset_groups_synced: number;
  assets_synced: number;
  duration_seconds: number;
}

/**
 * POST /google-ads/v1/tasks/enqueue/sync request
 */
export interface EnqueueSyncRequest {
  customer_id: string;
  user_id: string;
  sync_type: "full" | "incremental" | "campaigns" | "assets";
}

/**
 * POST /google-ads/v1/tasks/enqueue/sync response
 */
export interface EnqueueSyncResponse {
  status: "enqueued" | "failed";
  task_name: string | null;
}
