import type { AssetFieldType } from "@/features/campaigns";

/**
 * Text Optimizer Types (Bad Asset Detection + AI Replacement)
 * Renamed from Smart Optimizer
 */
export type BadAssetClassification = "ZOMBIE" | "MONEY_WASTER" | "CLICKBAIT" | "TREND_DROPPER";

export interface AssetToRemove {
  asset_id: string;
  asset_group_asset_resource_name?: string; // Used for pausing via Google Ads API
  asset_type: AssetFieldType;
  text: string;
  reason_code: BadAssetClassification;
  reason_label?: string;
  severity_score: number;
  details?: string;
  metrics?: {
    impressions?: number;
    clicks?: number;
    cost_micros?: number;
    conversions?: number;
    ctr?: number;
    cvr?: number;
    age_days?: number;
  };
}

export interface AssetToAdd {
  asset_type: AssetFieldType;
  text: string;
  category: string; // Strategy category used (e.g., 'Scarcity (Specific)')
  char_count: number;
  compliance_passed: boolean;
  compliance_issues?: string[]; // Backend uses compliance_issues not compliance_violations
  language?: string; // ISO 639-1 code of the generated asset
}

export interface TextOptimizerRequest {
  campaign_id: string;
  asset_group_id: string;
  product_description: string;
  brand_name?: string;
  target_audience?: string;
  tone?: "professional" | "casual" | "persuasive";
  max_replacements?: number;
  languages?: string[]; // ISO 639-1 codes: en, de, he, ru
}

export interface TextOptimizerResponse {
  optimization_run_id: string;
  campaign_id: string;
  campaign_name: string;
  asset_group_id: string;
  asset_group_name: string;
  assets_to_remove: AssetToRemove[];
  assets_to_add: AssetToAdd[];
  summary: {
    total_assets_analyzed: number;
    bad_assets_found: number;
    assets_to_remove: number;
    assets_to_add: number;
    compliance_passed: number;
    compliance_failed: number;
    bad_history_used: number;
    target_cpa_micros: number | null;
  };
}

export interface TextOptimizerApplyRequest {
  optimization_run_id: string;
  campaign_id: string;
  asset_group_id: string;
  asset_ids_to_remove: string[];
  assets_to_add: AssetToAdd[];
}

export interface TextOptimizerApplyResponse {
  optimization_run_id: string;
  assets_removed: number;
  assets_created: number;
  bad_assets_logged: number;
  errors: string[];
}

/**
 * NEW Smart Optimizer Types (Google Ads API v22 AssetGenerationService)
 * Uses GenerateText method to generate assets from landing page URL
 */
export interface SmartOptimizerRequest {
  campaign_id: string;
  asset_group_id: string;
  final_url: string; // Landing page URL for AI to crawl
  asset_field_types?: string[]; // Types to generate: HEADLINE, DESCRIPTION, LONG_HEADLINE
  freeform_prompt?: string; // Optional custom instructions for AI (1-1500 chars)
  keywords?: string[]; // Optional keywords to incorporate
  max_replacements?: number; // Max bad assets to flag for removal
}

export interface GeneratedTextAsset {
  asset_type: "HEADLINE" | "DESCRIPTION" | "LONG_HEADLINE";
  text: string;
  char_count: number;
  compliance_passed: boolean;
  compliance_issues?: string[];
}

export interface SmartOptimizerResponse {
  optimization_run_id: string;
  campaign_id: string;
  campaign_name: string;
  asset_group_id: string;
  asset_group_name: string;
  generated_assets: GeneratedTextAsset[]; // From AssetGenerationService.GenerateText
  assets_to_remove: AssetToRemove[]; // Bad asset detection (reused logic)
  summary: {
    total_assets_analyzed: number;
    generated_headlines: number;
    generated_descriptions: number;
    bad_assets_found: number;
    compliance_passed: number;
    compliance_failed: number;
  };
}

export interface SmartOptimizerApplyRequest {
  optimization_run_id: string;
  campaign_id: string;
  asset_group_id: string;
  asset_ids_to_remove: string[];
  assets_to_add: GeneratedTextAsset[];
}

export interface SmartOptimizerApplyResponse {
  optimization_run_id: string;
  assets_removed: number;
  assets_created: number;
  bad_assets_logged: number;
  errors: string[];
}

/**
 * Target CPA Types
 */
export interface TargetCpaRequest {
  target_cpa_micros: number;
  currency_code: string;
}

export interface TargetCpaResponse {
  id: string;
  account_id: string;
  campaign_id: string;
  target_cpa_micros: number;
  currency_code: string;
  created_at: string;
  updated_at: string;
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
