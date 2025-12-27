/**
 * Dashboards hooks for TanStack Query
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/lib/constants";
import {
  addWidget,
  createDashboard,
  deleteDashboard,
  getDashboard,
  listDashboards,
  removeWidget,
  updateDashboard,
  updateWidget,
} from "../api/dashboards-api";
import type {
  CreateDashboardRequest,
  CreateWidgetRequest,
  DashboardListParams,
  UpdateDashboardRequest,
  UpdateWidgetRequest,
} from "../types";

/**
 * Hook to list dashboards
 */
export function useDashboards(params?: DashboardListParams) {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARDS.list(params),
    queryFn: () => listDashboards(params),
  });
}

/**
 * Hook to get a single dashboard
 */
export function useDashboard(dashboardId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARDS.detail(dashboardId),
    queryFn: () => getDashboard(dashboardId),
    enabled: !!dashboardId,
  });
}

/**
 * Hook to create a dashboard
 */
export function useCreateDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDashboardRequest) => createDashboard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARDS.all });
    },
  });
}

/**
 * Hook to update a dashboard
 */
export function useUpdateDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ dashboardId, data }: { dashboardId: string; data: UpdateDashboardRequest }) =>
      updateDashboard(dashboardId, data),
    onSuccess: (_, { dashboardId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARDS.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARDS.detail(dashboardId) });
    },
  });
}

/**
 * Hook to delete a dashboard
 */
export function useDeleteDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dashboardId: string) => deleteDashboard(dashboardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARDS.all });
    },
  });
}

/**
 * Hook to add a widget to a dashboard
 */
export function useAddWidget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ dashboardId, data }: { dashboardId: string; data: CreateWidgetRequest }) =>
      addWidget(dashboardId, data),
    onSuccess: (_, { dashboardId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARDS.detail(dashboardId) });
    },
  });
}

/**
 * Hook to update a widget
 */
export function useUpdateWidget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dashboardId,
      widgetId,
      data,
    }: {
      dashboardId: string;
      widgetId: string;
      data: UpdateWidgetRequest;
    }) => updateWidget(dashboardId, widgetId, data),
    onSuccess: (_, { dashboardId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARDS.detail(dashboardId) });
    },
  });
}

/**
 * Hook to remove a widget
 */
export function useRemoveWidget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ dashboardId, widgetId }: { dashboardId: string; widgetId: string }) =>
      removeWidget(dashboardId, widgetId),
    onSuccess: (_, { dashboardId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARDS.detail(dashboardId) });
    },
  });
}
