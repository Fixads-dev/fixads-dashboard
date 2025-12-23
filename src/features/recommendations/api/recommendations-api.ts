import { apiMethods } from "@/shared/api";
import {
  ApplyRecommendationResponseSchema,
  ApplyRecommendationsBatchResponseSchema,
  DismissRecommendationResponseSchema,
  DismissRecommendationsBatchResponseSchema,
  parseRecommendationResponse,
  RecommendationSchema,
  RecommendationsResponseSchema,
} from "../schemas/recommendations-schemas";
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

const GOOGLE_ADS_PATH = "google-ads/v1";

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

    const rawResponse = await apiMethods.get<unknown>(
      `${GOOGLE_ADS_PATH}/recommendations?${params.toString()}`,
    );
    return parseRecommendationResponse(
      RecommendationsResponseSchema,
      rawResponse,
      "getRecommendations",
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
      const rawResponse = await apiMethods.get<unknown>(
        `${GOOGLE_ADS_PATH}/recommendations/${encodeURIComponent(recommendationId)}?account_id=${accountId}`,
      );
      return parseRecommendationResponse(RecommendationSchema, rawResponse, "getRecommendation");
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
    const rawResponse = await apiMethods.post<unknown>(
      `${GOOGLE_ADS_PATH}/recommendations/apply?account_id=${accountId}`,
      request,
    );
    return parseRecommendationResponse(
      ApplyRecommendationResponseSchema,
      rawResponse,
      "applyRecommendation",
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
    const rawResponse = await apiMethods.post<unknown>(
      `${GOOGLE_ADS_PATH}/recommendations/apply-batch?account_id=${accountId}`,
      request,
    );
    return parseRecommendationResponse(
      ApplyRecommendationsBatchResponseSchema,
      rawResponse,
      "applyRecommendationsBatch",
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
    const rawResponse = await apiMethods.post<unknown>(
      `${GOOGLE_ADS_PATH}/recommendations/dismiss?account_id=${accountId}`,
      request,
    );
    return parseRecommendationResponse(
      DismissRecommendationResponseSchema,
      rawResponse,
      "dismissRecommendation",
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
    const rawResponse = await apiMethods.post<unknown>(
      `${GOOGLE_ADS_PATH}/recommendations/dismiss-batch?account_id=${accountId}`,
      request,
    );
    return parseRecommendationResponse(
      DismissRecommendationsBatchResponseSchema,
      rawResponse,
      "dismissRecommendationsBatch",
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
