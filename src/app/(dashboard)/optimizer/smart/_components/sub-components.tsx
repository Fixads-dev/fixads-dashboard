"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { GeneratedTextAsset, SmartOptimizerResponse } from "@/features/optimizer";

const ASSET_FIELD_TYPES = [
  { value: "HEADLINE", label: "Headlines", description: "Short text (up to 30 chars)" },
  { value: "DESCRIPTION", label: "Descriptions", description: "Longer text (up to 90 chars)" },
  {
    value: "LONG_HEADLINE",
    label: "Long Headlines",
    description: "Extended headlines (up to 90 chars)",
  },
] as const;

// Asset Type Selector
interface AssetTypeSelectorProps {
  selectedTypes: Set<string>;
  onToggle: (type: string) => void;
  disabled: boolean;
}

export function AssetTypeSelector({ selectedTypes, onToggle, disabled }: AssetTypeSelectorProps) {
  const showError = selectedTypes.size === 0 && !disabled;

  return (
    <div>
      <p className="text-sm font-medium mb-2">Asset Types to Generate</p>
      <div className="flex flex-wrap gap-4">
        {ASSET_FIELD_TYPES.map((type) => (
          <div key={type.value} className="flex items-start space-x-2">
            <Checkbox
              id={`asset-type-${type.value}`}
              checked={selectedTypes.has(type.value)}
              onCheckedChange={() => onToggle(type.value)}
              disabled={disabled}
            />
            <div className="grid gap-0.5 leading-none">
              <Label
                htmlFor={`asset-type-${type.value}`}
                className="text-sm font-medium cursor-pointer"
              >
                {type.label}
              </Label>
              <p className="text-xs text-muted-foreground">{type.description}</p>
            </div>
          </div>
        ))}
      </div>
      {showError && <p className="text-xs text-destructive mt-1">Select at least one asset type</p>}
    </div>
  );
}

// Generation Summary Card
interface GenerationSummaryProps {
  result: SmartOptimizerResponse;
}

export function GenerationSummary({ result }: GenerationSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generation Summary</CardTitle>
        <CardDescription>
          Campaign: {result.campaign_name} / {result.asset_group_name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total Analyzed</p>
            <p className="text-lg font-semibold">{result.summary.total_assets_analyzed}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Headlines</p>
            <p className="text-lg font-semibold text-blue-600">
              {result.summary.generated_headlines}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Descriptions</p>
            <p className="text-lg font-semibold text-blue-600">
              {result.summary.generated_descriptions}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Bad Assets</p>
            <p className="text-lg font-semibold text-destructive">
              {result.summary.bad_assets_found}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Compliant</p>
            <p className="text-lg font-semibold text-green-600">
              {result.summary.compliance_passed}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Generated Assets Card
interface GeneratedAssetsCardProps {
  assets: GeneratedTextAsset[];
  selectedIndices: Set<number>;
  onToggle: (index: number) => void;
  onSelectAll: () => void;
  isApplying: boolean;
}

export function GeneratedAssetsCard({
  assets,
  selectedIndices,
  onToggle,
  onSelectAll,
  isApplying,
}: GeneratedAssetsCardProps) {
  if (assets.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-blue-600">Generated Assets ({assets.length})</CardTitle>
            <CardDescription>
              AI-generated headlines and descriptions from your landing page
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onSelectAll} disabled={isApplying}>
            Select All Compliant
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {assets.map((asset, index) => (
          <GeneratedAssetItem
            key={`${asset.asset_type}-${index}`}
            asset={asset}
            index={index}
            isSelected={selectedIndices.has(index)}
            onToggle={onToggle}
            isApplying={isApplying}
          />
        ))}
      </CardContent>
    </Card>
  );
}

// Individual generated asset item
interface GeneratedAssetItemProps {
  asset: GeneratedTextAsset;
  index: number;
  isSelected: boolean;
  onToggle: (index: number) => void;
  isApplying: boolean;
}

function GeneratedAssetItem({
  asset,
  index,
  isSelected,
  onToggle,
  isApplying,
}: GeneratedAssetItemProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggle(index)}
        disabled={!asset.compliance_passed || isApplying}
      />
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            {asset.asset_type}
          </span>
          <span className="text-xs text-muted-foreground">{asset.char_count} chars</span>
          {asset.compliance_passed ? (
            <span className="text-xs text-green-600">Compliant</span>
          ) : (
            <span className="text-xs text-destructive">Non-compliant</span>
          )}
        </div>
        <p className="text-sm font-medium">{asset.text}</p>
        {asset.compliance_issues && asset.compliance_issues.length > 0 && (
          <p className="text-xs text-destructive">Issues: {asset.compliance_issues.join(", ")}</p>
        )}
      </div>
    </div>
  );
}
