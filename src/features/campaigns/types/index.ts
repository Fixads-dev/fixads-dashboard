/**
 * Campaign types - matches API response (snake_case)
 * Based on Google Ads API v22 Campaign and Metrics resources
 */

export type CampaignStatus = "ENABLED" | "PAUSED" | "REMOVED" | "UNKNOWN";

export type BiddingStrategyType =
  | "UNSPECIFIED"
  | "UNKNOWN"
  | "COMMISSION"
  | "MANUAL_CPA"
  | "MANUAL_CPC"
  | "MANUAL_CPM"
  | "MANUAL_CPV"
  | "MAXIMIZE_CONVERSIONS"
  | "MAXIMIZE_CONVERSION_VALUE"
  | "TARGET_CPA"
  | "TARGET_IMPRESSION_SHARE"
  | "TARGET_ROAS"
  | "TARGET_SPEND"
  | "PERCENT_CPC"
  | "TARGET_CPM";

export type PrimaryStatus =
  | "UNSPECIFIED"
  | "UNKNOWN"
  | "ELIGIBLE"
  | "PAUSED"
  | "REMOVED"
  | "ENDED"
  | "PENDING"
  | "MISCONFIGURED"
  | "LIMITED"
  | "LEARNING"
  | "NOT_ELIGIBLE";

/**
 * Comprehensive campaign metrics from Google Ads API v22
 */
export interface CampaignMetrics {
  // Core performance
  impressions: number;
  clicks: number;
  cost_micros: number;
  ctr: number;
  average_cpc: number;
  average_cpm: number;

  // Conversions
  conversions: number;
  conversions_value: number;
  cost_per_conversion: number;
  conversion_rate: number;
  all_conversions: number;
  all_conversions_value: number;
  view_through_conversions: number;

  // Search impression share metrics
  search_impression_share?: number;
  search_budget_lost_impression_share?: number;
  search_rank_lost_impression_share?: number;
  search_absolute_top_impression_share?: number;
  search_top_impression_share?: number;
  content_impression_share?: number;

  // Video metrics (for video campaigns)
  video_views?: number;
  video_view_rate?: number;
  video_quartile_p25_rate?: number;
  video_quartile_p50_rate?: number;
  video_quartile_p75_rate?: number;
  video_quartile_p100_rate?: number;

  // Engagement
  engagements?: number;
  engagement_rate?: number;
  interactions: number;
  interaction_rate: number;

  // E-commerce
  orders?: number;
  revenue_micros?: number;
  average_order_value_micros?: number;
  gross_profit_micros?: number;
  gross_profit_margin?: number;

  // Page experience
  mobile_friendly_clicks_percentage?: number;
  speed_score?: number;
  bounce_rate?: number;
  average_page_views?: number;
  average_time_on_site?: number;

  // Quality
  optimization_score?: number;

  // Invalid clicks
  invalid_clicks?: number;
  invalid_click_rate?: number;
}

/**
 * Campaign settings and configuration
 */
export interface CampaignSettings {
  start_date?: string;
  end_date?: string;
  bidding_strategy_type: BiddingStrategyType;
  target_cpa_micros?: number;
  target_roas?: number;
  budget_micros?: number;
  budget_name?: string;
  budget_delivery_method?: "STANDARD" | "ACCELERATED";
}

/**
 * PMax Campaign from GET /google-ads/pmax/campaigns
 * Enhanced with comprehensive metrics for detail view
 */
export interface Campaign {
  campaign_id: string;
  campaign_name: string;
  status: CampaignStatus;
  campaign_type?: string; // advertising_channel_type: SEARCH, SHOPPING, PERFORMANCE_MAX, etc.
  primary_status?: PrimaryStatus;
  primary_status_reasons?: string[];

  // Core metrics (always returned)
  impressions: number;
  clicks: number;
  cost_micros: number;
  conversions: number;

