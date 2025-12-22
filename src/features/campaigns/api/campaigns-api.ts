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
   * Supports ALL campaign types (not just PMax)
   * POST /google-ads/query?account_id=UUID
   */
  getCampaign: async (accountId: string, campaignId: string): Promise<Campaign | null> => {
    // GAQL requires date filter for metrics - use LAST_30_DAYS
    const query = `
      SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type,
             metrics.impressions, metrics.clicks, metrics.conversions, metrics.cost_micros,
             metrics.conversions_value
      FROM campaign
      WHERE campaign.id = ${campaignId}
        AND segments.date DURING LAST_30_DAYS
    `;
    try {
      const result = await apiMethods.post<{ rows: Record<string, unknown>[] }>(
        `${GOOGLE_ADS_PATH}/query?account_id=${accountId}`,
        { query },
      );
      if (result.rows && result.rows.length > 0) {
        // Aggregate metrics from multiple daily rows
        let impressions = 0;
        let clicks = 0;
        let conversions = 0;
        let cost_micros = 0;
        let conversions_value = 0;

        const firstRow = result.rows[0];
        for (const row of result.rows) {
          impressions += Number(row["metrics.impressions"] ?? 0);
          clicks += Number(row["metrics.clicks"] ?? 0);
          conversions += Number(row["metrics.conversions"] ?? 0);
          cost_micros += Number(row["metrics.cost_micros"] ?? 0);
          conversions_value += Number(row["metrics.conversions_value"] ?? 0);
        }

        return {
          campaign_id: String(firstRow["campaign.id"] ?? campaignId),
          campaign_name: String(firstRow["campaign.name"] ?? ""),
          status: (firstRow["campaign.status"] as Campaign["status"]) ?? "UNKNOWN",
          campaign_type: String(firstRow["campaign.advertising_channel_type"] ?? ""),
          impressions,
          clicks,
          conversions,
          cost_micros,
          conversions_value,
        };
      }
    } catch (error) {
      console.error("[getCampaign] Failed to fetch campaign:", error);
    }
    return null;
  },

  /**
   * Get comprehensive campaign details with all available metrics
   * GET /google-ads/pmax/campaigns/{campaignId}?account_id=UUID
   *
   * Uses dedicated backend endpoint that:
   * 1. Fetches campaign metadata (no date filter)
   * 2. Fetches metrics with date filter and aggregates per-day rows
   * 3. Returns properly aggregated metrics for last 30 days
   */
  getCampaignDetail: async (
    accountId: string,
    campaignId: string,
  ): Promise<CampaignDetail | null> => {
    try {
      // Use dedicated backend endpoint that handles aggregation properly
      const response = await apiMethods.get<{
        campaign_id: string;
        campaign_name: string;
        status: string;
        bidding_strategy_type: string | null;
        optimization_score: number | null;
        start_date: string | null;
        end_date: string | null;
        budget_amount_micros: number;
        impressions: number;
        clicks: number;
        cost_micros: number;
        conversions: number;
        conversions_value: number;
        all_conversions: number;
        all_conversions_value: number;
        view_through_conversions: number;
        interactions: number;
        engagements: number;
        invalid_clicks: number;
        ctr: number;
        average_cpc: number;
        average_cpm: number;
        cost_per_conversion: number;
        conversion_rate: number;
      }>(`${GOOGLE_ADS_PATH}/pmax/campaigns/${campaignId}?account_id=${accountId}`);

      const {
        impressions,
        clicks,
        cost_micros,
        conversions,
        ctr,
        average_cpc,
        average_cpm,
        cost_per_conversion,
        conversion_rate,
      } = response;

      // Calculate additional rates
      const interaction_rate = impressions > 0 ? (response.interactions / impressions) * 100 : 0;
      const engagement_rate = impressions > 0 ? (response.engagements / impressions) * 100 : 0;
      const invalid_click_rate = clicks > 0 ? (response.invalid_clicks / clicks) * 100 : 0;

      return {
        campaign_id: response.campaign_id,
        campaign_name: response.campaign_name,
        status: response.status as Campaign["status"],
        bidding_strategy_type: response.bidding_strategy_type as Campaign["bidding_strategy_type"],
        optimization_score: response.optimization_score ?? undefined,
        start_date: response.start_date ?? undefined,
        end_date: response.end_date ?? undefined,
        budget_amount_micros: response.budget_amount_micros,
        impressions,
        clicks,
        cost_micros,
        conversions,
        ctr,
        average_cpc,
        conversions_value: response.conversions_value,
        cost_per_conversion,
        conversion_rate,
        all_conversions: response.all_conversions,
        view_through_conversions: response.view_through_conversions,
        search_impression_share: undefined,
        search_budget_lost_impression_share: undefined,
        search_rank_lost_impression_share: undefined,
        metrics: {
          impressions,
          clicks,
          cost_micros,
          ctr,
          average_cpc,
          average_cpm,
          conversions,
          conversions_value: response.conversions_value,
          cost_per_conversion,
          conversion_rate,
          all_conversions: response.all_conversions,
          all_conversions_value: response.all_conversions_value,
          view_through_conversions: response.view_through_conversions,
          search_impression_share: undefined,
          search_budget_lost_impression_share: undefined,
          search_rank_lost_impression_share: undefined,
          search_absolute_top_impression_share: undefined,
          search_top_impression_share: undefined,
          content_impression_share: undefined,
          interactions: response.interactions,
          interaction_rate,
          engagements: response.engagements,
          engagement_rate,
          invalid_clicks: response.invalid_clicks,
          invalid_click_rate,
        },
        settings: {
          bidding_strategy_type:
            (response.bidding_strategy_type as CampaignDetail["settings"]["bidding_strategy_type"]) ??
            "UNSPECIFIED",
          start_date: response.start_date ?? undefined,
          end_date: response.end_date ?? undefined,
          budget_micros: response.budget_amount_micros,
        },
      };
    } catch {
      return null;
    }
  },

  /**
   * Get daily metrics for time series charts
   * POST /google-ads/query?account_id=UUID
   *
   * GAQL supports LAST_7_DAYS, LAST_14_DAYS, LAST_30_DAYS, LAST_90_DAYS
   * For other values, use explicit date range with BETWEEN
   */
  getDailyMetrics: async (
    accountId: string,
    campaignId: string,
    days: number = 30,
  ): Promise<DailyMetrics[]> => {
    // GAQL only supports specific LAST_X_DAYS values
    const validDuringValues = [7, 14, 30, 90];
    let dateFilter: string;

    if (validDuringValues.includes(days)) {
      dateFilter = `segments.date DURING LAST_${days}_DAYS`;
    } else {
      // Calculate explicit date range for other values (e.g., 60 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const formatDate = (d: Date) => d.toISOString().split("T")[0];
      dateFilter = `segments.date BETWEEN '${formatDate(startDate)}' AND '${formatDate(endDate)}'`;
    }

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
        AND ${dateFilter}
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
