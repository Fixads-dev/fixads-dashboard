import { apiMethods } from "@/shared/api/client";
import type { ConversionActionsFilters, ConversionActionsResponse } from "../types";

const GOOGLE_ADS_PATH = "google-ads/v1";

/**
 * Conversions API client
 */
export const conversionsApi = {
  /**
   * Get conversion actions
   */
  getConversionActions: async (
    filters: ConversionActionsFilters,
  ): Promise<ConversionActionsResponse> => {
    const params = new URLSearchParams();
    params.set("account_id", filters.account_id);

    return apiMethods.get<ConversionActionsResponse>(
      `${GOOGLE_ADS_PATH}/conversions?${params.toString()}`,
    );
  },
};
