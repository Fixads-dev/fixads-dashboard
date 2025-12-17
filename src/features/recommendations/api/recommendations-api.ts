import { apiMethods } from "@/shared/api";
import type {
  ApplyRecommendationRequest,
  ApplyRecommendationResponse,
  ApplyRecommendationsBatchRequest,
  ApplyRecommendationsBatchResponse,
  DismissRecommendationRequest,
  DismissRecommendationResponse,
  DismissRecommendationsBatchRequest,
  DismissRecommendationsBatchResponse,
  Recommendation,
  RecommendationFilters,
  RecommendationsResponse,
  RecommendationType,
} from "../types";

const GOOGLE_ADS_PATH = "google-ads";

export const recommendationsApi = {
  /**
   * Get recommendations for an account
   * GET /google-ads/recommendations?account_id=UUID&types=TYPE1,TYPE2&campaign_id=123&include_dismissed=false&limit=100
   */
  getRecommendations: async (filters: RecommendationFilters): Promise<RecommendationsResponse> => {
    const params = new URLSearchParams();
    params.set("account_id", filters.account_id);

    if (filters.types && filters.types.length > 0) {
      params.set("types", filters.types.join(","));
    }
    if (filters.campaign_id) {
      params.set("campaign_id", filters.campaign_id);
    }
    if (filters.include_dismissed !== undefined) {
      params.set("include_dismissed", String(filters.include_dismissed));
    }
    if (filters.limit !== undefined) {
      params.set("limit", String(filters.limit));
    }

    return apiMethods.get<RecommendationsResponse>(
      `${GOOGLE_ADS_PATH}/recommendations?${params.toString()}`,
    );
  },

  /**
   * Get a single recommendation by ID
   * GET /google-ads/recommendations/{recommendation_id}?account_id=UUID
   */
  getRecommendation: async (
    accountId: string,
    recommendationId: string,
  ): Promise<Recommendation | null> => {
    try {
      return await apiMethods.get<Recommendation>(
        `${GOOGLE_ADS_PATH}/recommendations/${encodeURIComponent(recommendationId)}?account_id=${accountId}`,
      );
    } catch {
      return null;
    }
  },

  /**
   * Apply a single recommendation
   * POST /google-ads/recommendations/apply?account_id=UUID
   */
  applyRecommendation: async (
    accountId: string,
    request: ApplyRecommendationRequest,
  ): Promise<ApplyRecommendationResponse> => {
    return apiMethods.post<ApplyRecommendationResponse>(
      `${GOOGLE_ADS_PATH}/recommendations/apply?account_id=${accountId}`,
      request,
    );
  },

  /**
   * Apply multiple recommendations
   * POST /google-ads/recommendations/apply-batch?account_id=UUID
   */
  applyRecommendationsBatch: async (
    accountId: string,
    request: ApplyRecommendationsBatchRequest,
  ): Promise<ApplyRecommendationsBatchResponse> => {
    return apiMethods.post<ApplyRecommendationsBatchResponse>(
      `${GOOGLE_ADS_PATH}/recommendations/apply-batch?account_id=${accountId}`,
      request,
    );
  },

  /**
   * Dismiss a single recommendation
   * POST /google-ads/recommendations/dismiss?account_id=UUID
   */
  dismissRecommendation: async (
    accountId: string,
    request: DismissRecommendationRequest,
  ): Promise<DismissRecommendationResponse> => {
    return apiMethods.post<DismissRecommendationResponse>(
      `${GOOGLE_ADS_PATH}/recommendations/dismiss?account_id=${accountId}`,
      request,
    );
  },

  /**
   * Dismiss multiple recommendations
   * POST /google-ads/recommendations/dismiss-batch?account_id=UUID
   */
  dismissRecommendationsBatch: async (
    accountId: string,
    request: DismissRecommendationsBatchRequest,
  ): Promise<DismissRecommendationsBatchResponse> => {
    return apiMethods.post<DismissRecommendationsBatchResponse>(
      `${GOOGLE_ADS_PATH}/recommendations/dismiss-batch?account_id=${accountId}`,
      request,
    );
  },

  /**
   * Helper: Get recommendations for a specific campaign
   */
  getCampaignRecommendations: async (
    accountId: string,
    campaignId: string,
    types?: RecommendationType[],
  ): Promise<RecommendationsResponse> => {
    return recommendationsApi.getRecommendations({
      account_id: accountId,
      campaign_id: campaignId,
      types,
      include_dismissed: false,
    });
  },
};
