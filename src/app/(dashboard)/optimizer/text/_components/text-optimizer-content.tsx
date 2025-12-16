"use client";

import { Loader2, Play, Sparkles, Type } from "lucide-react";
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
import { useCampaigns } from "@/features/campaigns";
import {
  type AnalyzedAssetGroup,
  type TextOptimizerResponse,
  useApplyTextChanges,
  useTextOptimizerAnalyze,
} from "@/features/optimizer";
import { EmptyState } from "@/shared/components";

export function TextOptimizerContent() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [campaignDescription, setCampaignDescription] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<TextOptimizerResponse | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());

  const { data: accounts } = useAccounts();
  const { data: campaigns } = useCampaigns(
    selectedAccountId ? { account_id: selectedAccountId } : undefined,
  );

  const { mutate: analyze, isPending: isAnalyzing } = useTextOptimizerAnalyze();
  const { mutate: applyChanges, isPending: isApplying } = useApplyTextChanges();

  const handleAnalyze = () => {
    if (!selectedAccountId || !selectedCampaignId || !campaignDescription) return;

    analyze(
      {
        accountId: selectedAccountId,
        request: {
          campaign_id: selectedCampaignId,
          campaign_description: campaignDescription,
        },
      },
      {
        onSuccess: (data) => {
          setAnalysisResult(data);
          setSelectedAssets(new Set());
        },
      },
    );
  };

  const handleApply = () => {
    if (!selectedAccountId || !analysisResult || selectedAssets.size === 0) return;

    // Build apply request from selected suggestions
    const assetGroupsToApply = analysisResult.asset_groups
      .filter((ag) =>
        ag.suggested_assets.some((sa) =>
          selectedAssets.has(`${ag.asset_group_id}-${sa.field_type}-${sa.text}`),
        ),
      )
      .map((ag) => ({
        asset_group_id: ag.asset_group_id,
        asset_group_name: ag.asset_group_name,
        suggested_assets: ag.suggested_assets
          .filter((sa) => selectedAssets.has(`${ag.asset_group_id}-${sa.field_type}-${sa.text}`))
          .map((sa) => ({
            field_type: sa.field_type,
            text: sa.text,
            reason: sa.reason,
          })),
      }));

    if (assetGroupsToApply.length === 0) return;

    applyChanges(
      {
        accountId: selectedAccountId,
        request: {
          campaign_id: analysisResult.campaign_id,
          asset_groups: assetGroupsToApply,
        },
      },
      {
        onSuccess: () => {
          setAnalysisResult(null);
          setSelectedAssets(new Set());
        },
      },
    );
  };

  const toggleAsset = (assetKey: string) => {
    setSelectedAssets((prev) => {
      const next = new Set(prev);
      if (next.has(assetKey)) {
        next.delete(assetKey);
      } else {
        next.add(assetKey);
      }
      return next;
    });
  };

  const selectAllInGroup = (group: AnalyzedAssetGroup) => {
    setSelectedAssets((prev) => {
      const next = new Set(prev);
      for (const sa of group.suggested_assets) {
        next.add(`${group.asset_group_id}-${sa.field_type}-${sa.text}`);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (!analysisResult) return;
    const allKeys = new Set<string>();
    for (const ag of analysisResult.asset_groups) {
      for (const sa of ag.suggested_assets) {
        allKeys.add(`${ag.asset_group_id}-${sa.field_type}-${sa.text}`);
      }
    }
    setSelectedAssets(allKeys);
  };

  // Helper to get display name for account
  const getAccountDisplayName = (acc: { descriptive_name: string | null; customer_id: string }) =>
    acc.descriptive_name ?? acc.customer_id;

  const isReady = selectedAccountId && selectedCampaignId && campaignDescription.trim();
  const totalSuggestions =
    analysisResult?.asset_groups.reduce((sum, ag) => sum + ag.suggested_assets.length, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Text Optimizer</h1>
        <p className="text-muted-foreground">Improve your ad copy with AI-powered suggestions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Select Campaign
          </CardTitle>
          <CardDescription>Choose an account and campaign to analyze</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
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
                    {campaign.campaign_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="campaign-description" className="text-sm font-medium">
              Campaign Description
            </label>
            <Textarea
              id="campaign-description"
              placeholder="Describe your product or service to help generate better suggestions..."
              value={campaignDescription}
              onChange={(e) => setCampaignDescription(e.target.value)}
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
                Analyze Assets
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysisResult && totalSuggestions > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Suggestions for {analysisResult.campaign_name}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All ({totalSuggestions})
              </Button>
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
                Apply ({selectedAssets.size})
              </Button>
            </div>
          </div>

          {analysisResult.asset_groups.map((group) => (
            <Card key={group.asset_group_id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{group.asset_group_name}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => selectAllInGroup(group)}>
                    Select All
                  </Button>
                </div>
                {group.issues.length > 0 && (
                  <CardDescription className="text-amber-600">
                    Issues: {group.issues.join(", ")}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {group.suggested_assets.map((suggestion) => {
                  const key = `${group.asset_group_id}-${suggestion.field_type}-${suggestion.text}`;
                  return (
                    <div key={key} className="flex items-start gap-3 rounded-lg border p-3">
                      <Checkbox
                        checked={selectedAssets.has(key)}
                        onCheckedChange={() => toggleAsset(key)}
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground uppercase">
                            {suggestion.field_type}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{suggestion.text}</p>
                        {suggestion.reason && (
                          <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {group.suggested_assets.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No suggestions for this asset group
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {analysisResult && totalSuggestions === 0 && (
        <div className="space-y-4">
          <EmptyState
            icon={Sparkles}
            title="No suggestions found"
            description="Your ad copy looks great! No improvements needed at this time."
          />

          {/* Show existing assets even when no suggestions */}
          {analysisResult.asset_groups.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Current Assets</CardTitle>
                <CardDescription>
                  Found {analysisResult.asset_groups.length} asset group(s) with existing text
                  assets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysisResult.asset_groups.map((group) => (
                  <div key={group.asset_group_id} className="space-y-2">
                    <p className="text-sm font-medium">{group.asset_group_name}</p>
                    {group.existing_assets.length > 0 ? (
                      <div className="space-y-1">
                        {group.existing_assets.map((asset, idx) => (
                          <div
                            key={`${asset.resource_name}-${idx}`}
                            className="flex items-center justify-between rounded border p-2 text-sm"
                          >
                            <span className="flex-1">{asset.text}</span>
                            <span className="ml-2 text-xs text-muted-foreground uppercase">
                              {asset.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No text assets in this group</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
