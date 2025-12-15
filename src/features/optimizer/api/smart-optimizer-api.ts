import { apiMethods } from "@/shared/api";
import type {
  BadAssetHistoryResponse,
  SmartOptimizerApplyRequest,
  SmartOptimizerApplyResponse,
  SmartOptimizerRequest,
  SmartOptimizerResponse,
  TargetCpaRequest,
  TargetCpaResponse,
} from "../types";

const GOOGLE_ADS_PATH = "google-ads";

export const smartOptimizerApi = {
  /**
   * Analyze campaign for bad assets (ZOMBIE, MONEY_WASTER, etc.)
   * POST /google-ads/pmax/smart-optimizer/analyze?account_id=UUID
   */
  analyze: (accountId: string, request: SmartOptimizerRequest) =>
    apiMethods.post<SmartOptimizerResponse>(
      `${GOOGLE_ADS_PATH}/pmax/smart-optimizer/analyze?account_id=${accountId}`,
      request,
    ),

  /**
   * Apply smart optimizer changes (replace bad assets)
   * POST /google-ads/pmax/smart-optimizer/apply?account_id=UUID
   */
  applyChanges: (accountId: string, request: SmartOptimizerApplyRequest) =>
    apiMethods.post<SmartOptimizerApplyResponse>(
      `${GOOGLE_ADS_PATH}/pmax/smart-optimizer/apply?account_id=${accountId}`,
      request,
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