  // Extended metrics (returned in detail view)
  ctr?: number;
  average_cpc?: number;
  conversions_value?: number;
  cost_per_conversion?: number;
  conversion_rate?: number;
  all_conversions?: number;
  view_through_conversions?: number;

  // Impression share
  search_impression_share?: number;
  search_budget_lost_impression_share?: number;
  search_rank_lost_impression_share?: number;

  // Settings
  optimization_score?: number;
  bidding_strategy_type?: BiddingStrategyType;
  target_cpa_micros?: number;
  target_roas?: number;
  budget_amount_micros?: number;
  start_date?: string;
  end_date?: string;
}

/**
 * Campaign with full metrics for detail page
 */
export interface CampaignDetail extends Campaign {
  metrics: CampaignMetrics;
  settings: CampaignSettings;
  asset_group_count?: number;
}

/**
 * Daily metrics for time series charts
 */
export interface DailyMetrics {
  date: string;
  impressions: number;
  clicks: number;
  cost_micros: number;
  conversions: number;
  ctr: number;
  average_cpc: number;
  [key: string]: string | number; // Index signature for recharts compatibility
}

/**
 * Asset group performance metrics
 */
export interface AssetGroupMetrics {
  impressions: number;
  clicks: number;
  cost_micros: number;
  conversions: number;
  conversions_value: number;
  ctr: number;
  average_cpc: number;
}

/**
 * Asset performance distribution for charts
 */
export interface AssetPerformanceDistribution {
  best: number;
  good: number;
  low: number;
  learning: number;
  pending: number;
  unspecified: number;
}

/**
 * Asset Group from GAQL query - enhanced with metrics
 */
export interface AssetGroup {
  asset_group_id: string;
  asset_group_name: string;
  status?: CampaignStatus;
  campaign_id: string;
  final_url?: string;
  final_urls?: string[];
  path1?: string;
  path2?: string;

  // Metrics (optional, included in detail view)
  metrics?: AssetGroupMetrics;

  // Asset counts
  headline_count?: number;
  long_headline_count?: number;
  description_count?: number;
  image_count?: number;

