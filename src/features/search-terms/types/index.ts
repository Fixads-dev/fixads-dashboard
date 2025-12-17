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
