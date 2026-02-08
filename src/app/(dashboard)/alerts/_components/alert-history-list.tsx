"use client";

import { formatDistanceToNow } from "date-fns";
import { AlertCircle, Bell, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/shared/components";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ALERT_METRIC_LABELS,
  ALERT_TYPE_LABELS,
  type AlertHistoryItem,
  useAcknowledgeAlert,
  useDismissAlert,
  useMarkAllAlertsRead,
} from "@/features/alerts";
import { toast } from "sonner";

interface AlertHistoryListProps {
  alerts: AlertHistoryItem[];
  isLoading: boolean;
  totalCount: number;
  unreadCount: number;
}

const statusConfig = {
  PENDING: { icon: Clock, color: "text-yellow-500", label: "Pending" },
  SENT: { icon: Bell, color: "text-blue-500", label: "Sent" },
  ACKNOWLEDGED: { icon: CheckCircle, color: "text-green-500", label: "Acknowledged" },
  DISMISSED: { icon: XCircle, color: "text-muted-foreground", label: "Dismissed" },
} as const;

export function AlertHistoryList({
  alerts,
  isLoading,
  totalCount,
  unreadCount,
}: AlertHistoryListProps) {
  const acknowledgeAlert = useAcknowledgeAlert();
  const dismissAlert = useDismissAlert();
  const markAllRead = useMarkAllAlertsRead();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alert History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="No Alerts"
        description="When alerts are triggered, they will appear here."
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          Alert History ({totalCount})
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount} unread
            </Badge>
          )}
        </CardTitle>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              markAllRead.mutate(undefined, {
                onError: () => toast.error("Failed to mark alerts as read"),
              })
            }
            disabled={markAllRead.isPending}
          >
            Mark all as read
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => {
            const StatusIcon = statusConfig[alert.status].icon;
            const isUnread = alert.status === "PENDING" || alert.status === "SENT";

            return (
              <div
                key={alert.id}
                className={`rounded-lg border p-4 ${isUnread ? "border-primary/50 bg-primary/5" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${statusConfig[alert.status].color}`}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{ALERT_TYPE_LABELS[alert.alert_type]}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(alert.triggered_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {ALERT_METRIC_LABELS[alert.metric]}: {alert.metric_value.toFixed(2)} (
                        threshold: {alert.threshold_value})
                        {alert.campaign_name && ` - ${alert.campaign_name}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isUnread && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            acknowledgeAlert.mutate(alert.id, {
                              onError: () => toast.error("Failed to acknowledge alert"),
                            })
                          }
                          disabled={acknowledgeAlert.isPending}
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Acknowledge
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            dismissAlert.mutate(alert.id, {
                              onError: () => toast.error("Failed to dismiss alert"),
                            })
                          }
                          disabled={dismissAlert.isPending}
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Dismiss
                        </Button>
                      </>
                    )}
                    {!isUnread && (
                      <Badge variant="secondary">{statusConfig[alert.status].label}</Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
