import { apiMethods } from "@/shared/api/client";
import type { SearchTermsFilters, SearchTermsResponse } from "../types";

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
};
