"use client";

import { Bell, Plus, Settings, Webhook } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAlertHistory, useAlertRules, useAlertUnreadCount } from "@/features/alerts";
import { AlertHistoryList } from "./alert-history-list";
import { AlertRuleDialog } from "./alert-rule-dialog";
import { AlertRulesList } from "./alert-rules-list";
import { NotificationSettings } from "./notification-settings";
import { WebhookManager } from "./webhook-manager";

export function AlertsContent() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: rulesData, isLoading: rulesLoading } = useAlertRules();
  const { data: historyData, isLoading: historyLoading } = useAlertHistory({ limit: 50 });
  const { data: unreadData } = useAlertUnreadCount();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>
          <p className="text-muted-foreground">
            Configure alert rules and manage notifications
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Alert Rule
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rules" className="space-y-6">
        <TabsList>
          <TabsTrigger value="rules" className="gap-2">
            <Bell className="h-4 w-4" />
            Alert Rules
            {rulesData && rulesData.total > 0 && (
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                {rulesData.total}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Bell className="h-4 w-4" />
            History
            {unreadData && unreadData.unread_count > 0 && (
              <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                {unreadData.unread_count}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          <AlertRulesList
            rules={rulesData?.rules ?? []}
            isLoading={rulesLoading}
            onCreateClick={() => setIsCreateDialogOpen(true)}
          />
        </TabsContent>

        <TabsContent value="history">
          <AlertHistoryList
            alerts={historyData?.alerts ?? []}
            isLoading={historyLoading}
            totalCount={historyData?.total ?? 0}
            unreadCount={unreadData?.unread_count ?? 0}
          />
        </TabsContent>

        <TabsContent value="webhooks">
          <WebhookManager />
        </TabsContent>

        <TabsContent value="settings">
          <NotificationSettings />
        </TabsContent>
      </Tabs>

      {/* Create Alert Rule Dialog */}
      <AlertRuleDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        mode="create"
      />
    </div>
  );
}
