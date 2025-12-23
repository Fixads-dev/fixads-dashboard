/**
 * Zod schemas for GAQL (Google Ads Query Language) responses
 *
 * These schemas provide runtime validation for the loosely-typed
 * GAQL query responses, ensuring type safety at the API boundary.
 */

import { z } from "zod";

/**
 * Campaign status enum
 */
export const CampaignStatusSchema = z.enum(["ENABLED", "PAUSED", "REMOVED", "UNKNOWN"]);

/**
 * GAQL Campaign Row - response from campaign queries
 */
export const GaqlCampaignRowSchema = z.object({
  "campaign.id": z.union([z.string(), z.number()]).transform(String),
  "campaign.name": z.string().optional().default(""),
  "campaign.status": CampaignStatusSchema.optional().default("UNKNOWN"),
  "campaign.advertising_channel_type": z.string().optional().default(""),
  "metrics.impressions": z.union([z.string(), z.number()]).transform(Number).optional().default(0),
  "metrics.clicks": z.union([z.string(), z.number()]).transform(Number).optional().default(0),
  "metrics.conversions": z.union([z.string(), z.number()]).transform(Number).optional().default(0),
  "metrics.cost_micros": z.union([z.string(), z.number()]).transform(Number).optional().default(0),
  "metrics.conversions_value": z
    .union([z.string(), z.number()])
    .transform(Number)
    .optional()
    .default(0),
});

export type GaqlCampaignRow = z.infer<typeof GaqlCampaignRowSchema>;

/**
 * GAQL Campaign Response - array of campaign rows
 */
export const GaqlCampaignResponseSchema = z.object({
  rows: z.array(GaqlCampaignRowSchema).default([]),
});

export type GaqlCampaignResponse = z.infer<typeof GaqlCampaignResponseSchema>;

/**
 * GAQL Daily Metrics Row - response from daily metrics queries
 */
export const GaqlDailyMetricsRowSchema = z.object({
  "segments.date": z.string(),
  "metrics.impressions": z.union([z.string(), z.number()]).transform(Number).optional().default(0),
  "metrics.clicks": z.union([z.string(), z.number()]).transform(Number).optional().default(0),
  "metrics.cost_micros": z.union([z.string(), z.number()]).transform(Number).optional().default(0),
  "metrics.conversions": z.union([z.string(), z.number()]).transform(Number).optional().default(0),
  "metrics.ctr": z.union([z.string(), z.number()]).transform(Number).optional().default(0),
  "metrics.average_cpc": z.union([z.string(), z.number()]).transform(Number).optional().default(0),
});

export type GaqlDailyMetricsRow = z.infer<typeof GaqlDailyMetricsRowSchema>;

/**
 * GAQL Daily Metrics Response
 */
export const GaqlDailyMetricsResponseSchema = z.object({
  rows: z.array(GaqlDailyMetricsRowSchema).default([]),
});

export type GaqlDailyMetricsResponse = z.infer<typeof GaqlDailyMetricsResponseSchema>;

/**
 * Asset Group Row from GAQL
 */
export const GaqlAssetGroupRowSchema = z.object({
  asset_group_id: z.string(),
  asset_group_name: z.string(),
  status: z.string().optional().default("UNKNOWN"),
  final_urls: z.array(z.string()).optional(),
});

export type GaqlAssetGroupRow = z.infer<typeof GaqlAssetGroupRowSchema>;

/**
 * Backend Asset from text-assets endpoint
 */
export const BackendAssetSchema = z.object({
  resource_name: z.string(),
  field_type: z.enum(["HEADLINE", "LONG_HEADLINE", "DESCRIPTION"]),
  text: z.string(),
  status: z.string(),
});

export type BackendAsset = z.infer<typeof BackendAssetSchema>;

/**
 * Backend Asset Group with assets
 */
export const BackendAssetGroupSchema = z.object({
  asset_group_id: z.string(),
  asset_group_name: z.string(),
  assets: z.array(BackendAssetSchema).default([]),
});

export type BackendAssetGroup = z.infer<typeof BackendAssetGroupSchema>;

/**
 * Text Assets Response from backend
 */
export const TextAssetsResponseSchema = z.object({
  campaign_id: z.string(),
  campaign_name: z.string(),
  asset_groups: z.array(BackendAssetGroupSchema).default([]),
});

export type TextAssetsResponse = z.infer<typeof TextAssetsResponseSchema>;

/**
 * Campaign Detail Response from backend
 */
export const CampaignDetailResponseSchema = z.object({
  campaign_id: z.string(),
  campaign_name: z.string(),
  status: z.string(),
  bidding_strategy_type: z.string().nullable(),
  optimization_score: z.number().nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  budget_amount_micros: z.number(),
  impressions: z.number(),
  clicks: z.number(),
  cost_micros: z.number(),
  conversions: z.number(),
  conversions_value: z.number(),
  all_conversions: z.number(),
  all_conversions_value: z.number(),
  view_through_conversions: z.number(),
  interactions: z.number(),
  engagements: z.number(),
  invalid_clicks: z.number(),
  ctr: z.number(),
  average_cpc: z.number(),
  average_cpm: z.number(),
  cost_per_conversion: z.number(),
  conversion_rate: z.number(),
});

export type CampaignDetailResponse = z.infer<typeof CampaignDetailResponseSchema>;

/**
 * Helper to safely parse GAQL response with validation
 * Returns parsed data or throws with detailed error message
 */
export function parseGaqlResponse<T>(schema: z.ZodSchema<T>, data: unknown, context: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`GAQL validation failed for ${context}:`, result.error.format());
    throw new Error(`Invalid GAQL response for ${context}: ${result.error.message}`);
  }
  return result.data;
}

/**
 * Helper to safely parse with fallback (logs warning but doesn't throw)
 */
export function parseGaqlResponseSafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string,
  fallback: T,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.warn(`GAQL validation warning for ${context}:`, result.error.format());
    return fallback;
  }
  return result.data;
}
