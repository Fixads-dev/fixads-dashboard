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
   *
   * Uses two queries:
   * 1. Campaign metadata (no date filter) - always returns data if campaign exists
   * 2. Metrics with date filter - returns multiple rows (one per day) that need aggregation
   *
   * IMPORTANT: When using segments.date, Google Ads returns one row PER DAY.
   * We must aggregate all rows to get total metrics for the period.
   */
  getCampaignDetail: async (
    accountId: string,
    campaignId: string,
  ): Promise<CampaignDetail | null> => {
    // Query 1: Get campaign metadata WITHOUT date filter
    // This ensures we get campaign info even if there's no metrics data
    const metadataQuery = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.bidding_strategy_type,
        campaign.optimization_score,
        campaign.start_date,
        campaign.end_date,
        campaign_budget.amount_micros
      FROM campaign
      WHERE campaign.advertising_channel_type = 'PERFORMANCE_MAX'
        AND campaign.id = ${campaignId}
    `;

    // Query 2: Get metrics WITH date filter
    // NOTE: This returns ONE ROW PER DAY - must aggregate all rows!
    const metricsQuery = `
      SELECT
        campaign.id,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value,
        metrics.all_conversions,
        metrics.all_conversions_value,
        metrics.view_through_conversions,
        metrics.interactions,
        metrics.engagements,
        metrics.invalid_clicks
      FROM campaign
      WHERE campaign.advertising_channel_type = 'PERFORMANCE_MAX'
        AND campaign.id = ${campaignId}
        AND segments.date DURING LAST_30_DAYS
    `;

    // Execute both queries in parallel
    const [metadataResult, metricsResult] = await Promise.all([
      apiMethods.post<{ rows: Record<string, unknown>[] }>(
        `${GOOGLE_ADS_PATH}/query?account_id=${accountId}`,
        { query: metadataQuery },
      ),
      apiMethods.post<{ rows: Record<string, unknown>[] }>(
        `${GOOGLE_ADS_PATH}/query?account_id=${accountId}`,
        { query: metricsQuery },
      ),
    ]);

    // Campaign must exist (metadata query must return data)
    if (!metadataResult.rows || metadataResult.rows.length === 0) {
      return null;
    }

    const meta = metadataResult.rows[0];

    // Aggregate metrics from all rows (one row per day)
    // IMPORTANT: segments.date returns multiple rows that must be summed
    const metricsRows = metricsResult.rows ?? [];
    const aggregatedMetrics = {
      impressions: 0,
      clicks: 0,
      cost_micros: 0,
      conversions: 0,
      conversions_value: 0,
      all_conversions: 0,
      all_conversions_value: 0,
      view_through_conversions: 0,
      interactions: 0,
      engagements: 0,
      invalid_clicks: 0,
    };

    for (const row of metricsRows) {
      aggregatedMetrics.impressions += Number(row["metrics.impressions"] ?? 0);
      aggregatedMetrics.clicks += Number(row["metrics.clicks"] ?? 0);
      aggregatedMetrics.cost_micros += Number(row["metrics.cost_micros"] ?? 0);
      aggregatedMetrics.conversions += Number(row["metrics.conversions"] ?? 0);
      aggregatedMetrics.conversions_value += Number(row["metrics.conversions_value"] ?? 0);
      aggregatedMetrics.all_conversions += Number(row["metrics.all_conversions"] ?? 0);
      aggregatedMetrics.all_conversions_value += Number(row["metrics.all_conversions_value"] ?? 0);
      aggregatedMetrics.view_through_conversions += Number(
        row["metrics.view_through_conversions"] ?? 0,
      );
      aggregatedMetrics.interactions += Number(row["metrics.interactions"] ?? 0);
      aggregatedMetrics.engagements += Number(row["metrics.engagements"] ?? 0);
      aggregatedMetrics.invalid_clicks += Number(row["metrics.invalid_clicks"] ?? 0);
    }

    // Calculate derived metrics from aggregated totals
    const { impressions, clicks, conversions, cost_micros } = aggregatedMetrics;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const average_cpc = clicks > 0 ? cost_micros / clicks : 0;
    const average_cpm = impressions > 0 ? (cost_micros / impressions) * 1000 : 0;
    const cost_per_conversion = conversions > 0 ? cost_micros / conversions : 0;
    const conversion_rate = clicks > 0 ? (conversions / clicks) * 100 : 0;
    const interaction_rate =
      impressions > 0 ? (aggregatedMetrics.interactions / impressions) * 100 : 0;
    const engagement_rate =
      impressions > 0 ? (aggregatedMetrics.engagements / impressions) * 100 : 0;
    const invalid_click_rate = clicks > 0 ? (aggregatedMetrics.invalid_clicks / clicks) * 100 : 0;

    return {
      campaign_id: String(meta["campaign.id"] ?? campaignId),
      campaign_name: String(meta["campaign.name"] ?? ""),
      status: (meta["campaign.status"] as Campaign["status"]) ?? "UNKNOWN",
      bidding_strategy_type: meta[
        "campaign.bidding_strategy_type"
      ] as Campaign["bidding_strategy_type"],
      optimization_score: meta["campaign.optimization_score"] as number | undefined,
      start_date: meta["campaign.start_date"] as string | undefined,
      end_date: meta["campaign.end_date"] as string | undefined,
      budget_amount_micros: Number(meta["campaign_budget.amount_micros"] ?? 0),
      impressions,
      clicks,
      cost_micros,
      conversions,
      ctr,
      average_cpc,
      conversions_value: aggregatedMetrics.conversions_value,
      cost_per_conversion,
      conversion_rate,
      all_conversions: aggregatedMetrics.all_conversions,
      view_through_conversions: aggregatedMetrics.view_through_conversions,
      search_impression_share: undefined, // Not available with date aggregation
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
        conversions_value: aggregatedMetrics.conversions_value,
        cost_per_conversion,
        conversion_rate,
        all_conversions: aggregatedMetrics.all_conversions,
        all_conversions_value: aggregatedMetrics.all_conversions_value,
        view_through_conversions: aggregatedMetrics.view_through_conversions,
        search_impression_share: undefined,
        search_budget_lost_impression_share: undefined,
        search_rank_lost_impression_share: undefined,
        search_absolute_top_impression_share: undefined,
        search_top_impression_share: undefined,
        content_impression_share: undefined,
        interactions: aggregatedMetrics.interactions,
        interaction_rate,
        engagements: aggregatedMetrics.engagements,
        engagement_rate,
        invalid_clicks: aggregatedMetrics.invalid_clicks,
        invalid_click_rate,
      },
      settings: {
        bidding_strategy_type:
          (meta[
            "campaign.bidding_strategy_type"
          ] as CampaignDetail["settings"]["bidding_strategy_type"]) ?? "UNSPECIFIED",
        start_date: meta["campaign.start_date"] as string | undefined,
        end_date: meta["campaign.end_date"] as string | undefined,
        budget_micros: Number(meta["campaign_budget.amount_micros"] ?? 0),
      },
    };
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
