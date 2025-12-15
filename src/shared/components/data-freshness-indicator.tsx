"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
