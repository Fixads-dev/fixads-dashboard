/**
 * Application constants
 */

export const APP_NAME = "Fixads Dashboard";
export const APP_DESCRIPTION = "Optimize your Google Ads Performance Max campaigns with AI";

/**
 * API endpoints base paths
 */
export const API_PATHS = {
  AUTH: "/auth/v1",
  GOOGLE_ADS: "/google-ads",
  OPTIMIZER: "/optimization/v1",
} as const;

/**
 * Route paths
 */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  CALLBACK: "/callback",
  ACCOUNTS: "/accounts",
  CAMPAIGNS: "/campaigns",
  RECOMMENDATIONS: "/recommendations",
  SEARCH_TERMS: "/search-terms",
  CHANGE_HISTORY: "/change-history",
  CONVERSIONS: "/conversions",
  OPTIMIZER_TEXT: "/optimizer/text",
  OPTIMIZER_SMART: "/optimizer/smart",
  SETTINGS: "/settings",
} as const;

/**
 * Query keys for TanStack Query
 */
export const QUERY_KEYS = {
  USER: ["user"] as const,
  ACCOUNTS: ["accounts"] as const,
  ACCOUNT: (id: string) => ["account", id] as const,
  CAMPAIGNS: (accountId: string) => ["campaigns", accountId] as const,
  CAMPAIGN: (accountId: string, campaignId: string) => ["campaign", accountId, campaignId] as const,
  ASSET_GROUPS: (campaignId: string) => ["asset-groups", campaignId] as const,
  TEXT_ASSETS: (campaignId: string) => ["text-assets", campaignId] as const,
  OPTIMIZATION_STATUS: (runId: string) => ["optimization-status", runId] as const,
  BAD_ASSET_HISTORY: (accountId: string) => ["bad-asset-history", accountId] as const,
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  AUTH: "fixads-auth",
  THEME: "fixads-theme",
  SIDEBAR_STATE: "fixads-sidebar",
} as const;

/**
 * Polling intervals (in milliseconds)
 */
export const POLLING_INTERVALS = {
  OPTIMIZATION_STATUS: 2000,
  CAMPAIGN_REFRESH: 30000,
} as const;
