"use client";

import { FlaskConical, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AssetProbability } from "@/features/experimentation";
import {
  AssetRankingTable,
  MABStateCard,
  useCampaignProbabilities,
  WinProbabilityChart,
} from "@/features/experimentation";

interface ExperimentationTabProps {
  campaignId: string;
}

type ViewMode = "chart" | "table" | "cards";

export function ExperimentationTab({ campaignId }: ExperimentationTabProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("chart");
  const [selectedAsset, setSelectedAsset] = useState<AssetProbability | null>(null);

  const {
    data: probabilities,
    isLoading,
    refetch,
    isFetching,
  } = useCampaignProbabilities(campaignId);

  const handleAssetClick = (asset: AssetProbability) => {
    setSelectedAsset(asset);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!probabilities || probabilities.assets.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FlaskConical className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            No experimentation data available for this campaign
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            MAB states are initialized when assets start receiving impressions
          </p>
        </CardContent>
      </Card>
    );
  }

  const { assets, total_assets, platform } = probabilities;

  // Calculate summary statistics
  const avgWinProb = assets.reduce((sum, a) => sum + a.win_probability, 0) / assets.length;
  const topPerformers = assets.filter((a) => a.win_probability >= 0.1).length;
  const decayedCount = assets.filter((a) => a.status === "DECAYED").length;
  const learningCount = assets.filter((a) => a.status === "LEARNING").length;

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Thompson Sampling Analysis</h3>
          <p className="text-sm text-muted-foreground">
            {total_assets} assets tracked on {platform}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chart">Chart</SelectItem>
              <SelectItem value="table">Table</SelectItem>
              <SelectItem value="cards">Cards</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Assets</CardDescription>
            <CardTitle className="text-2xl">{total_assets}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Win Probability</CardDescription>
            <CardTitle className="text-2xl">{(avgWinProb * 100).toFixed(2)}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Top Performers</CardDescription>
            <CardTitle className="text-2xl text-green-600">{topPerformers}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Status</CardDescription>
            <CardTitle className="text-xl">
              <span className="text-blue-600">{learningCount} Learning</span>
              {decayedCount > 0 && (
                <span className="text-red-600 ml-2">{decayedCount} Decayed</span>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content based on view mode */}
      {viewMode === "chart" && (
        <WinProbabilityChart
          assets={assets}
          title="Asset Win Probabilities"
          description="Ranked by Thompson Sampling expected value"
          maxDisplay={15}
        />
      )}

      {viewMode === "table" && (
        <AssetRankingTable
          assets={assets}
          title="Asset Performance Ranking"
          description="Sortable table of all MAB states"
          onAssetClick={handleAssetClick}
        />
      )}

      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets
            .sort((a, b) => b.win_probability - a.win_probability)
            .slice(0, 12)
            .map((asset) => (
              <MABStateCard
                key={asset.asset_id}
                asset={asset}
                showDetails={true}
                onClick={() => handleAssetClick(asset)}
              />
            ))}
        </div>
      )}

      {/* Asset Detail Modal/Panel - shown when an asset is selected */}
      {selectedAsset && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Asset Detail</CardTitle>
                <CardDescription>{selectedAsset.asset_id}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedAsset(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Win Probability</p>
                <p className="text-lg font-semibold">
                  {(selectedAsset.win_probability * 100).toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Beta Distribution</p>
                <p className="text-lg font-mono">
                  Beta({selectedAsset.alpha.toFixed(2)}, {selectedAsset.beta.toFixed(2)})
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mature Clicks</p>
                <p className="text-lg font-semibold">
                  {selectedAsset.mature_clicks.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversions</p>
                <p className="text-lg font-semibold">
                  {selectedAsset.mature_conversions.toLocaleString()}
                </p>
              </div>
              {selectedAsset.z_score != null && (
                <div>
                  <p className="text-sm text-muted-foreground">Z-Score</p>
                  <p
                    className={`text-lg font-mono ${selectedAsset.z_score < -1.96 ? "text-red-600" : "text-green-600"}`}
                  >
                    {selectedAsset.z_score.toFixed(3)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
