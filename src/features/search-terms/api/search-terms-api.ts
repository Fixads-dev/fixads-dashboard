import { apiMethods } from "@/shared/api/client";
import type {
  AddKeywordRequest,
  AddKeywordResponse,
  BulkAddKeywordsRequest,
  BulkAddKeywordsResponse,
  SearchTermRecommendationsResponse,
  SearchTermsFilters,
  SearchTermsResponse,
} from "../types";

const GOOGLE_ADS_PATH = "google-ads/v1";

/**
 * Search Terms API client
 */
export const searchTermsApi = {
  /**
   * Get search terms with metrics
   */
  getSearchTerms: async (filters: SearchTermsFilters): Promise<SearchTermsResponse> => {
    const params = new URLSearchParams();
    params.set("account_id", filters.account_id);

    if (filters.campaign_id) {
      params.set("campaign_id", filters.campaign_id);
    }
    if (filters.ad_group_id) {
      params.set("ad_group_id", filters.ad_group_id);
    }
    if (filters.date_range) {
      params.set("date_range", filters.date_range);
    }
    if (filters.limit) {
      params.set("limit", String(filters.limit));
    }

    return apiMethods.get<SearchTermsResponse>(
      `${GOOGLE_ADS_PATH}/search-terms?${params.toString()}`,
    );
  },

  /**
   * Get recommended search terms to add as keywords
   */
  getRecommendations: async (
    accountId: string,
    campaignId?: string,
    dateRange: string = "LAST_30_DAYS",
    limit: number = 100,
  ): Promise<SearchTermRecommendationsResponse> => {
    const params = new URLSearchParams();
    params.set("account_id", accountId);
    params.set("date_range", dateRange);
    params.set("limit", String(limit));

    if (campaignId) {
      params.set("campaign_id", campaignId);
    }

    return apiMethods.get<SearchTermRecommendationsResponse>(
      `${GOOGLE_ADS_PATH}/search-terms/recommendations?${params.toString()}`,
    );
  },

  /**
   * Add a single keyword from search term
   */
  addKeyword: async (
    accountId: string,
    request: AddKeywordRequest,
  ): Promise<AddKeywordResponse> => {
    return apiMethods.post<AddKeywordResponse>(
      `${GOOGLE_ADS_PATH}/keywords/add?account_id=${accountId}`,
      request,
    );
  },

  /**
   * Bulk add keywords from search terms
   */
  bulkAddKeywords: async (
    accountId: string,
    request: BulkAddKeywordsRequest,
  ): Promise<BulkAddKeywordsResponse> => {
    return apiMethods.post<BulkAddKeywordsResponse>(
      `${GOOGLE_ADS_PATH}/keywords/bulk-add?account_id=${accountId}`,
      request,
    );
  },
};
