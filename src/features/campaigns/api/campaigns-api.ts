import { apiMethods } from "@/shared/api";
import type {
  AssetGroup,
  AssetGroupWithAssets,
  Campaign,
  CampaignFilters,
  CampaignsResponse,
  TextAsset,
} from "../types";

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
        campaign_name: String(row["campaign.name"] ?? ""),
        status: (row["campaign.status"] as Campaign["status"]) ?? "UNKNOWN",
        impressions: Number(row["metrics.impressions"] ?? 0),
        clicks: Number(row["metrics.clicks"] ?? 0),
        conversions: Number(row["metrics.conversions"] ?? 0),
        cost_micros: Number(row["metrics.cost_micros"] ?? 0),
      };
    }
    return null;
  },

  /**
   * Get asset groups for a campaign
   * GET /google-ads/pmax/campaigns/{campaign_id}/asset-groups?account_id=UUID
   */
  getAssetGroups: async (accountId: string, campaignId: string): Promise<AssetGroup[]> => {
    const result = await apiMethods.get<
      Array<{
        asset_group_id: string;
        asset_group_name: string;
        status: string;
        final_urls?: string[];
      }>
    >(`${GOOGLE_ADS_PATH}/pmax/campaigns/${campaignId}/asset-groups?account_id=${accountId}`);
    return result.map((ag) => ({
      asset_group_id: ag.asset_group_id,
      asset_group_name: ag.asset_group_name,
      status: ag.status as AssetGroup["status"],
      campaign_id: campaignId,
      final_url: ag.final_urls?.[0],
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

  /**
   * Get text assets (headlines, long headlines, descriptions) for a campaign
   * GET /google-ads/pmax/campaigns/{campaign_id}/text-assets?account_id=UUID
   */
  getTextAssets: async (accountId: string, campaignId: string): Promise<AssetGroupWithAssets[]> => {
    interface BackendAsset {
      resource_name: string;
      field_type: string;
      text: string;
      status: string;
    }
    interface BackendAssetGroup {
      asset_group_id: string;
      asset_group_name: string;
      assets: BackendAsset[];
    }
    interface BackendResponse {
      campaign_id: string;
      campaign_name: string;
      asset_groups: BackendAssetGroup[];
    }

    const result = await apiMethods.get<BackendResponse>(
      `${GOOGLE_ADS_PATH}/pmax/campaigns/${campaignId}/text-assets?account_id=${accountId}`,
    );

    const fieldTypeToKey: Record<string, "headlines" | "long_headlines" | "descriptions"> = {
      HEADLINE: "headlines",
      LONG_HEADLINE: "long_headlines",
      DESCRIPTION: "descriptions",
    };

    return (result.asset_groups ?? []).map((ag) => {
      const group: AssetGroupWithAssets = {
        asset_group_id: ag.asset_group_id,
        asset_group_name: ag.asset_group_name,
        headlines: [],
        long_headlines: [],
        descriptions: [],
      };

      for (const asset of ag.assets ?? []) {
        const key = fieldTypeToKey[asset.field_type];
        if (key) {
          group[key].push({
            asset_id: asset.resource_name,
            asset_group_id: ag.asset_group_id,
            asset_group_name: ag.asset_group_name,
            field_type: asset.field_type as TextAsset["field_type"],
            text: asset.text,
            status: asset.status,
            performance_label: undefined, // Backend doesn't include this without metrics
          });
        }
      }

      return group;
    });
  },
};
