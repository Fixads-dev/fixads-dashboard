/**
 * Recommendation types - matches Google Ads API v22 Recommendation resource
 * Based on backend schemas in schemas.py
 */

/**
 * Google Ads Recommendation types
 * See: https://developers.google.com/google-ads/api/reference/rpc/v22/RecommendationTypeEnum.RecommendationType
 */
export type RecommendationType =
  | "UNSPECIFIED"
  | "UNKNOWN"
  | "CAMPAIGN_BUDGET"
  | "KEYWORD"
  | "TEXT_AD"
  | "TARGET_CPA_OPT_IN"
  | "MAXIMIZE_CONVERSIONS_OPT_IN"
  | "ENHANCED_CPC_OPT_IN"
  | "SEARCH_PARTNERS_OPT_IN"
  | "MAXIMIZE_CLICKS_OPT_IN"
  | "OPTIMIZE_AD_ROTATION"
  | "KEYWORD_MATCH_TYPE"
  | "MOVE_UNUSED_BUDGET"
  | "FORECASTING_CAMPAIGN_BUDGET"
  | "TARGET_ROAS_OPT_IN"
  | "RESPONSIVE_SEARCH_AD"
  | "MARGINAL_ROI_CAMPAIGN_BUDGET"
  | "USE_BROAD_MATCH_KEYWORD"
  | "RESPONSIVE_SEARCH_AD_ASSET"
  | "UPGRADE_SMART_SHOPPING_CAMPAIGN_TO_PERFORMANCE_MAX"
  | "RESPONSIVE_SEARCH_AD_IMPROVE_AD_STRENGTH"
  | "DISPLAY_EXPANSION_OPT_IN"
  | "UPGRADE_LOCAL_CAMPAIGN_TO_PERFORMANCE_MAX"
  | "RAISE_TARGET_CPA_BID_TOO_LOW"
  | "FORECASTING_SET_TARGET_ROAS"
  | "CALLOUT_ASSET"
  | "SITELINK_ASSET"
  | "CALL_ASSET"
  | "SHOPPING_ADD_AGE_GROUP"
  | "SHOPPING_ADD_COLOR"
  | "SHOPPING_ADD_GENDER"
  | "SHOPPING_ADD_GTIN"
  | "SHOPPING_ADD_MORE_IDENTIFIERS"
  | "SHOPPING_ADD_SIZE"
  | "SHOPPING_ADD_PRODUCTS_TO_CAMPAIGN"
  | "SHOPPING_FIX_DISAPPROVED_PRODUCTS"
  | "SHOPPING_TARGET_ALL_OFFERS"
  | "SHOPPING_FIX_SUSPENDED_MERCHANT_CENTER_ACCOUNT"
  | "SHOPPING_FIX_MERCHANT_CENTER_ACCOUNT_SUSPENSION_WARNING"
  | "SHOPPING_MIGRATE_REGULAR_SHOPPING_CAMPAIGN_OFFERS_TO_PERFORMANCE_MAX"
  | "DYNAMIC_IMAGE_EXTENSION_OPT_IN"
  | "RAISE_TARGET_CPA"
  | "LOWER_TARGET_ROAS"
  | "PERFORMANCE_MAX_OPT_IN"
  | "IMPROVE_PERFORMANCE_MAX_AD_STRENGTH"
  | "MIGRATE_DYNAMIC_SEARCH_ADS_CAMPAIGN_TO_PERFORMANCE_MAX";

/**
 * User-facing recommendation status
 */
export type RecommendationStatus = "active" | "dismissed" | "applied";

/**
 * Priority level for sorting/filtering
 */
export type RecommendationPriority = "high" | "medium" | "low";

/**
 * Impact metrics showing potential improvement
 */
export interface RecommendationImpactMetrics {
  impressions: number;
  clicks: number;
  cost_micros: number;
  conversions: number;
}

/**
 * Impact comparison between base and potential metrics
 */
export interface RecommendationImpact {
  base_metrics: RecommendationImpactMetrics;
  potential_metrics: RecommendationImpactMetrics;
}

/**
 * Single recommendation from Google Ads API
 */
export interface Recommendation {
  recommendation_id: string;
  resource_name: string;
  type: RecommendationType;
  campaign_id: string | null;
  campaign_name: string | null;
  ad_group_id: string | null;
  dismissed: boolean;
  impact: RecommendationImpact | null;
  details: Record<string, unknown>;
}

/**
 * API response for listing recommendations
 */
export interface RecommendationsResponse {
  recommendations: Recommendation[];
  total_count: number;
}

/**
 * Filters for fetching recommendations
 */
export interface RecommendationFilters {
  account_id: string;
  types?: RecommendationType[];
  campaign_id?: string;
  include_dismissed?: boolean;
  limit?: number;
}

/**
 * Parameters for applying a recommendation
 */
export interface ApplyRecommendationParameters {
  keyword?: {
    match_type?: "EXACT" | "PHRASE" | "BROAD";
    cpc_bid_micros?: number;
  };
  campaign_budget?: {
    new_budget_amount_micros?: number;
  };
  target_cpa?: {
    target_cpa_micros?: number;
  };
}

/**
 * Request to apply a single recommendation
 */
export interface ApplyRecommendationRequest {
  recommendation_id: string;
  parameters?: ApplyRecommendationParameters;
}

/**
 * Response from applying a single recommendation
 */
export interface ApplyRecommendationResponse {
  recommendation_id: string;
  success: boolean;
  resource_name: string | null;
  error_message: string | null;
}

/**
 * Request to apply multiple recommendations
 * Backend expects just an array of IDs (not full request objects)
 */
export interface ApplyRecommendationsBatchRequest {
  recommendation_ids: string[];
}

