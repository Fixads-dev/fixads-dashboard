// Types
export * from "./types";

// API
export { alertHistoryApi, alertRulesApi, notificationPreferencesApi, webhooksApi } from "./api/alerts-api";

// Hooks
export {
  // Alert Rules
  useAlertRule,
  useAlertRules,
  useCreateAlertRule,
  useDeleteAlertRule,
  useUpdateAlertRule,
  // Alert History
  useAcknowledgeAlert,
  useAlertHistory,
  useAlertUnreadCount,
  useDismissAlert,
  useMarkAllAlertsRead,
  // Notification Preferences
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  // Webhooks
  useCreateWebhook,
  useDeleteWebhook,
  useTestWebhook,
  useUpdateWebhook,
  useWebhooks,
} from "./hooks/use-alerts";
