/**
 * Change History types - matches Google Ads API change_event resource
 */

/**
 * Resource type that was changed
 */
export type ChangeResourceType =
  | "CAMPAIGN"
  | "AD_GROUP"
  | "AD"
  | "CRITERION"
  | "FEED"
  | "FEED_ITEM"
  | "CAMPAIGN_BUDGET"
  | "ASSET"
  | "ASSET_GROUP"
  | "ASSET_GROUP_ASSET"
  | "UNSPECIFIED"
  | "UNKNOWN";

/**
 * Operation type
 */
export type ChangeOperation = "CREATE" | "UPDATE" | "REMOVE" | "UNSPECIFIED" | "UNKNOWN";

/**
 * Client type that made the change
 */
export type ClientType =
  | "GOOGLE_ADS_WEB_CLIENT"
  | "GOOGLE_ADS_API"
  | "GOOGLE_ADS_AUTOMATED_RULE"
  | "GOOGLE_ADS_SCRIPTS"
  | "GOOGLE_ADS_BULK_UPLOAD"
  | "OTHER"
  | "UNSPECIFIED"
  | "UNKNOWN";

/**
 * Single change event
 */
export interface ChangeEvent {
  resource_name: string;
  change_date_time: string;
  change_resource_type: ChangeResourceType;
  change_resource_name: string;
  user_email: string | null;
  client_type: ClientType;
  operation: ChangeOperation;
}

/**
 * API response for listing change history
 */
export interface ChangeHistoryResponse {
  changes: ChangeEvent[];
  total_count: number;
}

/**
 * Filters for fetching change history
 */
export interface ChangeHistoryFilters {
  account_id: string;
  start_date?: string;
  end_date?: string;
  resource_type?: ChangeResourceType;
  limit?: number;
}

/**
 * Get user-friendly label for resource type
 */
export function getResourceTypeLabel(type: ChangeResourceType): string {
  const labels: Record<ChangeResourceType, string> = {
    CAMPAIGN: "Campaign",
    AD_GROUP: "Ad Group",
    AD: "Ad",
    CRITERION: "Keyword/Targeting",
    FEED: "Feed",
    FEED_ITEM: "Feed Item",
    CAMPAIGN_BUDGET: "Budget",
    ASSET: "Asset",
    ASSET_GROUP: "Asset Group",
    ASSET_GROUP_ASSET: "Asset Group Asset",
    UNSPECIFIED: "Unknown",
    UNKNOWN: "Unknown",
  };
  return labels[type] || type;
}

/**
 * Get user-friendly label for operation
 */
export function getOperationLabel(operation: ChangeOperation): string {
  const labels: Record<ChangeOperation, string> = {
    CREATE: "Created",
    UPDATE: "Updated",
    REMOVE: "Removed",
    UNSPECIFIED: "Unknown",
    UNKNOWN: "Unknown",
  };
  return labels[operation] || operation;
}

/**
 * Get user-friendly label for client type
 */
export function getClientTypeLabel(clientType: ClientType): string {
  const labels: Record<ClientType, string> = {
    GOOGLE_ADS_WEB_CLIENT: "Google Ads UI",
    GOOGLE_ADS_API: "API",
    GOOGLE_ADS_AUTOMATED_RULE: "Automated Rule",
    GOOGLE_ADS_SCRIPTS: "Scripts",
    GOOGLE_ADS_BULK_UPLOAD: "Bulk Upload",
    OTHER: "Other",
    UNSPECIFIED: "Unknown",
    UNKNOWN: "Unknown",
  };
  return labels[clientType] || clientType;
}

/**
 * Get operation badge variant
 */
export function getOperationVariant(
  operation: ChangeOperation,
): "default" | "secondary" | "destructive" {
  const variants: Record<ChangeOperation, "default" | "secondary" | "destructive"> = {
    CREATE: "default",
    UPDATE: "secondary",
    REMOVE: "destructive",
    UNSPECIFIED: "secondary",
    UNKNOWN: "secondary",
  };
  return variants[operation] || "secondary";
}
