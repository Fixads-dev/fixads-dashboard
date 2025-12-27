/**
 * Reports hooks for TanStack Query
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/lib/constants";
import {
  createReport,
  deleteReport,
  generateReport,
  getReport,
  listReports,
  updateReport,
} from "../api/reports-api";
import type {
  CreateReportRequest,
  GenerateReportRequest,
  ReportListParams,
  UpdateReportRequest,
} from "../types";

/**
 * Hook to list custom reports
 */
export function useReports(params?: ReportListParams) {
  return useQuery({
    queryKey: QUERY_KEYS.REPORTS.list(params),
    queryFn: () => listReports(params),
  });
}

/**
 * Hook to get a single report
 */
export function useReport(reportId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.REPORTS.detail(reportId),
    queryFn: () => getReport(reportId),
    enabled: !!reportId,
  });
}

/**
 * Hook to create a report
 */
export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReportRequest) => createReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REPORTS.all });
    },
  });
}

/**
 * Hook to update a report
 */
export function useUpdateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, data }: { reportId: string; data: UpdateReportRequest }) =>
      updateReport(reportId, data),
    onSuccess: (_, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REPORTS.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REPORTS.detail(reportId) });
    },
  });
}

/**
 * Hook to delete a report
 */
export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) => deleteReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REPORTS.all });
    },
  });
}

/**
 * Hook to generate report data
 */
export function useGenerateReport() {
  return useMutation({
    mutationFn: ({
      reportId,
      data,
    }: {
      reportId: string;
      data?: GenerateReportRequest;
    }) => generateReport(reportId, data),
  });
}
