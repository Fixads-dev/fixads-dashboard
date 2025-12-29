/**
 * Zod schemas for Text/Smart Optimizer API responses
 *
 * These schemas provide runtime validation for optimizer responses,
 * ensuring type safety at the API boundary.
 */

import { z } from "zod";

/**
 * Asset field types from Google Ads API
 */
export const AssetFieldTypeSchema = z.enum(["HEADLINE", "LONG_HEADLINE", "DESCRIPTION"]);

/**
 * Bad asset classification types
 */
export const BadAssetClassificationSchema = z.enum([
  "ZOMBIE",
  "MONEY_WASTER",
  "CLICKBAIT",
  "TREND_DROPPER",
]);

/**
 * Asset metrics schema (from Google Ads)
 */
export const AssetMetricsSchema = z
  .object({
    impressions: z.number().optional(),
    clicks: z.number().optional(),
    cost_micros: z.number().optional(),
    conversions: z.number().optional(),
    ctr: z.number().optional(),
    cvr: z.number().optional(),
    age_days: z.number().optional(),
  })
  .optional();

/**
 * Asset to remove schema
 */
export const AssetToRemoveSchema = z.object({
  asset_id: z.string(),
  asset_group_asset_resource_name: z.string().optional(),
  asset_type: AssetFieldTypeSchema,
  text: z.string(),
  reason_code: BadAssetClassificationSchema,
  reason_label: z.string().optional(),
  severity_score: z.number(),
  details: z.string().optional(),
  metrics: AssetMetricsSchema,
});

export type AssetToRemove = z.infer<typeof AssetToRemoveSchema>;

/**
 * Asset to add schema (from AI generation)
 */
export const AssetToAddSchema = z.object({
  asset_type: AssetFieldTypeSchema,
  text: z.string(),
  category: z.string(),
  char_count: z.number(),
  compliance_passed: z.boolean(),
  compliance_issues: z.array(z.string()).optional(),
  language: z.string().optional(),
});

export type AssetToAdd = z.infer<typeof AssetToAddSchema>;

/**
 * Text Optimizer Response schema
 */
export const TextOptimizerResponseSchema = z.object({
  optimization_run_id: z.string(),
  campaign_id: z.string(),
  campaign_name: z.string(),
  asset_group_id: z.string(),
  asset_group_name: z.string(),
  assets_to_remove: z.array(AssetToRemoveSchema),
  assets_to_add: z.array(AssetToAddSchema),
  summary: z.object({
    total_assets_analyzed: z.number(),
    bad_assets_found: z.number(),
    assets_to_remove: z.number(),
    assets_to_add: z.number(),
    compliance_passed: z.number(),
    compliance_failed: z.number(),
    bad_history_used: z.number(),
    target_cpa_micros: z.number().nullable(),
  }),
});

export type TextOptimizerResponse = z.infer<typeof TextOptimizerResponseSchema>;

/**
 * Text Optimizer Apply Response schema
 */
export const TextOptimizerApplyResponseSchema = z.object({
  optimization_run_id: z.string(),
  assets_removed: z.number(),
  assets_created: z.number(),
  bad_assets_logged: z.number(),
  errors: z.array(z.string()),
});

export type TextOptimizerApplyResponse = z.infer<typeof TextOptimizerApplyResponseSchema>;

/**
 * Generated text asset schema (from AssetGenerationService)
 */
export const GeneratedTextAssetSchema = z.object({
  asset_type: z.enum(["HEADLINE", "DESCRIPTION", "LONG_HEADLINE"]),
  text: z.string(),
  char_count: z.number(),
  compliance_passed: z.boolean(),
  compliance_issues: z.array(z.string()).optional(),
});

export type GeneratedTextAsset = z.infer<typeof GeneratedTextAssetSchema>;

/**
 * Smart Optimizer Response schema
 */
