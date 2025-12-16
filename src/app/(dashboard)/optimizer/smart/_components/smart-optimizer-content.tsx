"use client";

import { Loader2, Play, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAccounts } from "@/features/accounts";
import { useAssetGroups, useCampaigns } from "@/features/campaigns";
import {
  type AssetToRemove,
  BadAssetChip,
  type SmartOptimizerResponse,
  useApplySmartChanges,
  useSmartOptimizerAnalyze,
} from "@/features/optimizer";
import { EmptyState } from "@/shared/components";
import { formatCurrency } from "@/shared/lib/format";

export function SmartOptimizerContent() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [selectedAssetGroupId, setSelectedAssetGroupId] = useState<string>("");
  const [productDescription, setProductDescription] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<SmartOptimizerResponse | null>(null);
  const [selectedToRemove, setSelectedToRemove] = useState<Set<string>>(new Set());
  const [selectedToAdd, setSelectedToAdd] = useState<Set<number>>(new Set());

  const { data: accounts } = useAccounts();
  const { data: campaigns } = useCampaigns(
    selectedAccountId ? { account_id: selectedAccountId } : undefined,
  );
  const { data: assetGroups } = useAssetGroups(selectedAccountId, selectedCampaignId);

  const { mutate: analyze, isPending: isAnalyzing } = useSmartOptimizerAnalyze();
  const { mutate: applyChanges, isPending: isApplying } = useApplySmartChanges();

  const handleAnalyze = () => {
    if (!selectedAccountId || !selectedCampaignId || !selectedAssetGroupId || !productDescription)
      return;

    analyze(
      {
        accountId: selectedAccountId,
        request: {
          campaign_id: selectedCampaignId,
          asset_group_id: selectedAssetGroupId,
          product_description: productDescription,
        },
      },
      {
        onSuccess: (data) => {
          setAnalysisResult(data);
          setSelectedToRemove(new Set());
          setSelectedToAdd(new Set());
        },
      },
    );
  };

  const handleApply = () => {
    if (!selectedAccountId || !analysisResult) return;
    if (selectedToRemove.size === 0 && selectedToAdd.size === 0) return;

    const assetsToAdd = analysisResult.assets_to_add
      .filter((_, i) => selectedToAdd.has(i))
      .filter((a) => a.compliance_passed);

    applyChanges(
      {
        accountId: selectedAccountId,
        request: {
          optimization_run_id: analysisResult.optimization_run_id,
          campaign_id: analysisResult.campaign_id,
          asset_group_id: analysisResult.asset_group_id,
          asset_ids_to_remove: Array.from(selectedToRemove),
          assets_to_add: assetsToAdd,
        },
      },
      {
        onSuccess: () => {
          setAnalysisResult(null);
          setSelectedToRemove(new Set());
          setSelectedToAdd(new Set());
        },
      },
    );
  };

  const toggleRemove = (assetId: string) => {
    setSelectedToRemove((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }
      return next;
    });
  };

  const toggleAdd = (index: number) => {
    setSelectedToAdd((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const selectAllBadAssets = () => {
    if (analysisResult?.assets_to_remove) {
      setSelectedToRemove(new Set(analysisResult.assets_to_remove.map((a) => a.asset_id)));
    }
  };

  const selectAllCompliantSuggestions = () => {
    if (analysisResult?.assets_to_add) {
      const compliantIndices = analysisResult.assets_to_add
        .map((a, i) => (a.compliance_passed ? i : -1))
        .filter((i) => i !== -1);
      setSelectedToAdd(new Set(compliantIndices));
    }
  };

  // Helper to get display name for account
  const getAccountDisplayName = (acc: { descriptive_name: string | null; customer_id: string }) =>
    acc.descriptive_name ?? acc.customer_id;

  const isReady =
    selectedAccountId && selectedCampaignId && selectedAssetGroupId && productDescription.trim();
  const hasResults = analysisResult !== null;
  const totalChanges = selectedToRemove.size + selectedToAdd.size;

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
                {accounts?.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {getAccountDisplayName(account)}
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
                {campaigns?.map((campaign) => (
                  <SelectItem key={campaign.campaign_id} value={campaign.campaign_id}>
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
                {assetGroups?.map((group) => (
                  <SelectItem key={group.asset_group_id} value={group.asset_group_id}>
                    {group.asset_group_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="product-description" className="text-sm font-medium">
              Product Description
            </label>
            <Textarea
              id="product-description"
              placeholder="Describe your product or service for AI-powered suggestions..."
              value={productDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setProductDescription(e.target.value)
              }
              className="mt-1.5"
              rows={3}
            />
          </div>

          <Button onClick={handleAnalyze} disabled={!isReady || isAnalyzing}>
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
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

      {hasResults && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Summary</CardTitle>
              <CardDescription>
                Campaign: {analysisResult.campaign_name} / {analysisResult.asset_group_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Analyzed</p>
                  <p className="text-lg font-semibold">{analysisResult.summary.total_analyzed}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Bad Assets</p>
                  <p className="text-lg font-semibold text-destructive">
                    {analysisResult.assets_to_remove.length}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Suggestions</p>
                  <p className="text-lg font-semibold">{analysisResult.assets_to_add.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Compliant</p>
                  <p className="text-lg font-semibold text-green-600">
                    {analysisResult.summary.compliant_suggestions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bad Assets to Remove */}
          {analysisResult.assets_to_remove.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-destructive">
                      Bad Assets ({analysisResult.assets_to_remove.length})
                    </CardTitle>
                    <CardDescription>Select assets to remove</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={selectAllBadAssets}>
                    Select All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysisResult.assets_to_remove.map((asset: AssetToRemove) => (
                  <div
                    key={asset.asset_id}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <Checkbox
                      checked={selectedToRemove.has(asset.asset_id)}
                      onCheckedChange={() => toggleRemove(asset.asset_id)}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <BadAssetChip classification={asset.reason_code} />
                        <span className="text-xs text-muted-foreground">
                          Score: {asset.severity_score}
                        </span>
                      </div>
                      <p className="text-sm">{asset.text}</p>
                      {asset.metrics && (
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Impressions: {asset.metrics.impressions}</span>
                          <span>Clicks: {asset.metrics.clicks}</span>
                          <span>Cost: {formatCurrency(asset.metrics.cost)}</span>
                          <span>Conversions: {asset.metrics.conversions}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Suggested Assets to Add */}
          {analysisResult.assets_to_add.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      Suggested Replacements ({analysisResult.assets_to_add.length})
                    </CardTitle>
                    <CardDescription>Select assets to add</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={selectAllCompliantSuggestions}>
                    Select All Compliant
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysisResult.assets_to_add.map((asset, index) => (
                  <div
                    key={`${asset.asset_type}-${index}`}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <Checkbox
                      checked={selectedToAdd.has(index)}
                      onCheckedChange={() => toggleAdd(index)}
                      disabled={!asset.compliance_passed}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                          {asset.asset_type}
                        </span>
                        {asset.compliance_passed ? (
                          <span className="text-xs text-green-600">Compliant</span>
                        ) : (
                          <span className="text-xs text-destructive">Non-compliant</span>
                        )}
                      </div>
                      <p className="text-sm font-medium">{asset.text}</p>
                      {asset.compliance_violations && asset.compliance_violations.length > 0 && (
                        <p className="text-xs text-destructive">
                          Issues: {asset.compliance_violations.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Apply Button */}
          <div className="flex justify-end">
            <Button onClick={handleApply} disabled={totalChanges === 0 || isApplying}>
              {isApplying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Apply Changes ({totalChanges})
            </Button>
          </div>
        </div>
      )}

      {hasResults &&
        analysisResult.assets_to_remove.length === 0 &&
        analysisResult.assets_to_add.length === 0 && (
          <EmptyState
            icon={Sparkles}
            title="No bad assets found"
            description="Your assets are performing well! No underperforming assets detected."
          />
        )}
    </div>
  );
}
