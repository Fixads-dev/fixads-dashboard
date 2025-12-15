import { apiMethods } from "@/shared/api";
import type { AssetGroup, Campaign, CampaignFilters, CampaignsResponse } from "../types";

const GOOGLE_ADS_PATH = "google-ads";

export const campaignsApi = {
  /**
   * Get all PMax campaigns for an account
   * GET /google-ads/pmax/campaigns?account_id=UUID
   */
  getCampaigns: (filters?: CampaignFilters) => {
    const params = new URLSearchParams();
    if (filters?.account_id) params.set("account_id", filters.account_id);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.search) params.set("search", filters.search);
    const queryString = params.toString();
    return apiMethods.get<CampaignsResponse>(
      `${GOOGLE_ADS_PATH}/pmax/campaigns${queryString ? `?${queryString}` : ""}`,
    );
  },

  /**
   * Get a single campaign by ID (via GAQL query)
   * POST /google-ads/query?account_id=UUID
   */
  getCampaign: async (accountId: string, campaignId: string): Promise<Campaign | null> => {
    const query = `
      SELECT campaign.id, campaign.name, campaign.status,
             metrics.impressions, metrics.clicks, metrics.conversions, metrics.cost_micros
      FROM campaign
      WHERE campaign.advertising_channel_type = 'PERFORMANCE_MAX'
        AND campaign.id = ${campaignId}
    `;
    const result = await apiMethods.post<{ rows: Record<string, unknown>[] }>(
      `${GOOGLE_ADS_PATH}/query?account_id=${accountId}`,
      { query },
    );
    if (result.rows && result.rows.length > 0) {
      const row = result.rows[0];
      return {
        campaign_id: String(row["campaign.id"] ?? campaignId),
        name: String(row["campaign.name"] ?? ""),
        status: (row["campaign.status"] as Campaign["status"]) ?? "UNKNOWN",
        metrics: {
          impressions: Number(row["metrics.impressions"] ?? 0),
          clicks: Number(row["metrics.clicks"] ?? 0),
          conversions: Number(row["metrics.conversions"] ?? 0),
          cost: Number(row["metrics.cost_micros"] ?? 0) / 1_000_000,
        },
      };
    }
    return null;
  },

  /**
   * Get asset groups for a campaign (via GAQL query)
   * POST /google-ads/query?account_id=UUID
   */
  getAssetGroups: async (accountId: string, campaignId: string): Promise<AssetGroup[]> => {
    const query = `
      SELECT asset_group.id, asset_group.name, asset_group.status, asset_group.final_urls
      FROM asset_group
      WHERE campaign.id = ${campaignId}
    `;
    const result = await apiMethods.post<{ rows: Record<string, unknown>[] }>(
      `${GOOGLE_ADS_PATH}/query?account_id=${accountId}`,
      { query },
    );
    return (result.rows ?? []).map((row) => ({
      asset_group_id: String(row["asset_group.id"] ?? ""),
      asset_group_name: String(row["asset_group.name"] ?? ""),
      status: row["asset_group.status"] as AssetGroup["status"],
      campaign_id: campaignId,
      final_url: Array.isArray(row["asset_group.final_urls"])
        ? row["asset_group.final_urls"][0]
        : undefined,
    }));
  },

  /**
   * Run a GAQL query
   * POST /google-ads/query?account_id=UUID
   */
  runQuery: (accountId: string, query: string) =>
    apiMethods.post<{ rows: Record<string, unknown>[] }>(
      `${GOOGLE_ADS_PATH}/query?account_id=${accountId}`,
      { query },
    ),
};
