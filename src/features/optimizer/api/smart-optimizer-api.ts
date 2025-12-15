import { apiMethods } from "@/shared/api";
import type {
  ApplyChangesRequest,
  ApplyChangesResponse,
  BadAssetHistoryItem,
  SmartOptimizerRequest,
  SmartOptimizerResponse,
} from "../types";

const GOOGLE_ADS_PATH = "google-ads";

export const smartOptimizerApi = {
  /**
   * Analyze campaign for bad assets (ZOMBIE, MONEY_WASTER, etc.)
   */
  analyze: (request: SmartOptimizerRequest) =>
    apiMethods.post<SmartOptimizerResponse>(
      `${GOOGLE_ADS_PATH}/pmax/smart-optimizer/analyze`,
      request,
    ),

  /**
   * Get status of an ongoing smart analysis
   */
  getStatus: (runId: string) =>
    apiMethods.get<SmartOptimizerResponse>(
      `${GOOGLE_ADS_PATH}/pmax/smart-optimizer/status/${runId}`,
    ),

  /**
   * Apply smart optimizer changes (replace bad assets)
   */
  applyChanges: (request: ApplyChangesRequest) =>
    apiMethods.post<ApplyChangesResponse>(`${GOOGLE_ADS_PATH}/pmax/smart-optimizer/apply`, request),

  /**
   * Get bad asset history for an account
   */
  getBadAssetHistory: (accountId: string) =>
    apiMethods.get<{ items: BadAssetHistoryItem[] }>(
      `${GOOGLE_ADS_PATH}/accounts/${accountId}/bad-asset-history`,
    ),

  /**
   * Set target CPA for a campaign
   */
  setTargetCpa: (accountId: string, campaignId: string, targetCpa: number) =>
    apiMethods.put<{ message: string }>(
      `${GOOGLE_ADS_PATH}/accounts/${accountId}/campaigns/${campaignId}/target-cpa`,
      { target_cpa: targetCpa },
    ),

  /**
   * Get target CPA for a campaign
   */
  getTargetCpa: (accountId: string, campaignId: string) =>
    apiMethods.get<{ target_cpa: number | null }>(
      `${GOOGLE_ADS_PATH}/accounts/${accountId}/campaigns/${campaignId}/target-cpa`,
    ),
};
