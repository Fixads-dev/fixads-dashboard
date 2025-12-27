"use client";

import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ALERT_TYPE_LABELS,
  useAcknowledgeAlert,
  useAlertHistory,
  useAlertUnreadCount,
  useMarkAllAlertsRead,
} from "@/features/alerts";
import { ROUTES } from "@/shared/lib/constants";

const statusConfig = {
  PENDING: { icon: Clock, color: "text-yellow-500" },
  SENT: { icon: Bell, color: "text-blue-500" },
  ACKNOWLEDGED: { icon: CheckCircle, color: "text-green-500" },
  DISMISSED: { icon: XCircle, color: "text-muted-foreground" },
} as const;

export function AlertBell() {
  const { data: unreadData } = useAlertUnreadCount();
  const { data: historyData } = useAlertHistory({ limit: 5 });
  const acknowledgeAlert = useAcknowledgeAlert();
  const markAllRead = useMarkAllAlertsRead();

  const unreadCount = unreadData?.unread_count ?? 0;
  const alerts = historyData?.alerts ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[10px]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />

        {alerts.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          <ScrollArea className="max-h-[300px]">
            {alerts.map((alert) => {
              const StatusIcon = statusConfig[alert.status].icon;
              const isUnread = alert.status === "PENDING" || alert.status === "SENT";

              return (
                <DropdownMenuItem
                  key={alert.id}
                  className={`flex items-start gap-3 px-3 py-2 ${isUnread ? "bg-primary/5" : ""}`}
                  onSelect={(e) => {
                    if (isUnread) {
                      e.preventDefault();
                      acknowledgeAlert.mutate(alert.id);
                    }
                  }}
                >
                  <div className={`mt-0.5 ${statusConfig[alert.status].color}`}>
                    <StatusIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {ALERT_TYPE_LABELS[alert.alert_type]}
                      </Badge>
                    </div>
                    <p className="text-xs line-clamp-2">{alert.message}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(alert.triggered_at), { addSuffix: true })}
                    </p>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </ScrollArea>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={ROUTES.ALERTS} className="justify-center text-sm font-medium">
            View all alerts
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
