"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { type AssetToRemove, BadAssetChip } from "@/features/optimizer";
import { formatCurrency } from "@/shared/lib/format";

interface BadAssetsCardProps {
  assets: AssetToRemove[];
  selectedIds: Set<string>;
  onToggle: (asset: AssetToRemove) => void;
  onSelectAll: () => void;
  isApplying: boolean;
  getRemovalId: (asset: AssetToRemove) => string;
}

function AssetMetrics({ metrics }: { metrics: AssetToRemove["metrics"] }) {
  if (!metrics) return null;
  return (
    <div className="flex gap-4 text-xs text-muted-foreground">
      <span>Impressions: {metrics.impressions ?? 0}</span>
      <span>Clicks: {metrics.clicks ?? 0}</span>
      <span>Cost: {formatCurrency((metrics.cost_micros ?? 0) / 1_000_000)}</span>
      <span>Conversions: {metrics.conversions ?? 0}</span>
    </div>
  );
}

export function BadAssetsCard({
  assets,
  selectedIds,
  onToggle,
  onSelectAll,
  isApplying,
  getRemovalId,
}: BadAssetsCardProps) {
  if (assets.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-destructive">Bad Assets ({assets.length})</CardTitle>
            <CardDescription>Select underperforming assets to remove</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onSelectAll} disabled={isApplying}>
            Select All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {assets.map((asset) => {
          const id = getRemovalId(asset);
          return (
            <div key={id} className="flex items-start gap-3 rounded-lg border p-3">
              <Checkbox
                checked={selectedIds.has(id)}
                onCheckedChange={() => onToggle(asset)}
                disabled={isApplying}
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <BadAssetChip classification={asset.reason_code} />
                  <span className="text-xs text-muted-foreground">
                    Score: {asset.severity_score}
                  </span>
                </div>
                <p className="text-sm">{asset.text}</p>
                <AssetMetrics metrics={asset.metrics} />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
