"use client";

import { AlertCircle, Globe, Link, Loader2, Play, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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

const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "de", label: "German" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "he", label: "Hebrew" },
  { code: "ru", label: "Russian" },
] as const;

export function SmartOptimizerContent() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [selectedAssetGroupId, setSelectedAssetGroupId] = useState<string>("");
  const [finalUrl, setFinalUrl] = useState<string>("");
  const [languageCode, setLanguageCode] = useState<string>("en");
  const [freeformPrompt, setFreeformPrompt] = useState<string>("");
  const [keywords, setKeywords] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<SmartOptimizerResponse | null>(null);
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

  const { mutate: analyze, isPending: isAnalyzing } = useSmartOptimizerAnalyze();
  const { mutate: applyChanges, isPending: isApplying } = useApplySmartChanges();

  const handleAnalyze = () => {
    if (!selectedAccountId || !selectedCampaignId || !selectedAssetGroupId || !finalUrl) return;

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
          language_code: languageCode,
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
    if (!selectedAccountId || !analysisResult) return;
    if (selectedToRemove.size === 0 && selectedToAdd.size === 0) return;

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
    if (analysisResult?.generated_assets) {
      const compliantIndices = analysisResult.generated_assets
        .map((a, i) => (a.compliance_passed ? i : -1))
        .filter((i) => i !== -1);
      setSelectedToAdd(new Set(compliantIndices));
    }
  };

  // Helper to get display name for account
  const getAccountDisplayName = (acc: { descriptive_name: string | null; customer_id: string }) =>
    acc.descriptive_name ?? acc.customer_id;

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isReady =
    selectedAccountId &&
    selectedCampaignId &&
    selectedAssetGroupId &&
    finalUrl.trim() &&
    isValidUrl(finalUrl);
  const hasResults = analysisResult !== null;
  const totalChanges = selectedToRemove.size + selectedToAdd.size;

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

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="final-url" className="text-sm font-medium flex items-center gap-2">
                <Link className="h-4 w-4" />
                Landing Page URL
              </label>
              <Input
                id="final-url"
                type="url"
                placeholder="https://example.com/landing-page"
                value={finalUrl}
                onChange={(e) => setFinalUrl(e.target.value)}
                className="mt-1.5"
                disabled={!selectedAssetGroupId}
              />
              {finalUrl && !isValidUrl(finalUrl) && (
                <p className="text-xs text-destructive mt-1">Please enter a valid URL</p>
              )}
            </div>

            <div>
              <label
                htmlFor="language-code"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                Output Language
              </label>
              <Select
                value={languageCode}
                onValueChange={setLanguageCode}
                disabled={!selectedAssetGroupId}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label htmlFor="freeform-prompt" className="text-sm font-medium">
              Custom Instructions (Optional)
            </label>
            <Textarea
              id="freeform-prompt"
              placeholder="Add custom instructions for the AI, e.g., 'Focus on eco-friendly messaging' or 'Highlight free shipping'"
              value={freeformPrompt}
              onChange={(e) => setFreeformPrompt(e.target.value)}
              className="mt-1.5"
              rows={2}
              disabled={!selectedAssetGroupId}
            />
          </div>

          <div>
            <label htmlFor="keywords" className="text-sm font-medium">
              Keywords to Include (Optional)
            </label>
            <Input
              id="keywords"
              placeholder="Enter keywords separated by commas, e.g., free shipping, 24/7 support, eco-friendly"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="mt-1.5"
              disabled={!selectedAssetGroupId}
            />
            <p className="text-xs text-muted-foreground mt-1">
              These keywords will be incorporated into the generated assets
            </p>
          </div>

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
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Generation Summary</CardTitle>
              <CardDescription>
                Campaign: {analysisResult.campaign_name} / {analysisResult.asset_group_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Analyzed</p>
                  <p className="text-lg font-semibold">
                    {analysisResult.summary.total_assets_analyzed}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Headlines</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {analysisResult.summary.generated_headlines}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Descriptions</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {analysisResult.summary.generated_descriptions}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Bad Assets</p>
                  <p className="text-lg font-semibold text-destructive">
                    {analysisResult.summary.bad_assets_found}
                  </p>
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

          {/* Generated Assets */}
          {analysisResult.generated_assets.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-blue-600">
                      Generated Assets ({analysisResult.generated_assets.length})
                    </CardTitle>
                    <CardDescription>
                      AI-generated headlines and descriptions from your landing page
                    </CardDescription>
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
                {analysisResult.generated_assets.map((asset, index) => (
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
                        <span className="text-xs text-muted-foreground">
                          {asset.char_count} chars
                        </span>
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

          {/* Bad Assets to Remove */}
          {analysisResult.assets_to_remove.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-destructive">
                      Bad Assets ({analysisResult.assets_to_remove.length})
                    </CardTitle>
                    <CardDescription>Select underperforming assets to remove</CardDescription>
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
        analysisResult.generated_assets.length === 0 &&
        analysisResult.assets_to_remove.length === 0 && (
          <EmptyState
            icon={Sparkles}
            title="No assets generated"
            description="Unable to generate assets from the provided URL. Try a different landing page or add custom instructions."
          />
        )}
    </div>
  );
}
