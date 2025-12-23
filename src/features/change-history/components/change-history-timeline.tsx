"use client";

import { AlertCircle, Clock, History, Pencil, PlusCircle, RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useChangeHistory } from "../hooks/use-change-history";
import type { ChangeEvent, ChangeHistoryFilters, ChangeOperation } from "../types";
import {
  getClientTypeLabel,
  getOperationLabel,
  getOperationVariant,
  getResourceTypeLabel,
} from "../types";

interface ChangeHistoryTimelineProps {
  filters: ChangeHistoryFilters;
}

// Static skeleton keys
const SKELETON_ITEMS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"] as const;

function getOperationIcon(operation: ChangeOperation) {
  switch (operation) {
    case "CREATE":
      return <PlusCircle className="h-4 w-4 text-green-500" />;
    case "UPDATE":
      return <Pencil className="h-4 w-4 text-blue-500" />;
    case "REMOVE":
      return <Trash2 className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
}

function formatDateTime(dateTimeStr: string): string {
  try {
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  } catch {
    return dateTimeStr;
  }
}

function formatRelativeTime(dateTimeStr: string): string {
  try {
    const date = new Date(dateTimeStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    }
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    }
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  } catch {
    return "";
  }
}

function ChangeEventCard({ event }: { event: ChangeEvent }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="mt-1">{getOperationIcon(event.operation)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={getOperationVariant(event.operation)}>
                {getOperationLabel(event.operation)}
              </Badge>
              <Badge variant="outline">{getResourceTypeLabel(event.change_resource_type)}</Badge>
            </div>
            <p
              className="mt-2 text-sm text-muted-foreground truncate"
              title={event.change_resource_name}
            >
              {event.change_resource_name}
            </p>
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span>{formatDateTime(event.change_date_time)}</span>
              <span className="text-muted-foreground/60">
                {formatRelativeTime(event.change_date_time)}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
              {event.user_email && <span>By: {event.user_email}</span>}
              <span>Via: {getClientTypeLabel(event.client_type)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ChangeHistoryTimeline({ filters }: ChangeHistoryTimelineProps) {
  const { data, isLoading, error, refetch, isFetching } = useChangeHistory(filters);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {SKELETON_ITEMS.map((id) => (
          <Card key={id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load change history</h3>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : "An unexpected error occurred"}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
      </div>
    );
  }

  // Empty state
  if (!data?.changes.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <History className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No changes found</h3>
        <p className="text-muted-foreground mb-4">
          No changes have been made to this account in the selected time period.
        </p>
        <Button onClick={() => refetch()} variant="outline" disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data.total_count} change{data.total_count !== 1 ? "s" : ""} found
        </p>
        <Button onClick={() => refetch()} variant="ghost" size="sm" disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {data.changes.map((event) => (
          <ChangeEventCard key={event.resource_name} event={event} />
        ))}
      </div>
    </div>
  );
}
