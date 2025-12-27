/**
 * Search Terms types - matches Google Ads API search_term_view resource
 */

/**
 * Search term status
 */
export type SearchTermStatus = "NONE" | "ADDED" | "EXCLUDED" | "ADDED_EXCLUDED" | "UNSPECIFIED";

/**
 * Single search term with metrics
 */
export interface SearchTerm {
  search_term: string;
  status: SearchTermStatus;
  campaign_id: string;
  campaign_name: string;
  ad_group_id: string;
  ad_group_name: string;
  impressions: number;
  clicks: number;
  ctr: number;
  cost_micros: number;
  conversions: number;
  conversions_value: number;
}

/**
 * API response for listing search terms
 */
export interface SearchTermsResponse {
  search_terms: SearchTerm[];
  total_count: number;
}

/**
 * Filters for fetching search terms
 */
export interface SearchTermsFilters {
  account_id: string;
  campaign_id?: string;
  ad_group_id?: string;
  date_range?: "LAST_7_DAYS" | "LAST_14_DAYS" | "LAST_30_DAYS" | "LAST_90_DAYS";
  limit?: number;
}

/**
 * Get user-friendly label for search term status
 */
export function getSearchTermStatusLabel(status: SearchTermStatus): string {
  const labels: Record<SearchTermStatus, string> = {
    NONE: "Not added",
    ADDED: "Added as keyword",
    EXCLUDED: "Excluded",
    ADDED_EXCLUDED: "Added & Excluded",
    UNSPECIFIED: "Unknown",
  };
  return labels[status] || status;
}

/**
 * Get status color for UI display
 */
export function getSearchTermStatusColor(status: SearchTermStatus): string {
  const colors: Record<SearchTermStatus, string> = {
    NONE: "gray",
    ADDED: "green",
    EXCLUDED: "red",
    ADDED_EXCLUDED: "yellow",
    UNSPECIFIED: "gray",
  };
  return colors[status] || "gray";
}

// ==================== Keyword Management ====================

/**
 * Keyword match types for adding keywords
 */
export type KeywordMatchType = "EXACT" | "PHRASE" | "BROAD";

/**
 * Match type display labels
 */
export const MATCH_TYPE_LABELS: Record<KeywordMatchType, string> = {
  EXACT: "Exact match",
  PHRASE: "Phrase match",
  BROAD: "Broad match",
};

/**
 * Match type descriptions for UI
 */
export const MATCH_TYPE_DESCRIPTIONS: Record<KeywordMatchType, string> = {
  EXACT: "Ads show only for this exact search term",
  PHRASE: "Ads show for searches containing this phrase",
  BROAD: "Ads show for related searches and variations",
};

/**
 * Request to add a single keyword
 */
export interface AddKeywordRequest {
  ad_group_id: string;
  keyword_text: string;
  match_type: KeywordMatchType;
  is_negative: boolean;
}

/**
 * Response after adding a keyword
 */
export interface AddKeywordResponse {
  success: boolean;
  resource_name: string | null;
  keyword_text: string;
  match_type: string;
  is_negative: boolean;
  error_message: string | null;
}

/**
 * Bulk add keywords request
 */
export interface BulkAddKeywordsRequest {
  keywords: AddKeywordRequest[];
}

/**
 * Bulk add keywords response
 */
export interface BulkAddKeywordsResponse {
  results: AddKeywordResponse[];
  total_added: number;
  total_failed: number;
}

/**
 * Search term recommendation
 */
export interface SearchTermRecommendation {
  search_term: string;
  campaign_id: string;
  campaign_name: string;
  ad_group_id: string;
  ad_group_name: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost_micros: number;
  ctr: number;
  conversion_rate: number;
  recommended_match_type: KeywordMatchType;
  recommendation_reason: string;
}

/**
 * Search term recommendations response
 */
export interface SearchTermRecommendationsResponse {
  recommendations: SearchTermRecommendation[];
  total_count: number;
}
