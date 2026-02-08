"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/lib/constants";
import {
  alertHistoryApi,
  alertRulesApi,
  notificationPreferencesApi,
  webhooksApi,
} from "../api/alerts-api";
import type {
  AlertRuleCreate,
  AlertRuleUpdate,
  NotificationPreferencesUpdate,
  WebhookCreate,
  WebhookUpdate,
} from "../types";

/** @deprecated Use QUERY_KEYS.ALERTS from shared/lib/constants instead */
export const ALERT_KEYS = QUERY_KEYS.ALERTS;

// ==================== Alert Rules Hooks ====================

export function useAlertRules(params?: {
  account_id?: string;
  is_enabled?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: QUERY_KEYS.ALERTS.rules.list(params),
    queryFn: () => alertRulesApi.list(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useAlertRule(ruleId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ALERTS.rules.detail(ruleId),
    queryFn: () => alertRulesApi.get(ruleId),
    enabled: !!ruleId,
  });
}

export function useCreateAlertRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AlertRuleCreate) => alertRulesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALERTS.rules.all });
    },
  });
}

export function useUpdateAlertRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ruleId, data }: { ruleId: string; data: AlertRuleUpdate }) =>
      alertRulesApi.update(ruleId, data),
    onSuccess: (_, { ruleId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALERTS.rules.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALERTS.rules.detail(ruleId) });
    },
  });
}

export function useDeleteAlertRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ruleId: string) => alertRulesApi.delete(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALERTS.rules.all });
    },
  });
}

// ==================== Alert History Hooks ====================

export function useAlertHistory(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: QUERY_KEYS.ALERTS.history.list(params),
    queryFn: () => alertHistoryApi.list(params),
    staleTime: 30 * 1000,
  });
}

export function useAlertUnreadCount() {
  return useQuery({
    queryKey: QUERY_KEYS.ALERTS.history.unread,
    queryFn: () => alertHistoryApi.getUnreadCount(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: string) => alertHistoryApi.acknowledge(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALERTS.history.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALERTS.history.unread });
    },
  });
}

export function useDismissAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: string) => alertHistoryApi.dismiss(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALERTS.history.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALERTS.history.unread });
    },
  });
}

export function useMarkAllAlertsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => alertHistoryApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALERTS.history.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALERTS.history.unread });
    },
  });
}

// ==================== Notification Preferences Hooks ====================

export function useNotificationPreferences() {
  return useQuery({
    queryKey: QUERY_KEYS.ALERTS.notifications.preferences,
    queryFn: () => notificationPreferencesApi.get(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NotificationPreferencesUpdate) => notificationPreferencesApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALERTS.notifications.preferences });
    },
  });
}

// ==================== Webhooks Hooks ====================

export function useWebhooks() {
  return useQuery({
    queryKey: QUERY_KEYS.ALERTS.webhooks.list,
    queryFn: () => webhooksApi.list(),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useCreateWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WebhookCreate) => webhooksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALERTS.webhooks.all });
    },
  });
}

export function useUpdateWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ webhookId, data }: { webhookId: string; data: WebhookUpdate }) =>
      webhooksApi.update(webhookId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALERTS.webhooks.all });
    },
  });
}

export function useDeleteWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (webhookId: string) => webhooksApi.delete(webhookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALERTS.webhooks.all });
    },
  });
}

export function useTestWebhook() {
  return useMutation({
    mutationFn: (webhookId: string) => webhooksApi.test(webhookId),
  });
}