export const SmartOptimizerResponseSchema = z.object({
  optimization_run_id: z.string(),
  campaign_id: z.string(),
  campaign_name: z.string(),
  asset_group_id: z.string(),
  asset_group_name: z.string(),
  generated_assets: z.array(GeneratedTextAssetSchema),
  assets_to_remove: z.array(AssetToRemoveSchema),
  summary: z.object({
    total_assets_analyzed: z.number(),
    generated_headlines: z.number(),
    generated_descriptions: z.number(),
    bad_assets_found: z.number(),
    compliance_passed: z.number(),
    compliance_failed: z.number(),
  }),
});

export type SmartOptimizerResponse = z.infer<typeof SmartOptimizerResponseSchema>;

/**
 * Smart Optimizer Apply Response schema
 */
export const SmartOptimizerApplyResponseSchema = z.object({
  optimization_run_id: z.string(),
  assets_removed: z.number(),
  assets_created: z.number(),
  bad_assets_logged: z.number(),
  errors: z.array(z.string()),
});

export type SmartOptimizerApplyResponse = z.infer<typeof SmartOptimizerApplyResponseSchema>;

/**
 * Target CPA Response schema
 */
export const TargetCpaResponseSchema = z.object({
  id: z.string(),
  account_id: z.string(),
  campaign_id: z.string(),
  target_cpa_micros: z.number(),
  currency_code: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type TargetCpaResponse = z.infer<typeof TargetCpaResponseSchema>;

/**
 * Bad Asset History Item schema
 */
export const BadAssetHistoryItemSchema = z.object({
  id: z.string(),
  asset_id: z.string(),
  asset_type: AssetFieldTypeSchema,
  asset_text: z.string(),
  failure_reason_code: BadAssetClassificationSchema,
  snapshot_impressions: z.number().optional(),
  snapshot_clicks: z.number().optional(),
  snapshot_cost: z.number().optional(),
  snapshot_conversions: z.number().optional(),
  snapshot_ctr: z.number().optional(),
  created_at: z.string(),
});

export type BadAssetHistoryItem = z.infer<typeof BadAssetHistoryItemSchema>;

/**
 * Bad Asset History Response schema
 */
export const BadAssetHistoryResponseSchema = z.object({
  items: z.array(BadAssetHistoryItemSchema),
  total: z.number(),
});

export type BadAssetHistoryResponse = z.infer<typeof BadAssetHistoryResponseSchema>;

/**
 * Optimization Run Status schema
 */
export const OptimizationRunStatusSchema = z.enum([
  "PENDING",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
]);

export type OptimizationRunStatus = z.infer<typeof OptimizationRunStatusSchema>;

/**
 * Optimization Run Type schema
 */
export const OptimizationRunTypeSchema = z.enum(["MANUAL", "SCHEDULED", "AUTO"]);

export type OptimizationRunType = z.infer<typeof OptimizationRunTypeSchema>;

/**
 * Optimization Run schema
 */
export const OptimizationRunSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  account_id: z.string(),
  campaign_id: z.string(),
  run_type: OptimizationRunTypeSchema,
  status: OptimizationRunStatusSchema,
  assets_analyzed: z.number(),
  assets_not_good: z.number(),
  assets_suggested: z.number(),
  assets_applied: z.number(),
  started_at: z.string(),
  completed_at: z.string().optional().nullable(),
  error_message: z.string().optional().nullable(),
  created_at: z.string(),
});

export type OptimizationRun = z.infer<typeof OptimizationRunSchema>;

/**
 * Optimization Run List Response schema
 */
export const OptimizationRunListResponseSchema = z.object({
  items: z.array(OptimizationRunSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export type OptimizationRunListResponse = z.infer<typeof OptimizationRunListResponseSchema>;

/**
 * Helper to safely parse optimizer response with validation
 * Returns parsed data or throws with detailed error message
 */
export function parseOptimizerResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`Optimizer validation failed for ${context}:`, result.error.format());
    throw new Error(`Invalid optimizer response for ${context}: ${result.error.message}`);
  }
  return result.data;
}
