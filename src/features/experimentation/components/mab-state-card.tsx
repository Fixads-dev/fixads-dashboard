"use client";

import { Activity, AlertTriangle, CheckCircle2, Clock, Pause, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { AssetProbability, MABStateStatus } from "../types";

interface MABStateCardProps {
  asset: AssetProbability;
  showDetails?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * Get status badge variant and icon
 */
function getStatusConfig(status: MABStateStatus) {
  switch (status) {
    case "LEARNING":
      return {
        variant: "secondary" as const,
        icon: Clock,
        label: "Learning",
        color: "text-blue-600",
      };
    case "STABLE":
      return {
        variant: "default" as const,
        icon: CheckCircle2,
        label: "Stable",
        color: "text-green-600",
      };
    case "DECAYED":
      return {
        variant: "destructive" as const,
        icon: AlertTriangle,
        label: "Decayed",
        color: "text-red-600",
      };
    case "PAUSED":
      return {
        variant: "outline" as const,
        icon: Pause,
        label: "Paused",
        color: "text-gray-500",
      };
    default:
      return {
        variant: "secondary" as const,
        icon: Activity,
        label: status,
        color: "text-gray-600",
      };
  }
}

/**
 * Get performance level based on win probability
 */
function getPerformanceLevel(winProbability: number): {
  level: string;
  color: string;
  bgColor: string;
} {
  if (winProbability >= 0.1) {
    return { level: "High", color: "text-green-700", bgColor: "bg-green-50" };
  }
  if (winProbability >= 0.05) {
    return { level: "Average", color: "text-yellow-700", bgColor: "bg-yellow-50" };
  }
  if (winProbability >= 0.02) {
    return { level: "Below Avg", color: "text-orange-700", bgColor: "bg-orange-50" };
  }
  return { level: "Low", color: "text-red-700", bgColor: "bg-red-50" };
}

export function MABStateCard({ asset, showDetails = true, className, onClick }: MABStateCardProps) {
  const statusConfig = getStatusConfig(asset.status);
  const StatusIcon = statusConfig.icon;
  const performance = getPerformanceLevel(asset.win_probability);

  const winProbPercent = asset.win_probability * 100;
  // Use mature_clicks/mature_conversions (attribution-lag adjusted data)
  const conversionRate =
    asset.mature_clicks > 0 ? (asset.mature_conversions / asset.mature_clicks) * 100 : 0;

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-md hover:border-primary/50",
        className,
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium truncate">
              Asset {asset.asset_id.slice(0, 8)}...
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{asset.prior_context}</p>
          </div>
          <Badge variant={statusConfig.variant} className="flex items-center gap-1 shrink-0">
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Win Probability */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Win Probability</span>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-mono font-semibold">{winProbPercent.toFixed(2)}%</span>
            </div>
          </div>
          <Progress value={Math.min(winProbPercent * 5, 100)} className="h-2" />
          <div className="flex justify-between mt-1">
            <span
              className={cn(
                "text-xs font-medium px-1.5 py-0.5 rounded",
                performance.bgColor,
                performance.color,
              )}
            >
              {performance.level} Performer
            </span>
          </div>
        </div>

        {showDetails && (
          <>
            {/* Beta Distribution */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Alpha (successes)</p>
                <p className="text-sm font-mono font-medium">{asset.alpha.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Beta (failures)</p>
                <p className="text-sm font-mono font-medium">{asset.beta.toFixed(2)}</p>
              </div>
            </div>

            {/* Metrics (mature data only - past attribution window) */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Mature Clicks</p>
                <p className="text-sm font-medium">{asset.mature_clicks.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Conversions</p>
                <p className="text-sm font-medium">
                  {asset.mature_conversions.toLocaleString()}
                  <span className="text-muted-foreground text-xs ml-1">
                    ({conversionRate.toFixed(1)}%)
                  </span>
                </p>
              </div>
            </div>

            {/* Z-Score (if available) */}
            {asset.z_score != null && (
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Decay Z-Score</span>
                  <span
                    className={cn(
                      "text-sm font-mono font-medium",
                      asset.z_score < -1.96 ? "text-red-600" : "text-green-600",
                    )}
                  >
                    {asset.z_score.toFixed(3)}
                  </span>
                </div>
                {asset.z_score < -1.96 && (
                  <p className="text-xs text-red-600 mt-1">
                    Below threshold (-1.96) - marked for decay
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
