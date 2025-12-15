"use client";

import { Loader2, Play, Sparkles, Type } from "lucide-react";
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
  OptimizationProgress,
  SuggestionCard,
  useApplyTextChanges,
  useTextOptimizerAnalyze,
  useTextOptimizerStatus,
} from "@/features/optimizer";
import { EmptyState } from "@/shared/components";

export function TextOptimizerContent() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [selectedAssetGroupId, setSelectedAssetGroupId] = useState<string>("");
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [runId, setRunId] = useState<string | null>(null);

  const { data: accounts } = useAccounts();
  const { data: campaigns } = useCampaigns(
    selectedAccountId ? { accountId: selectedAccountId } : undefined,
  );
  const { data: assetGroups } = useAssetGroups(selectedAccountId, selectedCampaignId);

  const { mutate: analyze, isPending: isAnalyzing } = useTextOptimizerAnalyze();
  const { data: statusData } = useTextOptimizerStatus(runId);
  const { mutate: applyChanges, isPending: isApplying } = useApplyTextChanges();

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
          setSelectedSuggestions(new Set());
        },
      },
    );
  };

  const handleApply = () => {
    if (!selectedAccountId || !selectedCampaignId || !selectedAssetGroupId) return;
    if (selectedSuggestions.size === 0) return;

    const changes = statusData?.suggestions
      .filter((s) => selectedSuggestions.has(s.id))
      .map((s) => ({ assetId: s.assetId, newText: s.suggestedText }));

    if (!changes?.length) return;

    applyChanges({
      accountId: selectedAccountId,
      campaignId: selectedCampaignId,
      assetGroupId: selectedAssetGroupId,
      changes,
    });
  };

  const toggleSuggestion = (id: string) => {
    setSelectedSuggestions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (statusData?.suggestions) {
      setSelectedSuggestions(new Set(statusData.suggestions.map((s) => s.id)));
    }
  };

  const isReady = selectedAccountId && selectedCampaignId && selectedAssetGroupId;
  const isProcessing = statusData?.status === "pending" || statusData?.status === "processing";
  const hasResults = statusData?.status === "completed" && statusData.suggestions.length > 0;

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
          <CardDescription>Choose an account, campaign, and asset group to analyze</CardDescription>
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
                Analyze Assets
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
            <h2 className="text-lg font-semibold">Suggestions ({statusData.suggestions.length})</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                disabled={selectedSuggestions.size === 0 || isApplying}
              >
                {isApplying ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Apply ({selectedSuggestions.size})
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {statusData.suggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                isSelected={selectedSuggestions.has(suggestion.id)}
                onToggle={toggleSuggestion}
              />
            ))}
          </div>
        </div>
      )}

      {statusData?.status === "completed" && statusData.suggestions.length === 0 && (
        <EmptyState
          icon={Sparkles}
          title="No suggestions found"
          description="Your ad copy looks great! No improvements needed at this time."
        />
      )}
    </div>
  );
}
