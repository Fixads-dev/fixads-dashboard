import { apiMethods } from "@/shared/api";
import { API_PATHS } from "@/shared/lib/constants";
import type {
  AlertAcknowledgeResponse,
  AlertDismissResponse,
  AlertHistoryListResponse,
  AlertMarkAllReadResponse,
  AlertRule,
  AlertRuleCreate,
  AlertRulesListResponse,
  AlertRuleUpdate,
  AlertUnreadCountResponse,
  NotificationPreferences,
  NotificationPreferencesUpdate,
  Webhook,
  WebhookCreate,
  WebhooksListResponse,
  WebhookTestResponse,
  WebhookUpdate,
} from "../types";

// Remove leading slash since apiMethods adds the base URL
const ALERT_PATH = API_PATHS.ALERT.slice(1);

/**
 * Alert Rules API
 */
export const alertRulesApi = {
  /**
   * List all alert rules for the current user
   */
  list: async (params?: {
    account_id?: string;
    is_enabled?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<AlertRulesListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.account_id) searchParams.set("account_id", params.account_id);
    if (params?.is_enabled !== undefined)
      searchParams.set("is_enabled", String(params.is_enabled));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.offset) searchParams.set("offset", String(params.offset));

    const query = searchParams.toString();
    return apiMethods.get<AlertRulesListResponse>(
      `${ALERT_PATH}/alerts/rules${query ? `?${query}` : ""}`,
    );
  },

  /**
   * Get a single alert rule by ID
   */
  get: async (ruleId: string): Promise<AlertRule> => {
    return apiMethods.get<AlertRule>(`${ALERT_PATH}/alerts/rules/${ruleId}`);
  },

  /**
   * Create a new alert rule
   */
  create: async (data: AlertRuleCreate): Promise<AlertRule> => {
    return apiMethods.post<AlertRule>(`${ALERT_PATH}/alerts/rules`, data);
  },

  /**
   * Update an existing alert rule
   */
  update: async (ruleId: string, data: AlertRuleUpdate): Promise<AlertRule> => {
    return apiMethods.patch<AlertRule>(`${ALERT_PATH}/alerts/rules/${ruleId}`, data);
  },

  /**
   * Delete an alert rule
   */
  delete: async (ruleId: string): Promise<void> => {
    return apiMethods.delete(`${ALERT_PATH}/alerts/rules/${ruleId}`);
  },
};

/**
 * Alert History API
 */
export const alertHistoryApi = {
  /**
   * List alert history
   */
  list: async (params?: {
    limit?: number;
    offset?: number;
  }): Promise<AlertHistoryListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.offset) searchParams.set("offset", String(params.offset));

    const query = searchParams.toString();
    return apiMethods.get<AlertHistoryListResponse>(
      `${ALERT_PATH}/alerts/history${query ? `?${query}` : ""}`,
    );
  },

  /**
   * Get unread alert count
   */
  getUnreadCount: async (): Promise<AlertUnreadCountResponse> => {
    return apiMethods.get<AlertUnreadCountResponse>(`${ALERT_PATH}/alerts/history/unread`);
  },

  /**
   * Acknowledge an alert
   */
  acknowledge: async (alertId: string): Promise<AlertAcknowledgeResponse> => {
    return apiMethods.post<AlertAcknowledgeResponse>(
      `${ALERT_PATH}/alerts/history/${alertId}/acknowledge`,
    );
  },

  /**
   * Dismiss an alert
   */
  dismiss: async (alertId: string): Promise<AlertDismissResponse> => {
    return apiMethods.post<AlertDismissResponse>(
      `${ALERT_PATH}/alerts/history/${alertId}/dismiss`,
    );
  },

  /**
   * Mark all alerts as read
   */
  markAllRead: async (): Promise<AlertMarkAllReadResponse> => {
    return apiMethods.post<AlertMarkAllReadResponse>(
      `${ALERT_PATH}/alerts/history/mark-all-read`,
    );
  },
};

/**
 * Notification Preferences API
 */
export const notificationPreferencesApi = {
  /**
   * Get notification preferences
   */
  get: async (): Promise<NotificationPreferences> => {
    return apiMethods.get<NotificationPreferences>(`${ALERT_PATH}/notifications/preferences`);
  },

  /**
   * Update notification preferences
   */
  update: async (data: NotificationPreferencesUpdate): Promise<NotificationPreferences> => {
    return apiMethods.patch<NotificationPreferences>(
      `${ALERT_PATH}/notifications/preferences`,
      data,
    );
  },
};

/**
 * Webhooks API
 */
export const webhooksApi = {
  /**
   * List all webhooks
   */
  list: async (): Promise<WebhooksListResponse> => {
    return apiMethods.get<WebhooksListResponse>(`${ALERT_PATH}/webhooks`);
  },

  /**
   * Create a new webhook
   */
  create: async (data: WebhookCreate): Promise<Webhook> => {
    return apiMethods.post<Webhook>(`${ALERT_PATH}/webhooks`, data);
  },

  /**
   * Update an existing webhook
   */
  update: async (webhookId: string, data: WebhookUpdate): Promise<Webhook> => {
    return apiMethods.patch<Webhook>(`${ALERT_PATH}/webhooks/${webhookId}`, data);
  },

  /**
   * Delete a webhook
   */
  delete: async (webhookId: string): Promise<void> => {
    return apiMethods.delete(`${ALERT_PATH}/webhooks/${webhookId}`);
  },

  /**
   * Test a webhook
   */
  test: async (webhookId: string): Promise<WebhookTestResponse> => {
    return apiMethods.post<WebhookTestResponse>(`${ALERT_PATH}/webhooks/${webhookId}/test`);
  },
};
