/**
 * Dashboards API functions
 */

import { apiMethods } from "@/shared/api/client";
import { API_PATHS } from "@/shared/lib/constants";
import type {
  CreateDashboardRequest,
  CreateWidgetRequest,
  Dashboard,
  DashboardListParams,
  DashboardListResponse,
  DashboardWidget,
  UpdateDashboardRequest,
  UpdateWidgetRequest,
} from "../types";

const BASE_URL = API_PATHS.REPORTS;

/**
 * List dashboards
 */
export async function listDashboards(params?: DashboardListParams): Promise<DashboardListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.account_id) searchParams.append("account_id", params.account_id);
  if (params?.limit) searchParams.append("limit", String(params.limit));
  if (params?.offset) searchParams.append("offset", String(params.offset));

  const query = searchParams.toString();
  const url = `${BASE_URL}/dashboards${query ? `?${query}` : ""}`;

  return apiMethods.get<DashboardListResponse>(url);
}

/**
 * Get a single dashboard by ID
 */
export async function getDashboard(dashboardId: string): Promise<Dashboard> {
  return apiMethods.get<Dashboard>(`${BASE_URL}/dashboards/${dashboardId}`);
}

/**
 * Create a new dashboard
 */
export async function createDashboard(data: CreateDashboardRequest): Promise<Dashboard> {
  return apiMethods.post<Dashboard>(`${BASE_URL}/dashboards`, data);
}

/**
 * Update an existing dashboard
 */
export async function updateDashboard(
  dashboardId: string,
  data: UpdateDashboardRequest,
): Promise<Dashboard> {
  return apiMethods.patch<Dashboard>(`${BASE_URL}/dashboards/${dashboardId}`, data);
}

/**
 * Delete a dashboard
 */
export async function deleteDashboard(dashboardId: string): Promise<void> {
  return apiMethods.delete(`${BASE_URL}/dashboards/${dashboardId}`);
}

/**
 * Add a widget to a dashboard
 */
export async function addWidget(
  dashboardId: string,
  data: CreateWidgetRequest,
): Promise<DashboardWidget> {
  return apiMethods.post<DashboardWidget>(`${BASE_URL}/dashboards/${dashboardId}/widgets`, data);
}

/**
 * Update a widget
 */
export async function updateWidget(
  dashboardId: string,
  widgetId: string,
  data: UpdateWidgetRequest,
): Promise<DashboardWidget> {
  return apiMethods.patch<DashboardWidget>(
    `${BASE_URL}/dashboards/${dashboardId}/widgets/${widgetId}`,
    data,
  );
}

/**
 * Remove a widget from a dashboard
 */
export async function removeWidget(dashboardId: string, widgetId: string): Promise<void> {
  return apiMethods.delete(`${BASE_URL}/dashboards/${dashboardId}/widgets/${widgetId}`);
}
