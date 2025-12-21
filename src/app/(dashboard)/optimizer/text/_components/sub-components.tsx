"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { AssetToAdd, TextOptimizerResponse } from "@/features/optimizer";

const SUPPORTED_LANGUAGES = [
  { code: "en", native: "English" },
  { code: "de", native: "Deutsch" },
  { code: "he", native: "עברית" },
  { code: "ru", native: "Русский" },
] as const;

function getLanguageLabel(code: string): string {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  return lang ? lang.native : code.toUpperCase();
}

// Analysis Summary Card
interface AnalysisSummaryProps {
  result: TextOptimizerResponse;
}

export function AnalysisSummary({ result }: AnalysisSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Summary</CardTitle>
        <CardDescription>
          Campaign: {result.campaign_name} / {result.asset_group_name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total Analyzed</p>
            <p className="text-lg font-semibold">{result.summary.total_assets_analyzed}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Bad Assets</p>
            <p className="text-lg font-semibold text-destructive">
              {result.assets_to_remove.length}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Suggestions</p>
            <p className="text-lg font-semibold">{result.assets_to_add.length}</p>
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

// Suggested Assets Card
interface SuggestedAssetsCardProps {
  assets: AssetToAdd[];
  selectedIndices: Set<number>;
  onToggle: (index: number) => void;
  onSelectAll: () => void;
  isApplying: boolean;
}

export function SuggestedAssetsCard({
  assets,
  selectedIndices,
  onToggle,
  onSelectAll,
  isApplying,
}: SuggestedAssetsCardProps) {
  if (assets.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Suggested Replacements ({assets.length})</CardTitle>
            <CardDescription>Select assets to add</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onSelectAll} disabled={isApplying}>
            Select All Compliant
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {assets.map((asset, index) => (
          <AssetItem
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

// Individual asset item
interface AssetItemProps {
  asset: AssetToAdd;
  index: number;
  isSelected: boolean;
  onToggle: (index: number) => void;
  isApplying: boolean;
}

function AssetItem({ asset, index, isSelected, onToggle, isApplying }: AssetItemProps) {
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
          <p className="text-xs text-destructive">Issues: {asset.compliance_issues.join(", ")}</p>
        )}
      </div>
    </div>
  );
}