  // Performance distribution
  performance_distribution?: AssetPerformanceDistribution;
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

/**
 * Text asset metrics from Google Ads API
 */
export interface TextAssetMetrics {
  impressions?: number;
  clicks?: number;
  cost_micros?: number;
  conversions?: number;
  ctr?: number;
  // Asset-level performance percentages
  best_performance_impression_percentage?: number;
  good_performance_impression_percentage?: number;
  low_performance_impression_percentage?: number;
  learning_performance_impression_percentage?: number;
}

/**
 * Text asset from GAQL query for display - enhanced
 */
export interface TextAsset {
  asset_id: string;
  asset_group_id: string;
  asset_group_name: string;
  field_type: AssetFieldType;
  text: string;
  status: string;
  performance_label?: AssetPerformance;
  // Enhanced metrics
  metrics?: TextAssetMetrics;
  created_date?: string;
  pinned_position?: number;
}

/**
 * Text assets grouped by asset group
 */
export interface AssetGroupWithAssets {
  asset_group_id: string;
  asset_group_name: string;
  headlines: TextAsset[];
  long_headlines: TextAsset[];
  descriptions: TextAsset[];
}

// ==================== Insights Types ====================

/**
 * Placement type for PMax ads
 */
export type PlacementType =
  | "YOUTUBE_VIDEO"
  | "YOUTUBE_CHANNEL"
  | "GOOGLE_DISPLAY"
  | "GOOGLE_SEARCH"
  | "DISCOVER"
  | "GMAIL"
  | "MAPS"
  | "OTHER";

/**
 * Placement data from performance_max_placement_view
 */
export interface Placement {
  placement: string;
  placement_type: PlacementType;
  display_name: string;
  impressions: number;
  clicks: number;
  cost_micros: number;
  conversions?: number;
  ctr?: number;
}

export interface PlacementsResponse {
  placements: Placement[];
  total_count: number;
}

/**
 * Top asset combination from asset_group_top_combination_view
 */
export interface TopCombination {
  rank: number;
  assets: {
    field_type: AssetFieldType;
    text: string;
    asset_id: string;
  }[];
  impressions: number;
  clicks: number;
  conversions?: number;
}

export interface TopCombinationsResponse {
  combinations: TopCombination[];
  asset_group_id: string;
  asset_group_name: string;
}

/**
 * Performance segmented by device or network
 */
export type SegmentType = "device" | "network";
export type DeviceType = "MOBILE" | "DESKTOP" | "TABLET" | "CONNECTED_TV" | "OTHER";
export type NetworkType = "SEARCH" | "DISPLAY" | "YOUTUBE_WATCH" | "YOUTUBE_SEARCH" | "MIXED" | "CROSS_NETWORK";

export interface SegmentedPerformance {
  segment: string;
  segment_type: SegmentType;
  impressions: number;
  clicks: number;
  cost_micros: number;
  conversions: number;
  ctr: number;
  average_cpc: number;
}

export interface SegmentedPerformanceResponse {
  segments: SegmentedPerformance[];
  segment_type: SegmentType;
}

// ==================== Asset Group Signals Types ====================

export type SignalType = "AUDIENCE" | "SEARCH_THEME";

export interface AssetGroupSignal {
  signal_id: string;
  signal_type: SignalType;
  // For audience signals
  audience_id?: string;
  audience_name?: string;
  // For search theme signals
  search_theme?: string;
}

export interface SignalsResponse {
  signals: AssetGroupSignal[];
  asset_group_id: string;
}

export interface AddSignalRequest {
  signal_type: SignalType;
  audience_id?: string;
  search_theme?: string;
}

// ==================== Shopping/Products Types ====================

export interface ProductPerformance {
  product_id: string;
  product_title: string;
  product_brand?: string;
  product_category?: string;
  impressions: number;
  clicks: number;
  cost_micros: number;
  conversions: number;
  conversions_value: number;
}

export interface ProductsResponse {
  products: ProductPerformance[];
  total_count: number;
}

export interface ProductGroup {
  product_group_id: string;
  listing_group_filter: string;
  status: string;
  impressions: number;
  clicks: number;
  conversions: number;
}

export interface ProductGroupsResponse {
  product_groups: ProductGroup[];
}

// ==================== Campaign Simulations Types ====================

export interface SimulationPoint {
  value: number; // Budget or CPA/ROAS value
  impressions: number;
  clicks: number;
  cost_micros: number;
  conversions: number;
}

export type SimulationType = "BUDGET" | "TARGET_CPA" | "TARGET_ROAS";

export interface CampaignSimulation {
  simulation_type: SimulationType;
  start_date: string;
  end_date: string;
  points: SimulationPoint[];
}

export interface SimulationsResponse {
  simulations: CampaignSimulation[];
  campaign_id: string;
}

// ==================== Audiences Types ====================

export type AudienceType = "CUSTOM" | "COMBINED" | "IN_MARKET" | "AFFINITY" | "REMARKETING" | "SIMILAR";

export interface Audience {
  audience_id: string;
  audience_name: string;
  audience_type: AudienceType;
  description?: string;
  member_count?: number;
  status: string;
}

export interface AudiencesResponse {
  audiences: Audience[];
  total_count: number;
}

export interface UserList {
  user_list_id: string;
  name: string;
  description?: string;
  membership_status: string;
  size_for_display?: number;
  size_for_search?: number;
  eligible_for_display: boolean;
  eligible_for_search: boolean;
}

export interface UserListsResponse {
  user_lists: UserList[];
  total_count: number;
}

export interface CombinedAudience {
  combined_audience_id: string;
  name: string;
  description?: string;
  status: string;
}
