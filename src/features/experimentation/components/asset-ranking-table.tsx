"use client";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Pause,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { AssetProbability, MABStateStatus } from "../types";

type SortField = "win_probability" | "alpha" | "mature_clicks" | "mature_conversions" | "z_score";
type SortDirection = "asc" | "desc";

interface AssetRankingTableProps {
  assets: AssetProbability[];
  title?: string;
  description?: string;
  onAssetClick?: (asset: AssetProbability) => void;
}

/**
 * Get status badge config
 */
function getStatusConfig(status: MABStateStatus) {
  switch (status) {
    case "LEARNING":
      return { variant: "secondary" as const, icon: Clock, label: "Learning" };
    case "STABLE":
      return { variant: "default" as const, icon: CheckCircle2, label: "Stable" };
    case "DECAYED":
      return { variant: "destructive" as const, icon: AlertTriangle, label: "Decayed" };
    case "PAUSED":
      return { variant: "outline" as const, icon: Pause, label: "Paused" };
    default:
      return { variant: "secondary" as const, icon: Clock, label: status };
  }
}

/**
 * Get performance color based on win probability
 */
function getPerformanceColor(probability: number): string {
  if (probability >= 0.1) return "text-green-600";
  if (probability >= 0.05) return "text-yellow-600";
  if (probability >= 0.02) return "text-orange-600";
  return "text-red-600";
}

export function AssetRankingTable({
  assets,
  title = "Asset Performance Ranking",
  description = "Thompson Sampling belief states sorted by win probability",
  onAssetClick,
}: AssetRankingTableProps) {
  const [sortField, setSortField] = useState<SortField>("win_probability");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedAssets = [...assets].sort((a, b) => {
    let aVal: number;
    let bVal: number;

    switch (sortField) {
      case "win_probability":
        aVal = a.win_probability;
        bVal = b.win_probability;
        break;
      case "alpha":
        aVal = a.alpha;
        bVal = b.alpha;
        break;
      case "mature_clicks":
        aVal = a.mature_clicks;
        bVal = b.mature_clicks;
        break;
      case "mature_conversions":
        aVal = a.mature_conversions;
        bVal = b.mature_conversions;
        break;
      case "z_score":
        aVal = a.z_score ?? 0;
        bVal = b.z_score ?? 0;
        break;
      default:
        return 0;
    }

    return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (field !== sortField) return <ArrowUpDown className="h-3 w-3 ml-1" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1" />
    );
  };

  if (assets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No MAB states available for this campaign
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description} ({assets.length} assets)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 -ml-2"
                  onClick={() => handleSort("win_probability")}
                >
                  Win Prob
                  <SortIcon field="win_probability" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 -ml-2"
                  onClick={() => handleSort("alpha")}
                >
                  Beta Dist
                  <SortIcon field="alpha" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 -ml-2"
                  onClick={() => handleSort("mature_clicks")}
                >
                  Clicks
                  <SortIcon field="mature_clicks" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 -ml-2"
                  onClick={() => handleSort("mature_conversions")}
                >
                  Conversions
                  <SortIcon field="mature_conversions" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 -ml-2"
                  onClick={() => handleSort("z_score")}
                >
                  Z-Score
                  <SortIcon field="z_score" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAssets.map((asset, index) => {
              const statusConfig = getStatusConfig(asset.status);
              const StatusIcon = statusConfig.icon;
              const conversionRate =
                asset.mature_clicks > 0
                  ? ((asset.mature_conversions / asset.mature_clicks) * 100).toFixed(1)
                  : "0.0";

              return (
                <TableRow
                  key={asset.asset_id}
                  className={cn(onAssetClick && "cursor-pointer")}
                  onClick={() => onAssetClick?.(asset)}
                >
                  <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px]">
                      <p className="font-medium truncate">{asset.asset_id.slice(0, 12)}...</p>
                      <p className="text-xs text-muted-foreground">{asset.prior_context}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig.variant} className="flex items-center gap-1 w-fit">
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "font-mono font-semibold",
                        getPerformanceColor(asset.win_probability),
                      )}
                    >
                      {(asset.win_probability * 100).toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      Beta({asset.alpha.toFixed(1)}, {asset.beta.toFixed(1)})
                    </span>
                  </TableCell>
                  <TableCell className="font-mono">
                    {asset.mature_clicks.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono">{asset.mature_conversions.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground ml-1">({conversionRate}%)</span>
                  </TableCell>
                  <TableCell>
                    {asset.z_score != null ? (
                      <span
                        className={cn(
                          "font-mono",
                          asset.z_score < -1.96 ? "text-red-600" : "text-green-600",
                        )}
                      >
                        {asset.z_score.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
