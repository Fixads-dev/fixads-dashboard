"use client";

import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCompact, formatCurrency } from "@/shared/lib/format";
import type { BadAsset } from "../types";
import { BadAssetChip } from "./bad-asset-chip";

interface BadAssetCardProps {
  asset: BadAsset;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export function BadAssetCard({ asset, isSelected, onToggle }: BadAssetCardProps) {
  return (
    <Card className={isSelected ? "ring-2 ring-primary" : ""}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <Checkbox id={asset.id} checked={isSelected} onCheckedChange={() => onToggle(asset.id)} />
          <BadAssetChip classification={asset.classification} />
        </div>
        <span className="text-xs text-muted-foreground uppercase">{asset.assetType}</span>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Current Text</p>
          <p className="text-sm rounded bg-destructive/10 p-2 text-destructive">{asset.text}</p>
        </div>

        {asset.suggestedReplacement && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <ArrowRight className="h-3 w-3" />
              Suggested Replacement
            </p>
            <p className="text-sm rounded bg-primary/10 p-2 text-primary">
              {asset.suggestedReplacement}
            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground">{asset.reason}</p>

        <div className="grid grid-cols-4 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Impressions</p>
            <p className="font-medium">{formatCompact(asset.metrics.impressions)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Clicks</p>
            <p className="font-medium">{formatCompact(asset.metrics.clicks)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Cost</p>
            <p className="font-medium">{formatCurrency(asset.metrics.cost)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Age</p>
            <p className="font-medium">{asset.metrics.age}d</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
