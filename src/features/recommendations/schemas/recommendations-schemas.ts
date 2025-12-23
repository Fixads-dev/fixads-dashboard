/**
 * Zod schemas for Google Ads Recommendations API responses
 *
 * These schemas provide runtime validation for recommendation responses,
 * ensuring type safety at the API boundary.
 */

import { z } from "zod";

/**
 * Recommendation types from Google Ads API v22
 */
export const RecommendationTypeSchema = z.enum([
  "UNSPECIFIED",
  "UNKNOWN",
  "CAMPAIGN_BUDGET",
  "KEYWORD",
  "TEXT_AD",
  "TARGET_CPA_OPT_IN",
  "MAXIMIZE_CONVERSIONS_OPT_IN",
  "ENHANCED_CPC_OPT_IN",
  "SEARCH_PARTNERS_OPT_IN",
  "MAXIMIZE_CLICKS_OPT_IN",
  "OPTIMIZE_AD_ROTATION",
  "KEYWORD_MATCH_TYPE",
  "MOVE_UNUSED_BUDGET",
  "FORECASTING_CAMPAIGN_BUDGET",
  "TARGET_ROAS_OPT_IN",
  "RESPONSIVE_SEARCH_AD",
  "MARGINAL_ROI_CAMPAIGN_BUDGET",
  "USE_BROAD_MATCH_KEYWORD",
  "RESPONSIVE_SEARCH_AD_ASSET",
  "UPGRADE_SMART_SHOPPING_CAMPAIGN_TO_PERFORMANCE_MAX",
  "RESPONSIVE_SEARCH_AD_IMPROVE_AD_STRENGTH",
  "DISPLAY_EXPANSION_OPT_IN",
  "UPGRADE_LOCAL_CAMPAIGN_TO_PERFORMANCE_MAX",
  "RAISE_TARGET_CPA_BID_TOO_LOW",
  "FORECASTING_SET_TARGET_ROAS",
  "CALLOUT_ASSET",
  "SITELINK_ASSET",
  "CALL_ASSET",
  "SHOPPING_ADD_AGE_GROUP",
  "SHOPPING_ADD_COLOR",
  "SHOPPING_ADD_GENDER",
  "SHOPPING_ADD_GTIN",
  "SHOPPING_ADD_MORE_IDENTIFIERS",
  "SHOPPING_ADD_SIZE",
  "SHOPPING_ADD_PRODUCTS_TO_CAMPAIGN",
  "SHOPPING_FIX_DISAPPROVED_PRODUCTS",
  "SHOPPING_TARGET_ALL_OFFERS",
  "SHOPPING_FIX_SUSPENDED_MERCHANT_CENTER_ACCOUNT",
  "SHOPPING_FIX_MERCHANT_CENTER_ACCOUNT_SUSPENSION_WARNING",
  "SHOPPING_MIGRATE_REGULAR_SHOPPING_CAMPAIGN_OFFERS_TO_PERFORMANCE_MAX",
  "DYNAMIC_IMAGE_EXTENSION_OPT_IN",
  "RAISE_TARGET_CPA",
  "LOWER_TARGET_ROAS",
  "PERFORMANCE_MAX_OPT_IN",
  "IMPROVE_PERFORMANCE_MAX_AD_STRENGTH",
  "MIGRATE_DYNAMIC_SEARCH_ADS_CAMPAIGN_TO_PERFORMANCE_MAX",
]);

export type RecommendationType = z.infer<typeof RecommendationTypeSchema>;

/**
 * Impact metrics schema
 */
export const RecommendationImpactMetricsSchema = z.object({
  impressions: z.number(),
  clicks: z.number(),
  cost_micros: z.number(),
  conversions: z.number(),
});

export type RecommendationImpactMetrics = z.infer<typeof RecommendationImpactMetricsSchema>;

/**
 * Impact schema
 */
export const RecommendationImpactSchema = z.object({
  base_metrics: RecommendationImpactMetricsSchema,
  potential_metrics: RecommendationImpactMetricsSchema,
});

export type RecommendationImpact = z.infer<typeof RecommendationImpactSchema>;

/**
 * Recommendation schema
 * Note: details is Record<string, unknown> as it varies by recommendation type
 */
export const RecommendationSchema = z.object({
  recommendation_id: z.string(),
  resource_name: z.string(),
  type: RecommendationTypeSchema,
  campaign_id: z.string().nullable(),
  campaign_name: z.string().nullable(),
  ad_group_id: z.string().nullable(),
  dismissed: z.boolean(),
  impact: RecommendationImpactSchema.nullable(),
  details: z.record(z.string(), z.unknown()),
});

export type Recommendation = z.infer<typeof RecommendationSchema>;

/**
 * Recommendations list response schema
 */
export const RecommendationsResponseSchema = z.object({
  recommendations: z.array(RecommendationSchema),
  total_count: z.number(),
});

export type RecommendationsResponse = z.infer<typeof RecommendationsResponseSchema>;

/**
 * Apply recommendation response schema
 */
export const ApplyRecommendationResponseSchema = z.object({
  recommendation_id: z.string(),
  success: z.boolean(),
  resource_name: z.string().nullable(),
  error_message: z.string().nullable(),
});

export type ApplyRecommendationResponse = z.infer<typeof ApplyRecommendationResponseSchema>;

/**
 * Apply recommendations batch response schema
 */
export const ApplyRecommendationsBatchResponseSchema = z.object({
  results: z.array(ApplyRecommendationResponseSchema),
  total_applied: z.number(),
  total_failed: z.number(),
});

export type ApplyRecommendationsBatchResponse = z.infer<
  typeof ApplyRecommendationsBatchResponseSchema
>;

/**
 * Dismiss recommendation response schema
 */
export const DismissRecommendationResponseSchema = z.object({
  recommendation_id: z.string(),
  success: z.boolean(),
  error_message: z.string().nullable(),
});

export type DismissRecommendationResponse = z.infer<typeof DismissRecommendationResponseSchema>;

/**
 * Dismiss recommendations batch response schema
 */
export const DismissRecommendationsBatchResponseSchema = z.object({
  results: z.array(DismissRecommendationResponseSchema),
  total_dismissed: z.number(),
  total_failed: z.number(),
});

export type DismissRecommendationsBatchResponse = z.infer<
  typeof DismissRecommendationsBatchResponseSchema
>;

/**
 * Helper to safely parse recommendation response with validation
 * Returns parsed data or throws with detailed error message
 */
export function parseRecommendationResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`Recommendation validation failed for ${context}:`, result.error.format());
    throw new Error(`Invalid recommendation response for ${context}: ${result.error.message}`);
  }
  return result.data;
}
