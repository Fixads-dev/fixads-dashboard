import { apiMethods } from "@/shared/api/client";
import type { AccountOverviewFilters, AccountOverviewResponse } from "../types";

/**
 * Account Overview API client
 */
export const accountOverviewApi = {
  /**
   * Get account overview with aggregated metrics
   */
  getAccountOverview: async (filters: AccountOverviewFilters): Promise<AccountOverviewResponse> => {
    const params = new URLSearchParams();
    params.set("account_id", filters.account_id);

    if (filters.date_range) {
      params.set("date_range", filters.date_range);
    }

    return apiMethods.get<AccountOverviewResponse>(`google-ads/overview?${params.toString()}`);
  },
};
