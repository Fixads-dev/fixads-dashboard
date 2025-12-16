import type { Asset, AssetFieldType, SuggestedAsset } from "@/features/campaigns";

/**
 * Text Optimizer Types - matches API (snake_case)
 */
export interface TextOptimizerRequest {
  campaign_id: string;
  campaign_description: string;
  asset_group_descriptions?: Record<string, string>;
}

/**
 * Asset group result from text optimizer analysis
 */
export interface AnalyzedAssetGroup {
  asset_group_id: string;
  asset_group_name: string;
  existing_assets: Asset[];
  suggested_assets: SuggestedAsset[];
  issues: string[];
}

export interface TextOptimizerResponse {
  campaign_id: string;
  campaign_name: string;
  description_text: string;
  asset_groups: AnalyzedAssetGroup[];
}

/**
 * Text Optimizer Apply Request
 */
export interface TextOptimizerApplyRequest {
  campaign_id: string;
  asset_groups: Array<{
    asset_group_id: string;
    asset_group_name?: string;
    suggested_assets: Array<{
      field_type: AssetFieldType;
      text: string;
      reason?: string;
    }>;
  }>;
  assets_to_pause?: Array<{
    asset_group_asset_resource_name: string;
    type: string;
    text: string;
  }>;
}

export interface TextOptimizerApplyResponse {
  assets_created: number;
  assets_paused: number;
  errors: string[];
}

/**
 * Smart Optimizer Types (MVP v2.1)
 */
export type BadAssetClassification = "ZOMBIE" | "MONEY_WASTER" | "CLICKBAIT" | "TREND_DROPPER";

export interface AssetToRemove {
  asset_id: string;
  asset_type: AssetFieldType;
  text: string;
  reason_code: BadAssetClassification;
  severity_score: number;
  metrics?: {
    impressions: number;
    clicks: number;
    cost: number;
    conversions: number;
  };
}

export interface AssetToAdd {
  asset_type: AssetFieldType;
  text: string;
  compliance_passed: boolean;
  compliance_violations?: string[];
}

export interface SmartOptimizerRequest {
  campaign_id: string;
  asset_group_id: string;
  product_description: string;
  brand_name?: string;
  target_audience?: string;
  tone?: "professional" | "casual" | "persuasive";
  max_replacements?: number;
}

export interface SmartOptimizerResponse {
  optimization_run_id: string;
  campaign_id: string;
  campaign_name: string;
  asset_group_id: string;
  asset_group_name: string;
  assets_to_remove: AssetToRemove[];
  assets_to_add: AssetToAdd[];
  summary: {
    total_analyzed: number;
    zombies_found: number;
    money_wasters_found: number;
    clickbait_found: number;
    trend_droppers_found: number;
    suggestions_generated: number;
    compliant_suggestions: number;
  };
}

export interface SmartOptimizerApplyRequest {
  optimization_run_id: string;
  campaign_id: string;
  asset_group_id: string;
  asset_ids_to_remove: string[];
  assets_to_add: AssetToAdd[];
}

export interface SmartOptimizerApplyResponse {
  assets_removed: number;
  assets_created: number;
  bad_assets_logged: number;
  errors: string[];
}

/**
 * Compliance Check Types
 */
export interface ComplianceCheckRequest {
  text: string;
  asset_type: AssetFieldType;
}

export interface ComplianceCheckResponse {
  is_compliant: boolean;
  violations: string[];
}

/**
 * Target CPA Types
 */
export interface TargetCpaRequest {
  target_cpa_micros: number;
  currency_code: string;
}

export interface TargetCpaResponse {
  campaign_id: string;
  target_cpa_micros: number;
  currency_code: string;
}

/**
 * Bad Asset History Types
 */
export interface BadAssetHistoryItem {
  id: string;
  asset_id: string;
  asset_type: AssetFieldType;
  asset_text: string;
  failure_reason_code: BadAssetClassification;
  snapshot_impressions?: number;
  snapshot_clicks?: number;
  snapshot_cost?: number;
  snapshot_conversions?: number;
  snapshot_ctr?: number;
  created_at: string;
}

export interface BadAssetHistoryResponse {
  items: BadAssetHistoryItem[];
  total: number;
}

// Legacy types for backwards compatibility
export type ApplyChangesRequest = TextOptimizerApplyRequest | SmartOptimizerApplyRequest;
export type ApplyChangesResponse = TextOptimizerApplyResponse | SmartOptimizerApplyResponse;

/**
 * Legacy BadAsset type for BadAssetCard component
 */
export interface BadAsset {
  id: string;
  assetId: string;
  assetType: AssetFieldType;
  text: string;
  classification: BadAssetClassification;
  reason: string;
  suggestedReplacement?: string;
  metrics: {
    impressions: number;
    clicks: number;
    cost: number;
    age: number;
  };
}

/**
 * Legacy TextSuggestion type for SuggestionCard component
 */
export interface TextSuggestion {
  id: string;
  assetId: string;
  assetType: AssetFieldType;
  originalText: string;
  suggestedText: string;
  reason: string;
  improvementType: "clarity" | "engagement" | "keywords" | "compliance";
  confidenceScore: number;
}
