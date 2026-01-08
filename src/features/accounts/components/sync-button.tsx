"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSyncAccount } from "../hooks/use-sync-account";

interface SyncButtonProps {
  accountId: string;
  onSyncComplete?: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
  showLabel?: boolean;
  className?: string;
}

/**
 * Button to trigger manual sync of Google Ads account data.
 * Shows loading state during sync and success/error feedback.
 */
export function SyncButton({
  accountId,
  onSyncComplete,
  variant = "outline",
  size = "sm",
  showLabel = true,
  className,
}: SyncButtonProps) {
  const { mutate: syncAccount, isPending, isSuccess, data } = useSyncAccount();

  const handleSync = () => {
    syncAccount(
      { account_id: accountId },
      {
        onSuccess: () => {
          onSyncComplete?.();
        },
      },
    );
  };

  const buttonContent = (
    <>
      <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin", showLabel && "mr-2")} />
      {showLabel && (isPending ? "Syncing..." : "Sync Now")}
    </>
  );

  // If showing as icon only, wrap in tooltip
  if (!showLabel) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size={size}
              onClick={handleSync}
              disabled={isPending}
              className={className}
              aria-label="Sync account data"
            >
              {buttonContent}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isPending ? "Syncing..." : "Sync account data from Google Ads"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSync}
      disabled={isPending}
      className={className}
    >
      {buttonContent}
    </Button>
  );
}

interface SyncStatusProps {
  isSuccess: boolean;
  data?: {
    campaigns_synced: number;
    asset_groups_synced: number;
    assets_synced: number;
    duration_seconds: number;
  };
}

/**
 * Shows sync result stats after successful sync.
 */
export function SyncStatus({ isSuccess, data }: SyncStatusProps) {
  if (!isSuccess || !data) return null;

  return (
    <div className="text-xs text-green-600 dark:text-green-500">
      Synced {data.campaigns_synced} campaigns, {data.asset_groups_synced} asset groups
      {data.duration_seconds > 0 && ` in ${data.duration_seconds.toFixed(1)}s`}
    </div>
  );
}
