/**
 * Experimentation Service Types (Thompson Sampling / Multi-Armed Bandit)
 * For asset selection optimization using Bayesian probability
 */

/**
 * MAB State Status - indicates the learning phase of an asset
 */
export type MABStateStatus = "LEARNING" | "STABLE" | "DECAYED" | "PAUSED";

/**
 * Prior Source - where the initial belief state comes from
 */
export type PriorSource = "DEFAULT" | "INDUSTRY" | "HISTORICAL";

/**
 * Platform type for multi-platform support
 */
export type PlatformType = "GOOGLE_ADS" | "FACEBOOK_ADS" | "MICROSOFT_ADS";

/**
 * MAB State - Thompson Sampling belief state for an asset
 * Beta distribution: theta ~ Beta(alpha, beta)
 */
export interface MABState {
  id: string;
  asset_id: string;
  campaign_id: string;
  asset_group_id: string | null;
  account_id: string;
  platform: PlatformType;

  // Beta distribution parameters
  alpha: number;
  beta: number;

  // Computed values
  expected_value: number | null; // alpha / (alpha + beta)
  win_probability?: number; // Same as expected_value, for display

  // Metrics
  total_trials: number;
  total_successes: number;

  // Status
  status: MABStateStatus;
  prior_source: PriorSource;

  // Timestamps
  created_at: string;
  last_updated_at: string;
}

/**
 * Response for listing MAB states
 */
export interface MABStateListResponse {
  items: MABState[];
  total: number;
  platform?: string | null;
  campaign_id?: string | null;
}

/**
 * Request to create a new MAB state
 */
export interface MABStateCreateRequest {
  asset_id: string;
  campaign_id: string;
  asset_group_id?: string;
  account_id: string;
  platform?: PlatformType;
  industry_code?: string;
}

/**
 * Belief update event - audit trail for state changes
 */
export interface BeliefEvent {
  id: string;
  event_type: "INITIALIZED" | "SUCCESS" | "FAILURE" | "BATCH_UPDATE" | "MANUAL_ADJUSTMENT";
  delta_alpha: number;
  delta_beta: number;
  alpha_after: number;
  beta_after: number;
  source?: string;
  correlation_id?: string;
  created_at: string;
}

/**
 * Response for belief history
 */
export interface BeliefHistoryResponse {
  asset_id: string;
  events: BeliefEvent[];
  total_events: number;
}

/**
 * Request to update belief state
 */
export interface BeliefUpdateRequest {
  asset_id: string;
  platform?: PlatformType;
  conversions: number;
  clicks: number;
  source?: string;
  correlation_id?: string;
}

/**
 * Response from belief update endpoint
 * Note: Different from MABState - this is a minimal response
 */
export interface BeliefUpdateResponse {
  asset_id: string;
  alpha: number;
  beta: number;
  expected_value: number;
  total_trials: number;
  status: MABStateStatus;
}

/**
 * Selection request for Thompson Sampling
 */
export interface SelectionRequest {
  campaign_id: string;
  asset_group_id?: string;
  platform?: PlatformType;
  k?: number; // Number of assets to select
  strategy?: "thompson_sampling" | "epsilon_greedy" | "ucb";
}

/**
 * Selection response with ranked assets
 */
export interface SelectionResponse {
  selected_asset_ids: string[];
  scores: Record<string, number>;
  strategy_name: string;
  total_candidates: number;
  eligible_candidates: number;
  metadata?: Record<string, unknown>;
}

/**
 * Industry prior - benchmark data for hierarchical Bayesian initialization
 */
export interface IndustryPrior {
  id: string;
  industry_code: string;
  industry_name: string;
  platform?: string | null;
  asset_field_type?: string | null;
  benchmark_ctr: number;
  benchmark_cvr: number;
  prior_alpha: number;
  prior_beta: number;
  prior_strength: number;
}

/**
 * Response for listing industry priors
 */
export interface IndustryPriorListResponse {
  items: IndustryPrior[];
  total: number;
}

/**
 * Campaign probabilities - win probabilities for all assets in a campaign
 * Note: Uses mature_clicks/mature_conversions from backend for attribution lag handling
 */
export interface AssetProbability {
  asset_id: string;
  win_probability: number;
  alpha: number;
  beta: number;
  status: MABStateStatus;
  prior_context: string;
  prior_source: PriorSource;
  /** Clicks past the attribution window (used for Thompson Sampling) */
  mature_clicks: number;
  /** Conversions from mature clicks */
  mature_conversions: number;
  z_score?: number | null;
  decay_reason?: string | null;
}

export interface CampaignProbabilitiesResponse {
  campaign_id: string;
  platform: string;
  total_assets: number;
  assets: AssetProbability[];
}

/**
 * Pending optimization request - assets awaiting replacement
 */
export interface PendingOptimizationRequest {
  asset_id: string;
  campaign_id: string;
  reason: string;
  requested_at: string;
}

export interface PendingOptimizationResponse {
  campaign_id: string;
  pending_count: number;
  requests: PendingOptimizationRequest[];
}
