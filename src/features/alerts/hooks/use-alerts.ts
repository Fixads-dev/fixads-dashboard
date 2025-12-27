"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

// Query keys
const ALERT_KEYS = {
  all: ["alerts"] as const,
  rules: () => [...ALERT_KEYS.all, "rules"] as const,
  rule: (id: string) => [...ALERT_KEYS.rules(), id] as const,
  history: () => [...ALERT_KEYS.all, "history"] as const,
  unreadCount: () => [...ALERT_KEYS.all, "unread"] as const,
  preferences: () => ["notifications", "preferences"] as const,
  webhooks: () => ["webhooks"] as const,
  webhook: (id: string) => [...ALERT_KEYS.webhooks(), id] as const,
};

// ==================== Alert Rules Hooks ====================

export function useAlertRules(params?: {
  account_id?: string;
  is_enabled?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: [...ALERT_KEYS.rules(), params],
    queryFn: () => alertRulesApi.list(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useAlertRule(ruleId: string) {
  return useQuery({
    queryKey: ALERT_KEYS.rule(ruleId),
    queryFn: () => alertRulesApi.get(ruleId),
    enabled: !!ruleId,
  });
}

export function useCreateAlertRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AlertRuleCreate) => alertRulesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALERT_KEYS.rules() });
    },
  });
}

export function useUpdateAlertRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ruleId, data }: { ruleId: string; data: AlertRuleUpdate }) =>
      alertRulesApi.update(ruleId, data),
    onSuccess: (_, { ruleId }) => {
      queryClient.invalidateQueries({ queryKey: ALERT_KEYS.rules() });
      queryClient.invalidateQueries({ queryKey: ALERT_KEYS.rule(ruleId) });
    },
  });
}

export function useDeleteAlertRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ruleId: string) => alertRulesApi.delete(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALERT_KEYS.rules() });
    },
  });
}

// ==================== Alert History Hooks ====================

export function useAlertHistory(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: [...ALERT_KEYS.history(), params],
    queryFn: () => alertHistoryApi.list(params),
    staleTime: 30 * 1000,
  });
}

export function useAlertUnreadCount() {
  return useQuery({
    queryKey: ALERT_KEYS.unreadCount(),
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
      queryClient.invalidateQueries({ queryKey: ALERT_KEYS.history() });
      queryClient.invalidateQueries({ queryKey: ALERT_KEYS.unreadCount() });
    },
  });
}

export function useDismissAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: string) => alertHistoryApi.dismiss(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALERT_KEYS.history() });
      queryClient.invalidateQueries({ queryKey: ALERT_KEYS.unreadCount() });
    },
  });
}

export function useMarkAllAlertsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => alertHistoryApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALERT_KEYS.history() });
      queryClient.invalidateQueries({ queryKey: ALERT_KEYS.unreadCount() });
    },
  });
}

// ==================== Notification Preferences Hooks ====================

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ALERT_KEYS.preferences(),
    queryFn: () => notificationPreferencesApi.get(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NotificationPreferencesUpdate) => notificationPreferencesApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALERT_KEYS.preferences() });
    },
  });
}

// ==================== Webhooks Hooks ====================

export function useWebhooks() {
  return useQuery({
    queryKey: ALERT_KEYS.webhooks(),
    queryFn: () => webhooksApi.list(),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useCreateWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WebhookCreate) => webhooksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALERT_KEYS.webhooks() });
    },
  });
}

export function useUpdateWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ webhookId, data }: { webhookId: string; data: WebhookUpdate }) =>
      webhooksApi.update(webhookId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALERT_KEYS.webhooks() });
    },
  });
}

export function useDeleteWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (webhookId: string) => webhooksApi.delete(webhookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALERT_KEYS.webhooks() });
    },
  });
}

export function useTestWebhook() {
  return useMutation({
    mutationFn: (webhookId: string) => webhooksApi.test(webhookId),
  });
}
