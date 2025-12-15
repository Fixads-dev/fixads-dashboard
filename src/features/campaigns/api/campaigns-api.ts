import { apiMethods } from "@/shared/api";
import type { AssetGroupsResponse, Campaign, CampaignFilters, CampaignsResponse } from "../types";

const GOOGLE_ADS_PATH = "google-ads";

export const campaignsApi = {
  /**
   * Get all PMax campaigns for an account
   */
  getCampaigns: (filters?: CampaignFilters) => {
    const params = new URLSearchParams();
    if (filters?.accountId) params.set("account_id", filters.accountId);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.search) params.set("search", filters.search);
    const queryString = params.toString();
    return apiMethods.get<CampaignsResponse>(
      `${GOOGLE_ADS_PATH}/pmax/campaigns${queryString ? `?${queryString}` : ""}`,
    );
  },

  /**
   * Get a single campaign by ID
   */
  getCampaign: (accountId: string, campaignId: string) =>
    apiMethods.get<Campaign>(`${GOOGLE_ADS_PATH}/accounts/${accountId}/campaigns/${campaignId}`),

  /**
   * Get asset groups for a campaign
   */
  getAssetGroups: (accountId: string, campaignId: string) =>
    apiMethods.get<AssetGroupsResponse>(
      `${GOOGLE_ADS_PATH}/accounts/${accountId}/campaigns/${campaignId}/asset-groups`,
    ),

  /**
   * Refresh campaign data from Google Ads API
   */
  refreshCampaign: (accountId: string, campaignId: string) =>
    apiMethods.post<Campaign>(
      `${GOOGLE_ADS_PATH}/accounts/${accountId}/campaigns/${campaignId}/refresh`,
    ),
};
