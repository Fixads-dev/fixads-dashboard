import { api, apiMethods } from "@/shared/api";
import type {
  BeliefHistoryResponse,
  BeliefUpdateRequest,
  BeliefUpdateResponse,
  CampaignProbabilitiesResponse,
  IndustryPriorListResponse,
  MABState,
  MABStateCreateRequest,
  MABStateListResponse,
  PendingOptimizationResponse,
  SelectionRequest,
  SelectionResponse,
} from "../types";

/**
 * Experimentation Service API base path
 * Note: In production, this may route through the main API gateway
 * or directly to the experimentation service
 */
const EXPERIMENTATION_PATH = "experimentation/api/v1";

export const experimentationApi = {
  // ==================== MAB State Endpoints ====================

  /**
   * Create a new MAB state for an asset
   * POST /experimentation/api/v1/states
   */
  createState: (request: MABStateCreateRequest) =>
    api<MABState>(`${EXPERIMENTATION_PATH}/states`, {
      method: "post",
      json: request,
    }),

  /**
   * Get MAB state for a specific asset
   * GET /experimentation/api/v1/states/{assetId}?platform=GOOGLE_ADS
   */
  getState: (assetId: string, platform = "GOOGLE_ADS") =>
    apiMethods.get<MABState>(`${EXPERIMENTATION_PATH}/states/${assetId}?platform=${platform}`),

  /**
   * List all MAB states for an account
   * GET /experimentation/api/v1/accounts/{accountId}/states?platform=&campaign_id=&limit=
   */
  listStates: (accountId: string, campaignId?: string, platform?: string, limit = 100) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (campaignId) params.set("campaign_id", campaignId);
    if (platform) params.set("platform", platform);
    return apiMethods.get<MABStateListResponse>(
      `${EXPERIMENTATION_PATH}/accounts/${accountId}/states?${params}`,
    );
  },

  // ==================== Belief Update Endpoints ====================

  /**
   * Update belief state with conversion data
   * POST /experimentation/api/v1/beliefs/update
   */
  updateBelief: (request: BeliefUpdateRequest) =>
    api<BeliefUpdateResponse>(`${EXPERIMENTATION_PATH}/beliefs/update`, {
      method: "post",
      json: request,
    }),

  /**
   * Get belief event history for an asset
   * GET /experimentation/api/v1/beliefs/{assetId}/history?limit=100
   */
  getBeliefHistory: (assetId: string, limit = 100, platform?: string) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (platform) params.set("platform", platform);
    return apiMethods.get<BeliefHistoryResponse>(
      `${EXPERIMENTATION_PATH}/beliefs/${assetId}/history?${params}`,
    );
  },

  // ==================== Selection Endpoints ====================

  /**
   * Select best assets using Thompson Sampling
   * POST /experimentation/api/v1/select
   */
  selectAssets: (request: SelectionRequest) =>
    api<SelectionResponse>(`${EXPERIMENTATION_PATH}/select`, {
      method: "post",
      json: request,
    }),

  /**
   * Get win probabilities for all assets in a campaign
   * GET /experimentation/api/v1/campaigns/{campaignId}/probabilities?platform=GOOGLE_ADS
   */
  getCampaignProbabilities: (campaignId: string, platform = "GOOGLE_ADS") =>
    apiMethods.get<CampaignProbabilitiesResponse>(
      `${EXPERIMENTATION_PATH}/campaigns/${campaignId}/probabilities?platform=${platform}`,
    ),

  /**
   * Get pending optimization requests for a campaign
   * GET /experimentation/api/v1/campaigns/{campaignId}/optimization-requests
   */
  getPendingOptimizations: (campaignId: string) =>
    apiMethods.get<PendingOptimizationResponse>(
      `${EXPERIMENTATION_PATH}/campaigns/${campaignId}/optimization-requests`,
    ),

  // ==================== Industry Priors Endpoints ====================

  /**
   * List all available industry priors
   * GET /experimentation/api/v1/priors?platform=
   */
  listIndustryPriors: (platform?: string) => {
    const params = platform ? `?platform=${platform}` : "";
    return apiMethods.get<IndustryPriorListResponse>(`${EXPERIMENTATION_PATH}/priors${params}`);
  },
};
