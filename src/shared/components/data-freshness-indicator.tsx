"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/shared/lib/format";

interface DataFreshnessIndicatorProps {
  lastUpdated: Date | string | null;
  isFetching: boolean;
  onRefresh: () => void;
  className?: string;
}

export function DataFreshnessIndicator({
  lastUpdated,
  isFetching,
  onRefresh,
  className,
}: DataFreshnessIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
      {lastUpdated && <span>Updated {formatRelativeTime(lastUpdated)}</span>}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={onRefresh}
        disabled={isFetching}
        aria-label="Refresh data"
      >
        <RefreshCw className={cn("h-3 w-3", isFetching && "animate-spin")} />
      </Button>
    </div>
  );
}

// ==================== Staleness Indicator ====================

interface StalenessIndicatorProps {
  lastSyncedAt: string | null;
  isStale: boolean;
  className?: string;
}

/**
 * Shows staleness status from backend cached data.
 * Displays warning badge when data is stale (> 15 minutes old).
 */
export function StalenessIndicator({ lastSyncedAt, isStale, className }: StalenessIndicatorProps) {
  if (!lastSyncedAt) {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>
        Never synced
      </span>
    );
  }

  const timeAgo = formatRelativeTime(lastSyncedAt);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-1.5 text-xs",
              isStale ? "text-yellow-600 dark:text-yellow-500" : "text-muted-foreground",
              className,
            )}
          >
            {isStale && <AlertTriangle className="h-3 w-3" />}
            <span>Synced {timeAgo}</span>
            {isStale && (
              <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0 h-4 border-yellow-500/50 text-yellow-600 dark:text-yellow-500">
                Stale
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">
            {isStale
              ? "Data may be outdated. Click Sync to refresh from Google Ads."
              : "Data is up to date."}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
