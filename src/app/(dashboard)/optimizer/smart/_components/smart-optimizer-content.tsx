"use client";

import { Loader2, Play, Sparkles, Zap } from "lucide-react";
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
import { useAccounts } from "@/features/accounts";
import { useAssetGroups, useCampaigns } from "@/features/campaigns";
import {
  BadAssetCard,
  OptimizationProgress,
  useApplySmartChanges,
  useSmartOptimizerAnalyze,
  useSmartOptimizerStatus,
} from "@/features/optimizer";
import { EmptyState } from "@/shared/components";

export function SmartOptimizerContent() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [selectedAssetGroupId, setSelectedAssetGroupId] = useState<string>("");
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [runId, setRunId] = useState<string | null>(null);

  const { data: accounts } = useAccounts();
  const { data: campaigns } = useCampaigns(
    selectedAccountId ? { accountId: selectedAccountId } : undefined,
  );
  const { data: assetGroups } = useAssetGroups(selectedAccountId, selectedCampaignId);

  const { mutate: analyze, isPending: isAnalyzing } = useSmartOptimizerAnalyze();
  const { data: statusData } = useSmartOptimizerStatus(runId);
  const { mutate: applyChanges, isPending: isApplying } = useApplySmartChanges();

  const handleAnalyze = () => {
    if (!selectedAccountId || !selectedCampaignId || !selectedAssetGroupId) return;

    analyze(
      {
        accountId: selectedAccountId,
        campaignId: selectedCampaignId,
        assetGroupId: selectedAssetGroupId,
      },
      {
        onSuccess: (data) => {
          setRunId(data.runId);
          setSelectedAssets(new Set());
        },
      },
    );
  };

  const handleApply = () => {
    if (!selectedAccountId || !selectedCampaignId || !selectedAssetGroupId) return;
    if (selectedAssets.size === 0) return;

    const changes = statusData?.badAssets
      .filter((a) => selectedAssets.has(a.id) && a.suggestedReplacement)
      .map((a) => ({ assetId: a.assetId, newText: a.suggestedReplacement as string }));

    if (!changes?.length) return;

    applyChanges({
      accountId: selectedAccountId,
      campaignId: selectedCampaignId,
      assetGroupId: selectedAssetGroupId,
      changes,
    });
  };

  const toggleAsset = (id: string) => {
    setSelectedAssets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllWithSuggestions = () => {
    if (statusData?.badAssets) {
      const withSuggestions = statusData.badAssets
        .filter((a) => a.suggestedReplacement)
        .map((a) => a.id);
      setSelectedAssets(new Set(withSuggestions));
    }
  };

  const isReady = selectedAccountId && selectedCampaignId && selectedAssetGroupId;
  const isProcessing = statusData?.status === "pending" || statusData?.status === "processing";
  const hasResults = statusData?.status === "completed" && statusData.badAssets.length > 0;
  const assetsWithSuggestions = statusData?.badAssets.filter((a) => a.suggestedReplacement) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Smart Optimizer</h1>
        <p className="text-muted-foreground">Automatically detect and fix underperforming assets</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Select Campaign
          </CardTitle>
          <CardDescription>
            Analyze your assets for ZOMBIE, MONEY_WASTER, CLICKBAIT, and TREND_DROPPER patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts?.items.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.descriptiveName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedCampaignId}
              onValueChange={setSelectedCampaignId}
              disabled={!selectedAccountId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select campaign" />
              </SelectTrigger>
              <SelectContent>
                {campaigns?.items.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedAssetGroupId}
              onValueChange={setSelectedAssetGroupId}
              disabled={!selectedCampaignId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select asset group" />
              </SelectTrigger>
              <SelectContent>
                {assetGroups?.items.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleAnalyze} disabled={!isReady || isAnalyzing || isProcessing}>
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Smart Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {isProcessing && statusData && (
        <OptimizationProgress
          status={statusData.status}
          progress={statusData.progress}
          message={statusData.message}
        />
      )}

      {hasResults && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Bad Assets Found ({statusData.badAssets.length})
              </h2>
              <p className="text-sm text-muted-foreground">
                Analyzed {statusData.totalAnalyzed} assets
              </p>
            </div>
            <div className="flex gap-2">
              {assetsWithSuggestions.length > 0 && (
                <Button variant="outline" size="sm" onClick={selectAllWithSuggestions}>
                  Select All with Suggestions ({assetsWithSuggestions.length})
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleApply}
                disabled={selectedAssets.size === 0 || isApplying}
              >
                {isApplying ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Replace ({selectedAssets.size})
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {statusData.badAssets.map((asset) => (
              <BadAssetCard
                key={asset.id}
                asset={asset}
                isSelected={selectedAssets.has(asset.id)}
                onToggle={toggleAsset}
              />
            ))}
          </div>
        </div>
      )}

      {statusData?.status === "completed" && statusData.badAssets.length === 0 && (
        <EmptyState
          icon={Sparkles}
          title="No bad assets found"
          description="Your assets are performing well! No underperforming assets detected."
        />
      )}
    </div>
  );
}
