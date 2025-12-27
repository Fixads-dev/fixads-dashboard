/**
 * Reports API functions
 */

import { apiMethods } from "@/shared/api/client";
import { API_PATHS } from "@/shared/lib/constants";
import type {
  CreateReportRequest,
  CustomReport,
  GenerateReportRequest,
  GenerateReportResponse,
  ReportListParams,
  ReportListResponse,
  UpdateReportRequest,
} from "../types";

const BASE_URL = API_PATHS.REPORTS;

/**
 * List custom reports
 */
export async function listReports(params?: ReportListParams): Promise<ReportListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.account_id) searchParams.append("account_id", params.account_id);
  if (params?.limit) searchParams.append("limit", String(params.limit));
  if (params?.offset) searchParams.append("offset", String(params.offset));

  const query = searchParams.toString();
  const url = `${BASE_URL}/reports${query ? `?${query}` : ""}`;

  return apiMethods.get<ReportListResponse>(url);
}

/**
 * Get a single report by ID
 */
export async function getReport(reportId: string): Promise<CustomReport> {
  return apiMethods.get<CustomReport>(`${BASE_URL}/reports/${reportId}`);
}

/**
 * Create a new custom report
 */
export async function createReport(data: CreateReportRequest): Promise<CustomReport> {
  return apiMethods.post<CustomReport>(`${BASE_URL}/reports`, data);
}

/**
 * Update an existing report
 */
export async function updateReport(
  reportId: string,
  data: UpdateReportRequest,
): Promise<CustomReport> {
  return apiMethods.patch<CustomReport>(`${BASE_URL}/reports/${reportId}`, data);
}

/**
 * Delete a report
 */
export async function deleteReport(reportId: string): Promise<void> {
  return apiMethods.delete(`${BASE_URL}/reports/${reportId}`);
}

/**
 * Generate report data
 */
export async function generateReport(
  reportId: string,
  data?: GenerateReportRequest,
): Promise<GenerateReportResponse> {
  return apiMethods.post<GenerateReportResponse>(
    `${BASE_URL}/reports/${reportId}/generate`,
    data ?? {},
  );
}
