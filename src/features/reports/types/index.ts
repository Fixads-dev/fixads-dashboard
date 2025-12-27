/**
 * Reports feature types
 */

// Date range options for reports
export type DateRange =
  | "TODAY"
  | "YESTERDAY"
  | "LAST_7_DAYS"
  | "LAST_14_DAYS"
  | "LAST_30_DAYS"
  | "LAST_90_DAYS"
  | "THIS_MONTH"
  | "LAST_MONTH"
  | "CUSTOM";

// Schedule frequency options
export type ScheduleFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

// Available metrics for reports
export type ReportMetric =
  | "clicks"
  | "impressions"
  | "ctr"
  | "cost"
  | "conversions"
  | "conversions_value"
  | "cost_per_conversion"
  | "average_cpc"
  | "roas";

// Available dimensions for reports
export type ReportDimension =
  | "campaign"
  | "campaign_id"
  | "ad_group"
  | "ad_group_id"
  | "device"
  | "date"
  | "day_of_week"
  | "hour"
  | "network"
  | "geo_country"
  | "geo_region"
  | "geo_city";

// Report schedule configuration
export interface ReportSchedule {
  frequency: ScheduleFrequency;
  day_of_week?: number; // 0-6 for weekly
  day_of_month?: number; // 1-31 for monthly
  time?: string; // HH:MM format
  recipients?: string[]; // Email addresses
}

// Custom report definition
export interface CustomReport {
  id: string;
  user_id: string;
  account_id?: string;
  name: string;
  description?: string;
  metrics: string[];
  dimensions: string[];
  filters?: Record<string, unknown>;
  date_range: DateRange;
  start_date?: string;
  end_date?: string;
  schedule?: ReportSchedule;
  is_scheduled: boolean;
  last_run_at?: string;
  next_run_at?: string;
  created_at: string;
  updated_at: string;
}

// Request to create a report
export interface CreateReportRequest {
  account_id?: string;
  name: string;
  description?: string;
  metrics: string[];
  dimensions: string[];
  filters?: Record<string, unknown>;
  date_range: DateRange;
  start_date?: string;
  end_date?: string;
  schedule?: ReportSchedule;
}

// Request to update a report
export interface UpdateReportRequest {
  name?: string;
  description?: string;
  metrics?: string[];
  dimensions?: string[];
  filters?: Record<string, unknown>;
  date_range?: DateRange;
  start_date?: string;
  end_date?: string;
  schedule?: ReportSchedule;
}

// Report data row
export interface ReportDataRow {
  dimensions: Record<string, string>;
  metrics: Record<string, number>;
}

// Request to generate report data
export interface GenerateReportRequest {
  date_range?: DateRange;
  start_date?: string;
  end_date?: string;
}

// Response from generating report data
export interface GenerateReportResponse {
  report_id: string;
  report_name: string;
  date_range: string;
  start_date?: string;
  end_date?: string;
  rows: ReportDataRow[];
  total_rows: number;
  execution_time_ms: number;
  generated_at: string;
}

// Reports list response
export interface ReportListResponse {
  reports: CustomReport[];
  total: number;
}

// Report list query params
export interface ReportListParams {
  account_id?: string;
  limit?: number;
  offset?: number;
}
