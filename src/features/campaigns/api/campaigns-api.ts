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

/**
 * Get a value from a GAQL row result, handling both flattened and nested formats.
 * Tries: row["asset_group.id"], row.asset_group?.id, row["assetGroup"]?.["id"]
 */
function getRowValue(row: Record<string, unknown>, path: string): unknown {
  // Try flattened dot-notation key first (e.g., "asset_group.id")
  if (path in row) return row[path];

  // Try nested object access (e.g., row.asset_group.id)
  const parts = path.split(".");
  let current: unknown = row;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current === "object") {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return current;
}

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
    const rows = result.rows ?? [];
    return rows.map((row) => {
      const finalUrls = getRowValue(row, "asset_group.final_urls");
      return {
        asset_group_id: String(getRowValue(row, "asset_group.id") ?? ""),
        asset_group_name: String(getRowValue(row, "asset_group.name") ?? ""),
        status: getRowValue(row, "asset_group.status") as AssetGroup["status"],
        campaign_id: campaignId,
        final_url: Array.isArray(finalUrls) ? String(finalUrls[0]) : undefined,
      };
    });
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
   * POST /google-ads/query?account_id=UUID
   */
  getTextAssets: async (accountId: string, campaignId: string): Promise<AssetGroupWithAssets[]> => {
    const query = `
      SELECT
        asset_group.id,
        asset_group.name,
        asset_group_asset.field_type,
        asset_group_asset.status,
        asset_group_asset.performance_label,
        asset.id,
        asset.text_asset.text
      FROM asset_group_asset
      WHERE campaign.id = ${campaignId}
        AND asset_group_asset.field_type IN ('HEADLINE', 'LONG_HEADLINE', 'DESCRIPTION')
        AND asset_group_asset.status != 'REMOVED'
    `;
    const result = await apiMethods.post<{ rows: Record<string, unknown>[] }>(
      `${GOOGLE_ADS_PATH}/query?account_id=${accountId}`,
      { query },
    );

    const assetGroupsMap = new Map<string, AssetGroupWithAssets>();
    const fieldTypeToKey: Record<string, "headlines" | "long_headlines" | "descriptions"> = {
      HEADLINE: "headlines",
      LONG_HEADLINE: "long_headlines",
      DESCRIPTION: "descriptions",
    };

    for (const row of result.rows ?? []) {
      const assetGroupId = String(getRowValue(row, "asset_group.id") ?? "");
      const assetGroupName = String(getRowValue(row, "asset_group.name") ?? "");
      const fieldType = String(getRowValue(row, "asset_group_asset.field_type") ?? "");

      let group = assetGroupsMap.get(assetGroupId);
      if (!group) {
        group = {
          asset_group_id: assetGroupId,
          asset_group_name: assetGroupName,
          headlines: [],
          long_headlines: [],
          descriptions: [],
        };
        assetGroupsMap.set(assetGroupId, group);
      }

      const key = fieldTypeToKey[fieldType];
      if (key) {
        group[key].push({
          asset_id: String(getRowValue(row, "asset.id") ?? ""),
          asset_group_id: assetGroupId,
          asset_group_name: assetGroupName,
          field_type: fieldType as TextAsset["field_type"],
          text: String(getRowValue(row, "asset.text_asset.text") ?? ""),
          status: String(getRowValue(row, "asset_group_asset.status") ?? ""),
          performance_label: getRowValue(
            row,
            "asset_group_asset.performance_label",
          ) as TextAsset["performance_label"],
        });
      }
    }

    return Array.from(assetGroupsMap.values());
  },
};
