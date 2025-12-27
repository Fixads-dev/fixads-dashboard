// Alert System Types

// Enums matching backend
export type AlertType =
  | "BUDGET_THRESHOLD"
  | "PERFORMANCE_DROP"
  | "CPA_SPIKE"
  | "OPTIMIZATION_SCORE_DROP"
  | "CAMPAIGN_PAUSED"
  | "ASSET_PERFORMANCE"
  | "AUCTION_POSITION"
  | "CONVERSION_TRACKING"
  | "CUSTOM";

export type AlertMetric =
  | "cost"
  | "ctr"
  | "conversions"
  | "cpa"
  | "impressions"
  | "clicks"
  | "conversion_rate"
  | "impression_share"
  | "optimization_score"
  | "budget_utilization";

export type AlertOperator = "gt" | "lt" | "eq" | "gte" | "lte" | "change_pct";

export type AlertHistoryStatus = "PENDING" | "SENT" | "ACKNOWLEDGED" | "DISMISSED";

export type DigestFrequency = "IMMEDIATE" | "HOURLY" | "DAILY";

export type NotificationChannel = "email" | "webhook" | "in_app";

// Human-readable labels
export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  BUDGET_THRESHOLD: "Budget Threshold",
  PERFORMANCE_DROP: "Performance Drop",
  CPA_SPIKE: "CPA Spike",
  OPTIMIZATION_SCORE_DROP: "Optimization Score Drop",
  CAMPAIGN_PAUSED: "Campaign Paused",
  ASSET_PERFORMANCE: "Asset Performance",
  AUCTION_POSITION: "Auction Position",
  CONVERSION_TRACKING: "Conversion Tracking",
  CUSTOM: "Custom",
};

export const ALERT_METRIC_LABELS: Record<AlertMetric, string> = {
  cost: "Cost",
  ctr: "CTR",
  conversions: "Conversions",
  cpa: "CPA",
  impressions: "Impressions",
  clicks: "Clicks",
  conversion_rate: "Conversion Rate",
  impression_share: "Impression Share",
  optimization_score: "Optimization Score",
  budget_utilization: "Budget Utilization",
};

export const ALERT_OPERATOR_LABELS: Record<AlertOperator, string> = {
  gt: "Greater than",
  lt: "Less than",
  eq: "Equal to",
  gte: "Greater than or equal",
  lte: "Less than or equal",
  change_pct: "Changes by %",
};

export const DIGEST_FREQUENCY_LABELS: Record<DigestFrequency, string> = {
  IMMEDIATE: "Immediate",
  HOURLY: "Hourly Digest",
  DAILY: "Daily Digest",
};

// Request/Response interfaces

export interface AlertRule {
  id: string;
  user_id: string;
  account_id: string | null;
  campaign_id: string | null;
  name: string;
  alert_type: AlertType;
  metric: AlertMetric;
  operator: AlertOperator;
  threshold: number;
  is_enabled: boolean;
  notification_channels: NotificationChannel[] | null;
  webhook_url: string | null;
  email_recipients: string[] | null;
  cooldown_minutes: number;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AlertRuleCreate {
  name: string;
  alert_type: AlertType;
  metric: AlertMetric;
  operator: AlertOperator;
  threshold: number;
  account_id?: string;
  campaign_id?: string;
  is_enabled?: boolean;
  notification_channels?: NotificationChannel[];
  webhook_url?: string;
  email_recipients?: string[];
  cooldown_minutes?: number;
}

export interface AlertRuleUpdate {
  name?: string;
  threshold?: number;
  is_enabled?: boolean;
  notification_channels?: NotificationChannel[];
  webhook_url?: string;
  email_recipients?: string[];
  cooldown_minutes?: number;
}

export interface AlertRulesListResponse {
  rules: AlertRule[];
  total: number;
}

export interface AlertHistoryItem {
  id: string;
  rule_id: string;
  account_id: string | null;
  campaign_id: string | null;
  campaign_name: string | null;
  alert_type: AlertType;
  metric: AlertMetric;
  metric_value: number;
  threshold_value: number;
  message: string;
  status: AlertHistoryStatus;
  delivery_status: Record<string, string> | null;
  triggered_at: string;
  acknowledged_at: string | null;
  dismissed_at: string | null;
}

export interface AlertHistoryListResponse {
  alerts: AlertHistoryItem[];
  total: number;
  unread_count: number;
}

export interface AlertUnreadCountResponse {
  unread_count: number;
}

export interface AlertAcknowledgeResponse {
  id: string;
  status: AlertHistoryStatus;
  acknowledged_at: string;
}

export interface AlertDismissResponse {
  id: string;
  status: AlertHistoryStatus;
  dismissed_at: string;
}

export interface AlertMarkAllReadResponse {
  updated_count: number;
}

// Notification Preferences

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  webhook_enabled: boolean;
  in_app_enabled: boolean;
  email_address: string | null;
  digest_frequency: DigestFrequency;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferencesUpdate {
  email_enabled?: boolean;
  webhook_enabled?: boolean;
  in_app_enabled?: boolean;
  email_address?: string;
  digest_frequency?: DigestFrequency;
  quiet_hours_enabled?: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone?: string;
}

// Webhooks

export interface Webhook {
  id: string;
  user_id: string;
  name: string;
  url: string;
  secret: string | null;
  is_active: boolean;
  last_triggered_at: string | null;
  last_success_at: string | null;
  failure_count: number;
  consecutive_failures: number;
  created_at: string;
  updated_at: string;
}

export interface WebhookCreate {
  name: string;
  url: string;
  secret?: string;
}

export interface WebhookUpdate {
  name?: string;
  url?: string;
  secret?: string;
  is_active?: boolean;
}

export interface WebhooksListResponse {
  webhooks: Webhook[];
  total: number;
}

export interface WebhookTestResponse {
  success: boolean;
  status_code: number | null;
  response_time_ms: number | null;
  error_message: string | null;
}
