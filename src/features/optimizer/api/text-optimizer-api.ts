import { api, apiMethods } from "@/shared/api";
import type {
  BadAssetHistoryResponse,
  TargetCpaRequest,
  TargetCpaResponse,
  TextOptimizerApplyRequest,
  TextOptimizerApplyResponse,
  TextOptimizerRequest,
  TextOptimizerResponse,
} from "../types";

const GOOGLE_ADS_PATH = "google-ads/v1";

// Extended timeout for operations that make multiple Google Ads API calls
const EXTENDED_TIMEOUT = 120000; // 2 minutes

export const textOptimizerApi = {
  /**
   * Analyze campaign for bad assets (ZOMBIE, MONEY_WASTER, etc.)
   * POST /google-ads/pmax/text-optimizer/analyze?account_id=UUID
   * Uses extended timeout due to Google Ads API + Gemini AI calls
   */
  analyze: (accountId: string, request: TextOptimizerRequest) =>
    api<TextOptimizerResponse>(
      `${GOOGLE_ADS_PATH}/pmax/text-optimizer/analyze?account_id=${accountId}`,
      { method: "post", json: request, timeout: EXTENDED_TIMEOUT },
    ),

  /**
   * Apply text optimizer changes (replace bad assets)
   * POST /google-ads/pmax/text-optimizer/apply?account_id=UUID
   * Uses extended timeout due to multiple Google Ads API calls
   */
  applyChanges: (accountId: string, request: TextOptimizerApplyRequest) =>
    api<TextOptimizerApplyResponse>(
      `${GOOGLE_ADS_PATH}/pmax/text-optimizer/apply?account_id=${accountId}`,
      { method: "post", json: request, timeout: EXTENDED_TIMEOUT },
    ),

  /**
   * Get bad asset history for an account
   * GET /google-ads/accounts/{accountId}/bad-asset-history?campaign_id=xxx&limit=10
   */
  getBadAssetHistory: (accountId: string, campaignId?: string, limit = 10) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (campaignId) params.set("campaign_id", campaignId);
    return apiMethods.get<BadAssetHistoryResponse>(
      `${GOOGLE_ADS_PATH}/accounts/${accountId}/bad-asset-history?${params}`,
    );
  },

  /**
   * Set target CPA for a campaign
   * PUT /google-ads/accounts/{accountId}/campaigns/{campaignId}/target-cpa
   */
  setTargetCpa: (accountId: string, campaignId: string, request: TargetCpaRequest) =>
    apiMethods.put<TargetCpaResponse>(
      `${GOOGLE_ADS_PATH}/accounts/${accountId}/campaigns/${campaignId}/target-cpa`,
      request,
    ),

  /**
   * Get target CPA for a campaign
   * GET /google-ads/accounts/{accountId}/campaigns/{campaignId}/target-cpa
   */
  getTargetCpa: (accountId: string, campaignId: string) =>
    apiMethods.get<TargetCpaResponse>(
      `${GOOGLE_ADS_PATH}/accounts/${accountId}/campaigns/${campaignId}/target-cpa`,
    ),
};
