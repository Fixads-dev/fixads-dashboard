/**
 * Dashboards feature types
 */

// Widget types available
export type WidgetType =
  | "METRIC_CARD"
  | "LINE_CHART"
  | "BAR_CHART"
  | "PIE_CHART"
  | "TABLE"
  | "HEATMAP";

// Comparison period for metric widgets
export type ComparisonPeriod = "PREVIOUS_PERIOD" | "PREVIOUS_YEAR" | "NONE";

// Dashboard layout configuration
export interface DashboardLayout {
  columns: number;
  row_height?: number;
  gap?: number;
}

// Widget position in grid
export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Widget configuration (varies by type)
export interface WidgetConfig {
  metric?: string;
  metrics?: string[];
  dimensions?: string[];
  date_range?: string;
  comparison?: ComparisonPeriod;
  format?: string;
  color?: string;
  filters?: Record<string, unknown>;
  chart_config?: Record<string, unknown>;
}

// Dashboard widget
export interface DashboardWidget {
  id: string;
  dashboard_id: string;
  widget_type: WidgetType;
  title: string;
  config: WidgetConfig;
  position: WidgetPosition;
  created_at: string;
  updated_at: string;
}

// Dashboard definition
export interface Dashboard {
  id: string;
  user_id: string;
  account_id?: string;
  name: string;
  description?: string;
  layout: DashboardLayout;
  is_default: boolean;
  widgets: DashboardWidget[];
  created_at: string;
  updated_at: string;
}

// Request to create a dashboard
export interface CreateDashboardRequest {
  account_id?: string;
  name: string;
  description?: string;
  layout?: DashboardLayout;
  is_default?: boolean;
}

// Request to update a dashboard
export interface UpdateDashboardRequest {
  name?: string;
  description?: string;
  layout?: DashboardLayout;
  is_default?: boolean;
}

// Request to create a widget
export interface CreateWidgetRequest {
  widget_type: WidgetType;
  title: string;
  config: WidgetConfig;
  position: WidgetPosition;
}

// Request to update a widget
export interface UpdateWidgetRequest {
  title?: string;
  config?: WidgetConfig;
  position?: WidgetPosition;
}

// Dashboard list response
export interface DashboardListResponse {
  dashboards: Dashboard[];
  total: number;
}

// Dashboard list query params
export interface DashboardListParams {
  account_id?: string;
  limit?: number;
  offset?: number;
}
