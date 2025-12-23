import { api, apiMethods } from "@/shared/api";
import {
  BadAssetHistoryResponseSchema,
  parseOptimizerResponse,
  TargetCpaResponseSchema,
  TextOptimizerApplyResponseSchema,
  TextOptimizerResponseSchema,
} from "../schemas/optimizer-schemas";
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
  analyze: async (
    accountId: string,
    request: TextOptimizerRequest,
  ): Promise<TextOptimizerResponse> => {
    const rawResponse = await api<unknown>(
      `${GOOGLE_ADS_PATH}/pmax/text-optimizer/analyze?account_id=${accountId}`,
      { method: "post", json: request, timeout: EXTENDED_TIMEOUT },
    );
    return parseOptimizerResponse(TextOptimizerResponseSchema, rawResponse, "analyze");
  },

  /**
   * Apply text optimizer changes (replace bad assets)
   * POST /google-ads/pmax/text-optimizer/apply?account_id=UUID
   * Uses extended timeout due to multiple Google Ads API calls
   */
  applyChanges: async (
    accountId: string,
    request: TextOptimizerApplyRequest,
  ): Promise<TextOptimizerApplyResponse> => {
    const rawResponse = await api<unknown>(
      `${GOOGLE_ADS_PATH}/pmax/text-optimizer/apply?account_id=${accountId}`,
      { method: "post", json: request, timeout: EXTENDED_TIMEOUT },
    );
    return parseOptimizerResponse(TextOptimizerApplyResponseSchema, rawResponse, "applyChanges");
  },

  /**
   * Get bad asset history for an account
   * GET /google-ads/accounts/{accountId}/bad-asset-history?campaign_id=xxx&limit=10
   */
  getBadAssetHistory: async (
    accountId: string,
    campaignId?: string,
    limit = 10,
  ): Promise<BadAssetHistoryResponse> => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (campaignId) params.set("campaign_id", campaignId);
    const rawResponse = await apiMethods.get<unknown>(
      `${GOOGLE_ADS_PATH}/accounts/${accountId}/bad-asset-history?${params}`,
    );
    return parseOptimizerResponse(BadAssetHistoryResponseSchema, rawResponse, "getBadAssetHistory");
  },

  /**
   * Set target CPA for a campaign
   * PUT /google-ads/accounts/{accountId}/campaigns/{campaignId}/target-cpa
   */
  setTargetCpa: async (
    accountId: string,
    campaignId: string,
    request: TargetCpaRequest,
  ): Promise<TargetCpaResponse> => {
    const rawResponse = await apiMethods.put<unknown>(
      `${GOOGLE_ADS_PATH}/accounts/${accountId}/campaigns/${campaignId}/target-cpa`,
      request,
    );
    return parseOptimizerResponse(TargetCpaResponseSchema, rawResponse, "setTargetCpa");
  },

  /**
   * Get target CPA for a campaign
   * GET /google-ads/accounts/{accountId}/campaigns/{campaignId}/target-cpa
   */
  getTargetCpa: async (accountId: string, campaignId: string): Promise<TargetCpaResponse> => {
    const rawResponse = await apiMethods.get<unknown>(
      `${GOOGLE_ADS_PATH}/accounts/${accountId}/campaigns/${campaignId}/target-cpa`,
    );
    return parseOptimizerResponse(TargetCpaResponseSchema, rawResponse, "getTargetCpa");
  },
};
