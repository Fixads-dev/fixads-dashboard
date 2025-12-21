"use client";

import { Link, Loader2, Play, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAccounts } from "@/features/accounts";
import { useAssetGroups, useCampaigns } from "@/features/campaigns";
import {
  type AssetToRemove,
  type SmartOptimizerResponse,
  useApplySmartChanges,
  useSmartOptimizerAnalyze,
} from "@/features/optimizer";
import { EmptyState } from "@/shared/components";
import { BadAssetsCard, CampaignSelector } from "../../_components";
import { AssetTypeSelector, GeneratedAssetsCard, GenerationSummary } from "./sub-components";

const getRemovalId = (asset: AssetToRemove): string =>
  asset.asset_group_asset_resource_name || asset.asset_id;

export function SmartOptimizerContent() {
  // Selection state
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [selectedAssetGroupId, setSelectedAssetGroupId] = useState("");
  const [finalUrl, setFinalUrl] = useState("");
  const [assetFieldTypes, setAssetFieldTypes] = useState<Set<string>>(
    new Set(["HEADLINE", "DESCRIPTION"]),
  );
  const [freeformPrompt, setFreeformPrompt] = useState("");
  const [keywords, setKeywords] = useState("");

  // Results state
  const [analysisResult, setAnalysisResult] = useState<SmartOptimizerResponse | null>(null);
  const [selectedToRemove, setSelectedToRemove] = useState<Set<string>>(new Set());
  const [selectedToAdd, setSelectedToAdd] = useState<Set<number>>(new Set());

  // Data fetching
  const { data: accounts, isPending: isLoadingAccounts, isError: isAccountsError } = useAccounts();
  const {
    data: campaigns,
    isPending: isLoadingCampaigns,
    isError: isCampaignsError,
  } = useCampaigns(selectedAccountId ? { account_id: selectedAccountId } : undefined);
  const {
    data: assetGroups,
    isPending: isLoadingAssetGroups,
    isError: isAssetGroupsError,
  } = useAssetGroups(selectedAccountId, selectedCampaignId);

  // Mutations
  const { mutate: analyze, isPending: isAnalyzing } = useSmartOptimizerAnalyze();
  const { mutate: applyChanges, isPending: isApplying } = useApplySmartChanges();

  // Handlers
  const handleAnalyze = () => {
    if (
      !selectedAccountId ||
      !selectedCampaignId ||
      !selectedAssetGroupId ||
      !finalUrl ||
      assetFieldTypes.size === 0
    )
      return;

    const keywordList = keywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    analyze(
      {
        accountId: selectedAccountId,
        request: {
          campaign_id: selectedCampaignId,
          asset_group_id: selectedAssetGroupId,
          final_url: finalUrl,
          asset_field_types: Array.from(assetFieldTypes),
          freeform_prompt: freeformPrompt || undefined,
          keywords: keywordList.length > 0 ? keywordList : undefined,
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
    if (
      !selectedAccountId ||
      !analysisResult ||
      (selectedToRemove.size === 0 && selectedToAdd.size === 0)
    )
      return;

    const assetsToAdd = analysisResult.generated_assets
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

  const toggleAssetFieldType = (type: string) => {
    setAssetFieldTypes((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const toggleRemove = (asset: AssetToRemove) => {
    const id = getRemovalId(asset);
    setSelectedToRemove((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAdd = (index: number) => {
    setSelectedToAdd((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const selectAllBadAssets = () => {
    if (analysisResult?.assets_to_remove) {
      setSelectedToRemove(new Set(analysisResult.assets_to_remove.map(getRemovalId)));
    }
  };

  const selectAllCompliantSuggestions = () => {
    if (analysisResult?.generated_assets) {
      const indices = analysisResult.generated_assets
        .map((a, i) => (a.compliance_passed ? i : -1))
        .filter((i) => i !== -1);
      setSelectedToAdd(new Set(indices));
    }
  };

  // URL validation
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Computed
  const isReady =
    selectedAccountId &&
    selectedCampaignId &&
    selectedAssetGroupId &&
    finalUrl.trim() &&
    isValidUrl(finalUrl) &&
    assetFieldTypes.size > 0;
  const hasResults = analysisResult !== null;
  const totalChanges = selectedToRemove.size + selectedToAdd.size;
  const noChangesFound =
    hasResults &&
    analysisResult.generated_assets.length === 0 &&
    analysisResult.assets_to_remove.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Smart Optimizer</h1>
        <p className="text-muted-foreground">
          Generate optimized assets using Google Ads AI from your landing page
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-500" />
            Generate Assets from URL
          </CardTitle>
          <CardDescription>
            Enter your landing page URL to generate AI-powered headlines and descriptions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CampaignSelector
            accounts={accounts}
            campaigns={campaigns}
            assetGroups={assetGroups}
            selectedAccountId={selectedAccountId}
            selectedCampaignId={selectedCampaignId}
            selectedAssetGroupId={selectedAssetGroupId}
            onAccountChange={setSelectedAccountId}
            onCampaignChange={setSelectedCampaignId}
            onAssetGroupChange={setSelectedAssetGroupId}
            isLoadingAccounts={isLoadingAccounts}
            isLoadingCampaigns={isLoadingCampaigns}
            isLoadingAssetGroups={isLoadingAssetGroups}
            isAccountsError={isAccountsError}
            isCampaignsError={isCampaignsError}
            isAssetGroupsError={isAssetGroupsError}
          />

          <UrlInput
            value={finalUrl}
            onChange={setFinalUrl}
            disabled={!selectedAssetGroupId}
            isValid={!finalUrl || isValidUrl(finalUrl)}
          />

          <AssetTypeSelector
            selectedTypes={assetFieldTypes}
            onToggle={toggleAssetFieldType}
            disabled={!selectedAssetGroupId}
          />

          <CustomPromptInput
            value={freeformPrompt}
            onChange={setFreeformPrompt}
            disabled={!selectedAssetGroupId}
          />
          <KeywordsInput value={keywords} onChange={setKeywords} disabled={!selectedAssetGroupId} />

          <Button onClick={handleAnalyze} disabled={!isReady || isAnalyzing}>
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Assets...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Generate Assets
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {hasResults && (
        <div className="space-y-6">
          <GenerationSummary result={analysisResult} />

          <GeneratedAssetsCard
            assets={analysisResult.generated_assets}
            selectedIndices={selectedToAdd}
            onToggle={toggleAdd}
            onSelectAll={selectAllCompliantSuggestions}
            isApplying={isApplying}
          />

          <BadAssetsCard
            assets={analysisResult.assets_to_remove}
            selectedIds={selectedToRemove}
            onToggle={toggleRemove}
            onSelectAll={selectAllBadAssets}
            isApplying={isApplying}
            getRemovalId={getRemovalId}
          />

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

      {noChangesFound && (
        <EmptyState
          icon={Sparkles}
          title="No assets generated"
          description="Unable to generate assets from the provided URL. Try a different landing page or add custom instructions."
        />
      )}
    </div>
  );
}

// Sub-components for inputs
function UrlInput({
  value,
  onChange,
  disabled,
  isValid,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  isValid: boolean;
}) {
  return (
    <div>
      <label htmlFor="final-url" className="text-sm font-medium flex items-center gap-2">
        <Link className="h-4 w-4" />
        Landing Page URL
      </label>
      <Input
        id="final-url"
        type="url"
        placeholder="https://example.com/landing-page"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5"
        disabled={disabled}
      />
      {value && !isValid && (
        <p className="text-xs text-destructive mt-1">Please enter a valid URL</p>
      )}
    </div>
  );
}

function CustomPromptInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <label htmlFor="freeform-prompt" className="text-sm font-medium">
        Custom Instructions (Optional)
      </label>
      <Textarea
        id="freeform-prompt"
        placeholder="Add custom instructions for the AI, e.g., 'Focus on eco-friendly messaging' or 'Highlight free shipping'"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5"
        rows={2}
        disabled={disabled}
      />
    </div>
  );
}

function KeywordsInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <label htmlFor="keywords" className="text-sm font-medium">
        Keywords to Include (Optional)
      </label>
      <Input
        id="keywords"
        placeholder="Enter keywords separated by commas, e.g., free shipping, 24/7 support, eco-friendly"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5"
        disabled={disabled}
      />
      <p className="text-xs text-muted-foreground mt-1">
        These keywords will be incorporated into the generated assets
      </p>
    </div>
  );
}
