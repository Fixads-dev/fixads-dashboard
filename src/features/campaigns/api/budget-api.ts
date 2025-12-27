import { apiMethods } from "@/shared/api";
import type {
  AccountBudgetOverview,
  BudgetHistory,
  BudgetSpend,
  CampaignBudget,
  UpdateBudgetRequest,
  UpdateBudgetResponse,
} from "../types";

const GOOGLE_ADS_PATH = "google-ads/v1";

/**
 * Budget Management API client
 */
export const budgetApi = {
  /**
   * Get budget details for a specific campaign
   */
  getCampaignBudget: async (
    accountId: string,
    campaignId: string,
  ): Promise<CampaignBudget> => {
    return apiMethods.get<CampaignBudget>(
      `${GOOGLE_ADS_PATH}/accounts/${accountId}/campaigns/${campaignId}/budget`,
    );
  },

  /**
   * Update a campaign's budget
   */
  updateBudget: async (
    accountId: string,
    campaignId: string,
    request: UpdateBudgetRequest,
  ): Promise<UpdateBudgetResponse> => {
    return apiMethods.put<UpdateBudgetResponse>(
      `${GOOGLE_ADS_PATH}/accounts/${accountId}/campaigns/${campaignId}/budget`,
      request,
    );
  },

  /**
   * Get budget spending details for a campaign
   */
  getBudgetSpend: async (
    accountId: string,
    campaignId: string,
    dateRange: string = "LAST_30_DAYS",
  ): Promise<BudgetSpend> => {
    const params = new URLSearchParams({ date_range: dateRange });
    return apiMethods.get<BudgetSpend>(
      `${GOOGLE_ADS_PATH}/accounts/${accountId}/campaigns/${campaignId}/budget/spend?${params.toString()}`,
    );
  },

  /**
   * Get budget change history for a campaign
   */
  getBudgetHistory: async (
    accountId: string,
    campaignId: string,
    limit: number = 50,
  ): Promise<BudgetHistory> => {
    const params = new URLSearchParams({ limit: String(limit) });
    return apiMethods.get<BudgetHistory>(
      `${GOOGLE_ADS_PATH}/accounts/${accountId}/campaigns/${campaignId}/budget/history?${params.toString()}`,
    );
  },

  /**
   * Get account-wide budget overview
   */
  getAccountBudgetOverview: async (accountId: string): Promise<AccountBudgetOverview> => {
    return apiMethods.get<AccountBudgetOverview>(
      `${GOOGLE_ADS_PATH}/accounts/${accountId}/budget-overview`,
    );
  },
};
