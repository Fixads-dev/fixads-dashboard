"use client";

import { AlertCircle, Globe, Loader2, Play, Sparkles, Type } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "he", label: "Hebrew", native: "עברית" },
  { code: "ru", label: "Russian", native: "Русский" },
] as const;

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
  type TextOptimizerResponse,
  useApplyTextChanges,
  useTextOptimizerAnalyze,
} from "@/features/optimizer";
import { EmptyState } from "@/shared/components";
import { formatCurrency } from "@/shared/lib/format";

export function TextOptimizerContent() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [selectedAssetGroupId, setSelectedAssetGroupId] = useState<string>("");
  const [productDescription, setProductDescription] = useState<string>("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["en"]);
  const [analysisResult, setAnalysisResult] = useState<TextOptimizerResponse | null>(null);
  const [selectedToRemove, setSelectedToRemove] = useState<Set<string>>(new Set());
  const [selectedToAdd, setSelectedToAdd] = useState<Set<number>>(new Set());

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

  const { mutate: analyze, isPending: isAnalyzing } = useTextOptimizerAnalyze();
  const { mutate: applyChanges, isPending: isApplying } = useApplyTextChanges();

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

  const toggleLanguage = (code: string) => {
    setSelectedLanguages((prev) => {
      if (prev.includes(code)) {
        // Don't allow removing the last language
        if (prev.length === 1) return prev;
        return prev.filter((c) => c !== code);
      }
      return [...prev, code];
    });
  };

  const getLanguageLabel = (code: string) => {
    const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
    return lang ? lang.native : code.toUpperCase();
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

  // Get the identifier used for pausing assets (prefer asset_group_asset_resource_name)
  const getRemovalId = (asset: AssetToRemove): string =>
    asset.asset_group_asset_resource_name || asset.asset_id;

  const toggleRemove = (asset: AssetToRemove) => {
    const id = getRemovalId(asset);
    setSelectedToRemove((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
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
      setSelectedToRemove(new Set(analysisResult.assets_to_remove.map(getRemovalId)));
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
    selectedAccountId &&
    selectedCampaignId &&
    selectedAssetGroupId &&
    productDescription.trim() &&
    selectedLanguages.length > 0;
  const hasResults = analysisResult !== null;
  const totalChanges = selectedToRemove.size + selectedToAdd.size;

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
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <Select
                value={selectedAccountId}
                onValueChange={setSelectedAccountId}
                disabled={isLoadingAccounts}
              >
                <SelectTrigger>
                  {isLoadingAccounts ? (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading accounts...
                    </span>
                  ) : isAccountsError ? (
                    <span className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      Error loading
                    </span>
                  ) : (
                    <SelectValue placeholder="Select account" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {getAccountDisplayName(account)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Select
                value={selectedCampaignId}
                onValueChange={setSelectedCampaignId}
                disabled={!selectedAccountId || isLoadingCampaigns}
              >
                <SelectTrigger>
                  {selectedAccountId && isLoadingCampaigns ? (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading campaigns...
                    </span>
                  ) : selectedAccountId && isCampaignsError ? (
                    <span className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      Error loading
                    </span>
                  ) : (
                    <SelectValue placeholder="Select campaign" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {campaigns
                    ?.filter((campaign) => campaign.campaign_id)
                    .map((campaign) => (
                      <SelectItem key={campaign.campaign_id} value={campaign.campaign_id}>
                        {campaign.campaign_name || campaign.campaign_id}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Select
                value={selectedAssetGroupId}
                onValueChange={setSelectedAssetGroupId}
                disabled={!selectedCampaignId || isLoadingAssetGroups}
              >
                <SelectTrigger>
                  {selectedCampaignId && isLoadingAssetGroups ? (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading asset groups...
                    </span>
                  ) : selectedCampaignId && isAssetGroupsError ? (
                    <span className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      Error loading
                    </span>
                  ) : (
                    <SelectValue placeholder="Select asset group" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {assetGroups
                    ?.filter((group) => group.asset_group_id)
                    .map((group) => (
                      <SelectItem key={group.asset_group_id} value={group.asset_group_id}>
                        {group.asset_group_name || group.asset_group_id}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
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
              disabled={!selectedAssetGroupId}
            />
          </div>

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
                    onCheckedChange={() => toggleLanguage(lang.code)}
                    disabled={!selectedAssetGroupId}
                  />
                  <Label
                    htmlFor={`lang-${lang.code}`}
                    className={`text-sm ${selectedAssetGroupId ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
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
                  <p className="text-lg font-semibold">
                    {analysisResult.summary.total_assets_analyzed}
                  </p>
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
                    {analysisResult.summary.compliance_passed}
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllBadAssets}
                    disabled={isApplying}
                  >
                    Select All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysisResult.assets_to_remove.map((asset: AssetToRemove) => (
                  <div
                    key={getRemovalId(asset)}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <Checkbox
                      checked={selectedToRemove.has(getRemovalId(asset))}
                      onCheckedChange={() => toggleRemove(asset)}
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
                      {asset.metrics && (
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Impressions: {asset.metrics.impressions ?? 0}</span>
                          <span>Clicks: {asset.metrics.clicks ?? 0}</span>
                          <span>
                            Cost: {formatCurrency((asset.metrics.cost_micros ?? 0) / 1_000_000)}
                          </span>
                          <span>Conversions: {asset.metrics.conversions ?? 0}</span>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllCompliantSuggestions}
                    disabled={isApplying}
                  >
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
                      disabled={!asset.compliance_passed || isApplying}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                          {asset.asset_type}
                        </span>
                        {asset.language && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                            {getLanguageLabel(asset.language)}
                          </span>
                        )}
                        {asset.compliance_passed ? (
                          <span className="text-xs text-green-600">Compliant</span>
                        ) : (
                          <span className="text-xs text-destructive">Non-compliant</span>
                        )}
                      </div>
                      <p className="text-sm font-medium">{asset.text}</p>
                      {asset.compliance_issues && asset.compliance_issues.length > 0 && (
                        <p className="text-xs text-destructive">
                          Issues: {asset.compliance_issues.join(", ")}
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
