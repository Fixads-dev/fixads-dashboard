import { apiMethods } from "@/shared/api/client";
import type { ChangeHistoryFilters, ChangeHistoryResponse } from "../types";

/**
 * Change History API client
 */
export const changeHistoryApi = {
  /**
   * Get change history
   */
  getChangeHistory: async (filters: ChangeHistoryFilters): Promise<ChangeHistoryResponse> => {
    const params = new URLSearchParams();
    params.set("account_id", filters.account_id);

    if (filters.start_date) {
      params.set("start_date", filters.start_date);
    }
    if (filters.end_date) {
      params.set("end_date", filters.end_date);
    }
    if (filters.resource_type) {
      params.set("resource_type", filters.resource_type);
    }
    if (filters.limit) {
      params.set("limit", String(filters.limit));
    }

    return apiMethods.get<ChangeHistoryResponse>(`google-ads/change-history?${params.toString()}`);
  },
};
