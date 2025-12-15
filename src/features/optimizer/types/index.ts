import type { AssetType } from "@/features/campaigns";

/**
 * Text Optimizer Types
 */
export interface TextOptimizerRequest {
  accountId: string;
  campaignId: string;
  assetGroupId: string;
}

export interface TextSuggestion {
  id: string;
  assetId: string;
  originalText: string;
  suggestedText: string;
  assetType: AssetType;
  improvementType: "clarity" | "engagement" | "keywords" | "compliance";
  confidenceScore: number;
  reason: string;
}

export interface TextOptimizerResponse {
  runId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  suggestions: TextSuggestion[];
  message?: string;
}

/**
 * Smart Optimizer Types (MVP v2.1)
 */
export type BadAssetClassification = "ZOMBIE" | "MONEY_WASTER" | "CLICKBAIT" | "TREND_DROPPER";

export interface BadAssetMetrics {
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  age: number;
  ctr?: number;
  cvr?: number;
}

export interface BadAsset {
  id: string;
  assetId: string;
  text: string;
  assetType: AssetType;
  classification: BadAssetClassification;
  reason: string;
  metrics: BadAssetMetrics;
  suggestedReplacement?: string;
}

export interface SmartOptimizerRequest {
  accountId: string;
  campaignId: string;
  assetGroupId: string;
  targetCpa?: number;
}

export interface SmartOptimizerResponse {
  runId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  badAssets: BadAsset[];
  totalAnalyzed: number;
  message?: string;
}

/**
 * Compliance Check Types
 */
export interface ComplianceViolation {
  rule: string;
  message: string;
  position?: number;
}

export interface ComplianceCheckRequest {
  text: string;
  assetType: AssetType;
}

export interface ComplianceCheckResponse {
  isCompliant: boolean;
  violations: ComplianceViolation[];
}

/**
 * Apply Changes Types
 */
export interface ApplyChangesRequest {
  accountId: string;
  campaignId: string;
  assetGroupId: string;
  changes: Array<{
    assetId: string;
    newText: string;
  }>;
}

export interface ApplyChangesResponse {
  success: boolean;
  assetsModified: number;
  errors: Array<{
    assetId: string;
    error: string;
  }>;
}

/**
 * Bad Asset History Types
 */
export interface BadAssetHistoryItem {
  id: string;
  assetId: string;
  text: string;
  classification: BadAssetClassification;
  metrics: BadAssetMetrics;
  deletedAt: string;
  accountId: string;
  campaignId: string;
}
