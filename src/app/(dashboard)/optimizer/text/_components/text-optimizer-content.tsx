"use client";

import { Globe, Loader2, Play, Sparkles, Type } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAccounts } from "@/features/accounts";
import { useAssetGroups, useCampaigns } from "@/features/campaigns";
import {
  type AssetToRemove,
  type TextOptimizerResponse,
  useApplyTextChanges,
  useTextOptimizerAnalyze,
} from "@/features/optimizer";
import { EmptyState } from "@/shared/components";
import { BadAssetsCard, CampaignSelector } from "../../_components";
import { AnalysisSummary, SuggestedAssetsCard } from "./sub-components";

const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "he", label: "Hebrew", native: "עברית" },
  { code: "ru", label: "Russian", native: "Русский" },
] as const;

// Helper to get removal ID
const getRemovalId = (asset: AssetToRemove): string =>
  asset.asset_group_asset_resource_name || asset.asset_id;

export function TextOptimizerContent() {
  // Selection state
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [selectedAssetGroupId, setSelectedAssetGroupId] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["en"]);

  // Results state
  const [analysisResult, setAnalysisResult] = useState<TextOptimizerResponse | null>(null);
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
  const { mutate: analyze, isPending: isAnalyzing } = useTextOptimizerAnalyze();
  const { mutate: applyChanges, isPending: isApplying } = useApplyTextChanges();

  // Handlers
  const handleAnalyze = () => {
    if (
      !selectedAccountId ||
      !selectedCampaignId ||
      !selectedAssetGroupId ||
      !productDescription ||
      selectedLanguages.length === 0
    )
      return;

    analyze(
      {
        accountId: selectedAccountId,
        request: {
          campaign_id: selectedCampaignId,
          asset_group_id: selectedAssetGroupId,
          product_description: productDescription,
          languages: selectedLanguages,
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

  const toggleLanguage = (code: string) => {
    setSelectedLanguages((prev) => {
      if (prev.includes(code)) {
        return prev.length === 1 ? prev : prev.filter((c) => c !== code);
      }
      return [...prev, code];
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
    if (analysisResult?.assets_to_add) {
      const indices = analysisResult.assets_to_add
        .map((a, i) => (a.compliance_passed ? i : -1))
        .filter((i) => i !== -1);
      setSelectedToAdd(new Set(indices));
    }
  };

  // Computed
  const isReady =
    selectedAccountId &&
    selectedCampaignId &&
    selectedAssetGroupId &&
    productDescription.trim() &&
    selectedLanguages.length > 0;
  const hasResults = analysisResult !== null;
  const totalChanges = selectedToRemove.size + selectedToAdd.size;
  const noChangesFound =
    hasResults &&
    analysisResult.assets_to_remove.length === 0 &&
    analysisResult.assets_to_add.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Text Optimizer</h1>
        <p className="text-muted-foreground">Detect and fix underperforming assets</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5 text-blue-500" />
            Select Campaign
          </CardTitle>
          <CardDescription>
            Analyze your assets for ZOMBIE, MONEY_WASTER, CLICKBAIT, and TREND_DROPPER patterns
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

          <div>
            <label htmlFor="product-description" className="text-sm font-medium">
              Product Description
            </label>
            <Textarea
              id="product-description"
              placeholder="Describe your product or service for AI-powered suggestions..."
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              className="mt-1.5"
              rows={3}
              disabled={!selectedAssetGroupId}
            />
          </div>

          <LanguageSelector
            selectedLanguages={selectedLanguages}
            onToggle={toggleLanguage}
            disabled={!selectedAssetGroupId}
          />

          <Button onClick={handleAnalyze} disabled={!isReady || isAnalyzing}>
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Text Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {hasResults && (
        <div className="space-y-6">
          <AnalysisSummary result={analysisResult} />

          <BadAssetsCard
            assets={analysisResult.assets_to_remove}
            selectedIds={selectedToRemove}
            onToggle={toggleRemove}
            onSelectAll={selectAllBadAssets}
            isApplying={isApplying}
            getRemovalId={getRemovalId}
          />

          <SuggestedAssetsCard
            assets={analysisResult.assets_to_add}
            selectedIndices={selectedToAdd}
            onToggle={toggleAdd}
            onSelectAll={selectAllCompliantSuggestions}
            isApplying={isApplying}
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
          title="No bad assets found"
          description="Your assets are performing well! No underperforming assets detected."
        />
      )}
    </div>
  );
}

// Sub-component for language selection
function LanguageSelector({
  selectedLanguages,
  onToggle,
  disabled,
}: {
  selectedLanguages: string[];
  onToggle: (code: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Output Languages</span>
      </div>
      <div className="flex flex-wrap gap-4">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <div key={lang.code} className="flex items-center space-x-2">
            <Checkbox
              id={`lang-${lang.code}`}
              checked={selectedLanguages.includes(lang.code)}
              onCheckedChange={() => onToggle(lang.code)}
              disabled={disabled}
            />
            <Label
              htmlFor={`lang-${lang.code}`}
              className={`text-sm ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              {lang.native}
            </Label>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-1.5">
        Select one or more languages. Assets will be generated for each selected language.
      </p>
    </div>
  );
}
