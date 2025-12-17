"use client";

import { ArrowUpRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Recommendation, RecommendationImpact } from "../types";
import { calculateImpactPercentage, getRecommendationLabel } from "../types";
import { RecommendationTypeBadge } from "./recommendation-type-badge";

interface RecommendationDetailPanelProps {
  recommendation: Recommendation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply?: (recommendation: Recommendation) => void;
  onDismiss?: (recommendation: Recommendation) => void;
  isApplying?: boolean;
  isDismissing?: boolean;
}

export function RecommendationDetailPanel({
  recommendation,
  open,
  onOpenChange,
  onApply,
  onDismiss,
  isApplying,
  isDismissing,
}: RecommendationDetailPanelProps) {
  if (!recommendation) return null;

  const label = getRecommendationLabel(recommendation.type);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2 mb-2">
            <RecommendationTypeBadge type={recommendation.type} showLabel={false} />
            {recommendation.dismissed && (
              <span className="text-xs text-muted-foreground">(Dismissed)</span>
            )}
          </div>
          <SheetTitle>{label}</SheetTitle>
          {recommendation.campaign_name && (
            <SheetDescription>Campaign: {recommendation.campaign_name}</SheetDescription>
          )}
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Impact Section */}
          {recommendation.impact && (
            <section>
              <h4 className="text-sm font-medium mb-3">Estimated Impact</h4>
              <ImpactMetrics impact={recommendation.impact} />
            </section>
          )}

          <Separator />

          {/* Details Section */}
          <section>
            <h4 className="text-sm font-medium mb-3">Recommendation Details</h4>
            <RecommendationDetails details={recommendation.details} type={recommendation.type} />
          </section>

          <Separator />

          {/* Metadata */}
          <section className="text-xs text-muted-foreground space-y-1">
            <p>
              <span className="font-medium">Type:</span> {recommendation.type}
            </p>
            <p>
              <span className="font-medium">ID:</span> {recommendation.recommendation_id}
            </p>
            {recommendation.ad_group_id && (
              <p>
                <span className="font-medium">Ad Group:</span> {recommendation.ad_group_id}
              </p>
            )}
          </section>
        </div>

        {!recommendation.dismissed && (onApply || onDismiss) && (
          <SheetFooter className="mt-6 flex gap-2">
            {onApply && (
              <Button onClick={() => onApply(recommendation)} disabled={isApplying || isDismissing}>
                <Check className="h-4 w-4 mr-1" />
                {isApplying ? "Applying..." : "Apply Recommendation"}
              </Button>
            )}
            {onDismiss && (
              <Button
                variant="outline"
                onClick={() => onDismiss(recommendation)}
                disabled={isApplying || isDismissing}
              >
                <X className="h-4 w-4 mr-1" />
                {isDismissing ? "Dismissing..." : "Dismiss"}
              </Button>
            )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ImpactMetrics({ impact }: { impact: RecommendationImpact }) {
  const metrics = [
    { key: "conversions", label: "Conversions" },
    { key: "clicks", label: "Clicks" },
    { key: "impressions", label: "Impressions" },
    { key: "cost_micros", label: "Cost" },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-4">
      {metrics.map(({ key, label }) => {
        const base = impact.base_metrics[key];
        const potential = impact.potential_metrics[key];
        const change = calculateImpactPercentage(impact, key);
        const isCost = key === "cost_micros";

        // Format values
        const formatValue = (v: number) => {
          if (isCost) return `$${(v / 1_000_000).toFixed(2)}`;
          if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
          if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
          return v.toFixed(key === "conversions" ? 1 : 0);
        };

        // Determine color (for cost, increase is negative)
        const isPositive = isCost ? (change ?? 0) < 0 : (change ?? 0) > 0;

        return (
          <div key={key} className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold">{formatValue(potential)}</span>
              {change !== null && change !== 0 && (
                <span
                  className={`text-sm flex items-center ${
                    isPositive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  <ArrowUpRight className={`h-3 w-3 ${change < 0 ? "rotate-90" : ""}`} />
                  {change > 0 ? "+" : ""}
                  {change}%
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">from {formatValue(base)}</p>
          </div>
        );
      })}
    </div>
  );
}

function RecommendationDetails({
  details,
  type,
}: {
  details: Record<string, unknown>;
  type: string;
}) {
  // Render based on recommendation type
  if (type === "KEYWORD" && details.keyword) {
    const kw = details.keyword as Record<string, unknown>;
    const text = typeof kw.text === "string" ? kw.text : null;
    const matchType = typeof kw.match_type === "string" ? kw.match_type : null;
    const bidMicros = typeof kw.cpc_bid_micros === "number" ? kw.cpc_bid_micros : null;
    return (
      <div className="space-y-2 text-sm">
        {text && (
          <p>
            <span className="text-muted-foreground">Keyword:</span>{" "}
            <span className="font-mono bg-muted px-1 rounded">{text}</span>
          </p>
        )}
        {matchType && (
          <p>
            <span className="text-muted-foreground">Match Type:</span> {matchType}
          </p>
        )}
        {bidMicros && (
          <p>
            <span className="text-muted-foreground">Recommended Bid:</span> $
            {(bidMicros / 1_000_000).toFixed(2)}
          </p>
        )}
      </div>
    );
  }

  if (type.includes("BUDGET") && details.budget) {
    const budget = details.budget as Record<string, unknown>;
    const currentBudget =
      typeof budget.current_budget_micros === "number" ? budget.current_budget_micros : null;
    const recommendedBudget =
      typeof budget.recommended_budget_micros === "number"
        ? budget.recommended_budget_micros
        : null;
    return (
      <div className="space-y-2 text-sm">
        {currentBudget !== null && (
          <p>
            <span className="text-muted-foreground">Current Budget:</span> $
            {(currentBudget / 1_000_000).toFixed(2)}/day
          </p>
        )}
        {recommendedBudget !== null && (
          <p>
            <span className="text-muted-foreground">Recommended Budget:</span>{" "}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              ${(recommendedBudget / 1_000_000).toFixed(2)}/day
            </span>
          </p>
        )}
      </div>
    );
  }

  if (type.includes("TARGET_CPA") && details.target_cpa) {
    const cpa = details.target_cpa as Record<string, unknown>;
    const cpaMicros = typeof cpa.target_cpa_micros === "number" ? cpa.target_cpa_micros : null;
    return (
      <div className="space-y-2 text-sm">
        {cpaMicros !== null && (
          <p>
            <span className="text-muted-foreground">Recommended Target CPA:</span>{" "}
            <span className="font-semibold">${(cpaMicros / 1_000_000).toFixed(2)}</span>
          </p>
        )}
      </div>
    );
  }

  // Generic fallback - show raw details
  if (Object.keys(details).length === 0) {
    return <p className="text-sm text-muted-foreground">No additional details available.</p>;
  }

  return (
    <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
      {JSON.stringify(details, null, 2)}
    </pre>
  );
}
