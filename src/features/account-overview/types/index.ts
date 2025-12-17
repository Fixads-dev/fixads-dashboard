/**
 * Account Overview types - aggregated account metrics
 */

/**
 * Account overview metrics
 */
export interface AccountOverviewMetrics {
  impressions: number;
  clicks: number;
  ctr: number;
  cost_micros: number;
  conversions: number;
  conversions_value: number;
  average_cpc_micros: number;
  roas: number;
  cost_per_conversion_micros: number;
}

/**
 * Top campaign summary
 */
export interface TopCampaign {
  campaign_id: string;
  campaign_name: string;
  status: string;
  campaign_type: string;
  impressions: number;
  clicks: number;
  cost_micros: number;
  conversions: number;
  conversions_value: number;
}

/**
 * Account overview response
 */
export interface AccountOverviewResponse {
  customer_id: string;
  customer_name: string | null;
  currency_code: string | null;
  date_range: string;
  metrics: AccountOverviewMetrics;
  top_campaigns: TopCampaign[];
  campaign_type_counts: Record<string, number>;
  total_campaigns: number;
}

/**
 * Filters for fetching account overview
 */
export interface AccountOverviewFilters {
  account_id: string;
  date_range?: "LAST_7_DAYS" | "LAST_14_DAYS" | "LAST_30_DAYS" | "LAST_90_DAYS";
}

/**
 * Format cost from micros to dollars
 */
export function formatCost(micros: number, currencyCode?: string): string {
  const value = micros / 1_000_000;
  const currency = currencyCode || "USD";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format large numbers with abbreviations
 */
export function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

/**
 * Get campaign type label
 */
export function getCampaignTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    PERFORMANCE_MAX: "Performance Max",
    SEARCH: "Search",
    DISPLAY: "Display",
    SHOPPING: "Shopping",
    VIDEO: "Video",
    SMART: "Smart",
    DISCOVERY: "Discovery",
    APP: "App",
    HOTEL: "Hotel",
    LOCAL: "Local",
    LOCAL_SERVICES: "Local Services",
    UNSPECIFIED: "Unknown",
    UNKNOWN: "Unknown",
  };
  return labels[type] || type;
}