/**
 * Response from applying multiple recommendations
 * Backend returns total_applied/total_failed (not success_count/failure_count)
 */
export interface ApplyRecommendationsBatchResponse {
  results: ApplyRecommendationResponse[];
  total_applied: number;
  total_failed: number;
}

/**
 * Request to dismiss a single recommendation
 */
export interface DismissRecommendationRequest {
  recommendation_id: string;
}

/**
 * Response from dismissing a single recommendation
 */
export interface DismissRecommendationResponse {
  recommendation_id: string;
  success: boolean;
  error_message: string | null;
}

/**
 * Request to dismiss multiple recommendations
 */
export interface DismissRecommendationsBatchRequest {
  recommendation_ids: string[];
}

/**
 * Response from dismissing multiple recommendations
 * Backend returns total_dismissed/total_failed (not success_count/failure_count)
 */
export interface DismissRecommendationsBatchResponse {
  results: DismissRecommendationResponse[];
  total_dismissed: number;
  total_failed: number;
}

/**
 * Mapping of recommendation types to user-friendly labels
 */
export const RECOMMENDATION_TYPE_LABELS: Record<string, string> = {
  CAMPAIGN_BUDGET: "Adjust Budget",
  KEYWORD: "Add Keyword",
  TEXT_AD: "Update Text Ad",
  TARGET_CPA_OPT_IN: "Enable Target CPA",
  MAXIMIZE_CONVERSIONS_OPT_IN: "Maximize Conversions",
  ENHANCED_CPC_OPT_IN: "Enable Enhanced CPC",
  SEARCH_PARTNERS_OPT_IN: "Enable Search Partners",
  MAXIMIZE_CLICKS_OPT_IN: "Maximize Clicks",
  OPTIMIZE_AD_ROTATION: "Optimize Ad Rotation",
  KEYWORD_MATCH_TYPE: "Change Match Type",
  MOVE_UNUSED_BUDGET: "Move Unused Budget",
  FORECASTING_CAMPAIGN_BUDGET: "Forecast Budget",
  TARGET_ROAS_OPT_IN: "Enable Target ROAS",
  RESPONSIVE_SEARCH_AD: "Add Responsive Search Ad",
  MARGINAL_ROI_CAMPAIGN_BUDGET: "Adjust Budget for ROI",
  USE_BROAD_MATCH_KEYWORD: "Use Broad Match",
  RESPONSIVE_SEARCH_AD_ASSET: "Add RSA Asset",
  RESPONSIVE_SEARCH_AD_IMPROVE_AD_STRENGTH: "Improve Ad Strength",
  DISPLAY_EXPANSION_OPT_IN: "Enable Display Expansion",
  RAISE_TARGET_CPA_BID_TOO_LOW: "Raise Target CPA",
  FORECASTING_SET_TARGET_ROAS: "Set Target ROAS",
  CALLOUT_ASSET: "Add Callout",
  SITELINK_ASSET: "Add Sitelink",
  CALL_ASSET: "Add Call Extension",
  PERFORMANCE_MAX_OPT_IN: "Upgrade to PMax",
  IMPROVE_PERFORMANCE_MAX_AD_STRENGTH: "Improve PMax Strength",
};

/**
 * Recommendation type categories for grouping
 */
export const RECOMMENDATION_CATEGORIES: Record<string, RecommendationType[]> = {
  Budget: [
    "CAMPAIGN_BUDGET",
    "MOVE_UNUSED_BUDGET",
    "FORECASTING_CAMPAIGN_BUDGET",
    "MARGINAL_ROI_CAMPAIGN_BUDGET",
  ],
  Bidding: [
    "TARGET_CPA_OPT_IN",
    "TARGET_ROAS_OPT_IN",
    "MAXIMIZE_CONVERSIONS_OPT_IN",
    "MAXIMIZE_CLICKS_OPT_IN",
    "ENHANCED_CPC_OPT_IN",
    "RAISE_TARGET_CPA_BID_TOO_LOW",
    "FORECASTING_SET_TARGET_ROAS",
  ],
  Keywords: ["KEYWORD", "KEYWORD_MATCH_TYPE", "USE_BROAD_MATCH_KEYWORD"],
  Ads: [
    "TEXT_AD",
    "RESPONSIVE_SEARCH_AD",
    "RESPONSIVE_SEARCH_AD_ASSET",
    "RESPONSIVE_SEARCH_AD_IMPROVE_AD_STRENGTH",
    "OPTIMIZE_AD_ROTATION",
  ],
  Extensions: ["CALLOUT_ASSET", "SITELINK_ASSET", "CALL_ASSET"],
  "Performance Max": ["PERFORMANCE_MAX_OPT_IN", "IMPROVE_PERFORMANCE_MAX_AD_STRENGTH"],
};

/**
 * Get category for a recommendation type
 */
export function getRecommendationCategory(type: RecommendationType): string {
  for (const [category, types] of Object.entries(RECOMMENDATION_CATEGORIES)) {
    if (types.includes(type)) {
      return category;
    }
  }
  return "Other";
}

/**
 * Get user-friendly label for a recommendation type
 */
export function getRecommendationLabel(type: RecommendationType): string {
  return RECOMMENDATION_TYPE_LABELS[type] || type.replace(/_/g, " ").toLowerCase();
}

/**
 * Calculate potential improvement percentage from impact
 */
export function calculateImpactPercentage(
  impact: RecommendationImpact | null,
  metric: keyof RecommendationImpactMetrics,
): number | null {
  if (!impact) return null;

  const base = impact.base_metrics[metric];
  const potential = impact.potential_metrics[metric];

  if (base === 0) {
    return potential > 0 ? 100 : 0;
  }

  return Math.round(((potential - base) / base) * 100);
}
