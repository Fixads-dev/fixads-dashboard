import { apiMethods } from "@/shared/api/client";
import type { ConversionActionsFilters, ConversionActionsResponse } from "../types";

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

    return apiMethods.get<ConversionActionsResponse>(`google-ads/conversions?${params.toString()}`);
  },
};
