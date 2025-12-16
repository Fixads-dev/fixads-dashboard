/**
 * Campaign types - matches API response (snake_case)
 */

export type CampaignStatus = "ENABLED" | "PAUSED" | "REMOVED" | "UNKNOWN";

/**
 * PMax Campaign from GET /google-ads/pmax/campaigns
 * Note: API returns flat structure with campaign_name and flat metrics
 */
export interface Campaign {
  campaign_id: string;
  campaign_name: string;
  status: CampaignStatus;
  // Flat metrics from API (last 30 days)
  impressions: number;
  clicks: number;
  cost_micros: number;
  conversions: number;
}

/**
 * Asset Group from GAQL query
 */
export interface AssetGroup {
  asset_group_id: string;
  asset_group_name: string;
  status?: CampaignStatus;
  campaign_id: string;
  final_url?: string;
}

export type AssetType = "HEADLINE" | "DESCRIPTION" | "LONG_HEADLINE";
export type AssetFieldType = "HEADLINE" | "LONG_HEADLINE" | "DESCRIPTION";
export type AssetPerformance = "BEST" | "GOOD" | "LOW" | "LEARNING" | "PENDING" | "UNSPECIFIED";
export type AssetStatus = "OK" | "NOT_GOOD";

/**
 * Asset from Text Optimizer response
 */
export interface Asset {
  resource_name: string;
  asset_group_asset_resource_name?: string;
  type: AssetFieldType;
  text: string;
  text_length?: number;
  status?: AssetStatus;
  reasons?: string[];
  performance?: AssetPerformance;
}

/**
 * Suggested asset from AI generation
 */
export interface SuggestedAsset {
  field_type: AssetFieldType;
  text: string;
  reason?: string;
}

/**
 * GET /google-ads/pmax/campaigns returns array directly
 */
export type CampaignsResponse = Campaign[];

/**
 * Asset groups from campaign (array)
 */
export type AssetGroupsResponse = AssetGroup[];

export interface CampaignFilters {
  account_id?: string;
  status?: CampaignStatus;
  search?: string;
}
