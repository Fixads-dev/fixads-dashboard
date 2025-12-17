/**
 * Conversion Actions types - matches Google Ads API conversion_action resource
 */

/**
 * Conversion action type
 */
export type ConversionActionType =
  | "WEBPAGE"
  | "CLICK_TO_CALL"
  | "UPLOAD"
  | "UPLOAD_CALLS"
  | "GOOGLE_PLAY_DOWNLOAD"
  | "GOOGLE_PLAY_IN_APP_PURCHASE"
  | "FIREBASE_ANDROID_FIRST_OPEN"
  | "FIREBASE_ANDROID_IN_APP_PURCHASE"
  | "FIREBASE_IOS_FIRST_OPEN"
  | "FIREBASE_IOS_IN_APP_PURCHASE"
  | "STORE_SALES"
  | "STORE_VISITS"
  | "AD_CALL"
  | "WEBSITE_CALL"
  | "UNSPECIFIED"
  | "UNKNOWN";

/**
 * Conversion action status
 */
export type ConversionActionStatus = "ENABLED" | "PAUSED" | "HIDDEN" | "REMOVED" | "UNSPECIFIED";

/**
 * Conversion action category
 */
export type ConversionActionCategory =
  | "DEFAULT"
  | "PAGE_VIEW"
  | "PURCHASE"
  | "SIGNUP"
  | "LEAD"
  | "DOWNLOAD"
  | "ADD_TO_CART"
  | "BEGIN_CHECKOUT"
  | "SUBSCRIBE_PAID"
  | "PHONE_CALL_LEAD"
  | "IMPORTED_LEAD"
  | "SUBMIT_LEAD_FORM"
  | "BOOK_APPOINTMENT"
  | "REQUEST_QUOTE"
  | "GET_DIRECTIONS"
  | "OUTBOUND_CLICK"
  | "CONTACT"
  | "ENGAGEMENT"
  | "STORE_VISIT"
  | "STORE_SALE"
  | "QUALIFIED_LEAD"
  | "CONVERTED_LEAD"
  | "UNSPECIFIED"
  | "UNKNOWN";

/**
 * Conversion counting type
 */
export type ConversionCountingType = "ONE_PER_CLICK" | "MANY_PER_CLICK" | "UNSPECIFIED";

/**
 * Attribution model
 */
export type AttributionModel =
  | "EXTERNAL"
  | "GOOGLE_ADS_LAST_CLICK"
  | "GOOGLE_SEARCH_ATTRIBUTION_FIRST_CLICK"
  | "GOOGLE_SEARCH_ATTRIBUTION_LINEAR"
  | "GOOGLE_SEARCH_ATTRIBUTION_TIME_DECAY"
  | "GOOGLE_SEARCH_ATTRIBUTION_POSITION_BASED"
  | "GOOGLE_SEARCH_ATTRIBUTION_DATA_DRIVEN"
  | "UNSPECIFIED"
  | "UNKNOWN";

/**
 * Single conversion action
 */
export interface ConversionAction {
  conversion_action_id: string;
  name: string;
  type: ConversionActionType;
  status: ConversionActionStatus;
  category: ConversionActionCategory;
  primary_for_goal: boolean;
  counting_type: ConversionCountingType;
  default_value: number | null;
  always_use_default_value: boolean;
  attribution_model: AttributionModel | null;
}

/**
 * API response for listing conversion actions
 */
export interface ConversionActionsResponse {
  conversion_actions: ConversionAction[];
  total_count: number;
}

/**
 * Filters for fetching conversion actions
 */
export interface ConversionActionsFilters {
  account_id: string;
}

/**
 * Get user-friendly label for conversion type
 */
export function getConversionTypeLabel(type: ConversionActionType): string {
  const labels: Record<ConversionActionType, string> = {
    WEBPAGE: "Website",
    CLICK_TO_CALL: "Click to Call",
    UPLOAD: "Imported",
    UPLOAD_CALLS: "Call Import",
    GOOGLE_PLAY_DOWNLOAD: "App Download",
    GOOGLE_PLAY_IN_APP_PURCHASE: "In-App Purchase",
    FIREBASE_ANDROID_FIRST_OPEN: "Android App Open",
    FIREBASE_ANDROID_IN_APP_PURCHASE: "Android Purchase",
    FIREBASE_IOS_FIRST_OPEN: "iOS App Open",
    FIREBASE_IOS_IN_APP_PURCHASE: "iOS Purchase",
    STORE_SALES: "Store Sales",
    STORE_VISITS: "Store Visits",
    AD_CALL: "Call from Ad",
    WEBSITE_CALL: "Call from Website",
    UNSPECIFIED: "Unknown",
    UNKNOWN: "Unknown",
  };
  return labels[type] || type;
}

/**
 * Get user-friendly label for category
 */
export function getCategoryLabel(category: ConversionActionCategory): string {
  const labels: Record<ConversionActionCategory, string> = {
    DEFAULT: "Default",
    PAGE_VIEW: "Page View",
    PURCHASE: "Purchase",
    SIGNUP: "Sign Up",
    LEAD: "Lead",
    DOWNLOAD: "Download",
    ADD_TO_CART: "Add to Cart",
    BEGIN_CHECKOUT: "Begin Checkout",
    SUBSCRIBE_PAID: "Subscription",
    PHONE_CALL_LEAD: "Phone Lead",
    IMPORTED_LEAD: "Imported Lead",
    SUBMIT_LEAD_FORM: "Form Submit",
    BOOK_APPOINTMENT: "Appointment",
    REQUEST_QUOTE: "Quote Request",
    GET_DIRECTIONS: "Directions",
    OUTBOUND_CLICK: "Outbound Click",
    CONTACT: "Contact",
    ENGAGEMENT: "Engagement",
    STORE_VISIT: "Store Visit",
    STORE_SALE: "Store Sale",
    QUALIFIED_LEAD: "Qualified Lead",
    CONVERTED_LEAD: "Converted Lead",
    UNSPECIFIED: "Unknown",
    UNKNOWN: "Unknown",
  };
  return labels[category] || category;
}

/**
 * Get status badge variant
 */
export function getStatusVariant(
  status: ConversionActionStatus,
): "default" | "secondary" | "destructive" | "outline" {
  const variants: Record<
    ConversionActionStatus,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    ENABLED: "default",
    PAUSED: "secondary",
    HIDDEN: "outline",
    REMOVED: "destructive",
    UNSPECIFIED: "outline",
  };
  return variants[status] || "outline";
}

/**
 * Get attribution model label
 */
export function getAttributionModelLabel(model: AttributionModel | null): string {
  if (!model) return "Not set";

  const labels: Record<AttributionModel, string> = {
    EXTERNAL: "External",
    GOOGLE_ADS_LAST_CLICK: "Last Click",
    GOOGLE_SEARCH_ATTRIBUTION_FIRST_CLICK: "First Click",
    GOOGLE_SEARCH_ATTRIBUTION_LINEAR: "Linear",
    GOOGLE_SEARCH_ATTRIBUTION_TIME_DECAY: "Time Decay",
    GOOGLE_SEARCH_ATTRIBUTION_POSITION_BASED: "Position Based",
    GOOGLE_SEARCH_ATTRIBUTION_DATA_DRIVEN: "Data-Driven",
    UNSPECIFIED: "Unknown",
    UNKNOWN: "Unknown",
  };
  return labels[model] || model;
}
