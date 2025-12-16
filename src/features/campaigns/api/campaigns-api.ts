import { apiMethods } from "@/shared/api";
import type {
  AssetGroup,
  AssetGroupWithAssets,
  Campaign,
  CampaignDetail,
  CampaignFilters,
  CampaignsResponse,
  DailyMetrics,
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
   * Get comprehensive campaign details with all available metrics
   * POST /google-ads/query?account_id=UUID
   */
  getCampaignDetail: async (
    accountId: string,
    campaignId: string,
  ): Promise<CampaignDetail | null> => {
    // Query for maximum campaign data with all available metrics
    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.bidding_strategy_type,
        campaign.optimization_score,
        campaign.start_date,
        campaign.end_date,
        campaign_budget.amount_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.ctr,
        metrics.average_cpc,
        metrics.average_cpm,
        metrics.conversions,
        metrics.conversions_value,
        metrics.cost_per_conversion,
        metrics.all_conversions,
        metrics.all_conversions_value,
        metrics.view_through_conversions,
        metrics.search_impression_share,
        metrics.search_budget_lost_impression_share,
        metrics.search_rank_lost_impression_share,
        metrics.search_absolute_top_impression_share,
        metrics.search_top_impression_share,
        metrics.content_impression_share,
        metrics.interactions,
        metrics.interaction_rate,
        metrics.engagements,
        metrics.engagement_rate,
        metrics.invalid_clicks,
        metrics.invalid_click_rate
      FROM campaign
      WHERE campaign.advertising_channel_type = 'PERFORMANCE_MAX'
        AND campaign.id = ${campaignId}
        AND segments.date DURING LAST_30_DAYS
    `;
    const result = await apiMethods.post<{ rows: Record<string, unknown>[] }>(
      `${GOOGLE_ADS_PATH}/query?account_id=${accountId}`,
      { query },
    );
    if (result.rows && result.rows.length > 0) {
      const row = result.rows[0];
      const impressions = Number(row["metrics.impressions"] ?? 0);
      const clicks = Number(row["metrics.clicks"] ?? 0);
      const conversions = Number(row["metrics.conversions"] ?? 0);

      return {
        campaign_id: String(row["campaign.id"] ?? campaignId),
        campaign_name: String(row["campaign.name"] ?? ""),
        status: (row["campaign.status"] as Campaign["status"]) ?? "UNKNOWN",
        bidding_strategy_type: row[
          "campaign.bidding_strategy_type"
        ] as Campaign["bidding_strategy_type"],
        optimization_score: row["campaign.optimization_score"] as number | undefined,
        start_date: row["campaign.start_date"] as string | undefined,
        end_date: row["campaign.end_date"] as string | undefined,
        budget_amount_micros: Number(row["campaign_budget.amount_micros"] ?? 0),
        impressions,
        clicks,
        cost_micros: Number(row["metrics.cost_micros"] ?? 0),
        conversions,
        ctr: Number(row["metrics.ctr"] ?? 0),
        average_cpc: Number(row["metrics.average_cpc"] ?? 0),
        conversions_value: Number(row["metrics.conversions_value"] ?? 0),
        cost_per_conversion: Number(row["metrics.cost_per_conversion"] ?? 0),
        conversion_rate: impressions > 0 ? (conversions / impressions) * 100 : 0,
        all_conversions: Number(row["metrics.all_conversions"] ?? 0),
        view_through_conversions: Number(row["metrics.view_through_conversions"] ?? 0),
        search_impression_share: row["metrics.search_impression_share"] as number | undefined,
        search_budget_lost_impression_share: row["metrics.search_budget_lost_impression_share"] as
          | number
          | undefined,
        search_rank_lost_impression_share: row["metrics.search_rank_lost_impression_share"] as
          | number
          | undefined,
        metrics: {
          impressions,
          clicks,
          cost_micros: Number(row["metrics.cost_micros"] ?? 0),
          ctr: Number(row["metrics.ctr"] ?? 0),
          average_cpc: Number(row["metrics.average_cpc"] ?? 0),
          average_cpm: Number(row["metrics.average_cpm"] ?? 0),
          conversions,
          conversions_value: Number(row["metrics.conversions_value"] ?? 0),
          cost_per_conversion: Number(row["metrics.cost_per_conversion"] ?? 0),
          conversion_rate: clicks > 0 ? (conversions / clicks) * 100 : 0,
          all_conversions: Number(row["metrics.all_conversions"] ?? 0),
          all_conversions_value: Number(row["metrics.all_conversions_value"] ?? 0),
          view_through_conversions: Number(row["metrics.view_through_conversions"] ?? 0),
          search_impression_share: row["metrics.search_impression_share"] as number | undefined,
          search_budget_lost_impression_share: row["metrics.search_budget_lost_impression_share"] as
            | number
            | undefined,
          search_rank_lost_impression_share: row["metrics.search_rank_lost_impression_share"] as
            | number
            | undefined,
          search_absolute_top_impression_share: row[
            "metrics.search_absolute_top_impression_share"
          ] as number | undefined,
          search_top_impression_share: row["metrics.search_top_impression_share"] as
            | number
            | undefined,
          content_impression_share: row["metrics.content_impression_share"] as number | undefined,
          interactions: Number(row["metrics.interactions"] ?? 0),
          interaction_rate: Number(row["metrics.interaction_rate"] ?? 0),
          engagements: Number(row["metrics.engagements"] ?? 0),
          engagement_rate: Number(row["metrics.engagement_rate"] ?? 0),
          invalid_clicks: Number(row["metrics.invalid_clicks"] ?? 0),
          invalid_click_rate: Number(row["metrics.invalid_click_rate"] ?? 0),
        },
        settings: {
          bidding_strategy_type:
            (row[
              "campaign.bidding_strategy_type"
            ] as CampaignDetail["settings"]["bidding_strategy_type"]) ?? "UNSPECIFIED",
          start_date: row["campaign.start_date"] as string | undefined,
          end_date: row["campaign.end_date"] as string | undefined,
          budget_micros: Number(row["campaign_budget.amount_micros"] ?? 0),
        },
      };
    }
    return null;
  },

  /**
   * Get daily metrics for time series charts
   * POST /google-ads/query?account_id=UUID
   */
  getDailyMetrics: async (
    accountId: string,
    campaignId: string,
    days: number = 30,
  ): Promise<DailyMetrics[]> => {
    const query = `
      SELECT
        segments.date,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.ctr,
        metrics.average_cpc
      FROM campaign
      WHERE campaign.advertising_channel_type = 'PERFORMANCE_MAX'
        AND campaign.id = ${campaignId}
        AND segments.date DURING LAST_${days}_DAYS
      ORDER BY segments.date ASC
    `;
    const result = await apiMethods.post<{ rows: Record<string, unknown>[] }>(
      `${GOOGLE_ADS_PATH}/query?account_id=${accountId}`,
      { query },
    );
    if (result.rows && result.rows.length > 0) {
      return result.rows.map((row) => ({
        date: String(row["segments.date"] ?? ""),
        impressions: Number(row["metrics.impressions"] ?? 0),
        clicks: Number(row["metrics.clicks"] ?? 0),
        cost_micros: Number(row["metrics.cost_micros"] ?? 0),
        conversions: Number(row["metrics.conversions"] ?? 0),
        ctr: Number(row["metrics.ctr"] ?? 0),
        average_cpc: Number(row["metrics.average_cpc"] ?? 0),
      }));
    }
    return [];
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
