"use client";

import { ArrowUpRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Recommendation } from "../types";
import { calculateImpactPercentage, getRecommendationLabel } from "../types";
import { RecommendationTypeBadge } from "./recommendation-type-badge";

interface RecommendationCardProps {
  recommendation: Recommendation;
  onApply?: (recommendation: Recommendation) => void;
  onDismiss?: (recommendation: Recommendation) => void;
  onViewDetails?: (recommendation: Recommendation) => void;
  isApplying?: boolean;
  isDismissing?: boolean;
}

export function RecommendationCard({
  recommendation,
  onApply,
  onDismiss,
  onViewDetails,
  isApplying,
  isDismissing,
}: RecommendationCardProps) {
  const label = getRecommendationLabel(recommendation.type);
  const conversionImpact = calculateImpactPercentage(recommendation.impact, "conversions");
  const clicksImpact = calculateImpactPercentage(recommendation.impact, "clicks");

  // Build description from details
  const description = buildDescription(recommendation);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">{label}</CardTitle>
            {recommendation.campaign_name && (
              <CardDescription className="text-xs">
                Campaign: {recommendation.campaign_name}
              </CardDescription>
            )}
          </div>
          <RecommendationTypeBadge type={recommendation.type} showLabel={false} />
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        {description && <p className="text-sm text-muted-foreground mb-3">{description}</p>}

        {/* Impact metrics */}
        {recommendation.impact && (
          <div className="flex gap-4 text-sm">
            {conversionImpact !== null && conversionImpact > 0 && (
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="h-4 w-4" />
                <span className="font-medium">+{conversionImpact}%</span>
                <span className="text-muted-foreground">conversions</span>
              </div>
            )}
            {clicksImpact !== null && clicksImpact > 0 && (
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <ArrowUpRight className="h-4 w-4" />
                <span className="font-medium">+{clicksImpact}%</span>
                <span className="text-muted-foreground">clicks</span>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-3 border-t">
        {onApply && (
          <Button
            size="sm"
            onClick={() => onApply(recommendation)}
            disabled={isApplying || isDismissing}
          >
            <Check className="h-4 w-4 mr-1" />
            {isApplying ? "Applying..." : "Apply"}
          </Button>
        )}
        {onDismiss && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDismiss(recommendation)}
            disabled={isApplying || isDismissing}
          >
            <X className="h-4 w-4 mr-1" />
            {isDismissing ? "Dismissing..." : "Dismiss"}
          </Button>
        )}
        {onViewDetails && (
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto"
            onClick={() => onViewDetails(recommendation)}
          >
            Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// Static description mappings for simple recommendation types
const STATIC_DESCRIPTIONS: Record<string, string> = {
  MAXIMIZE_CONVERSIONS_OPT_IN: "Switch to Maximize Conversions bidding",
  MAXIMIZE_CLICKS_OPT_IN: "Switch to Maximize Clicks bidding",
  TARGET_ROAS_OPT_IN: "Enable Target ROAS bidding strategy",
  RESPONSIVE_SEARCH_AD: "Add a responsive search ad to improve relevance",
  RESPONSIVE_SEARCH_AD_ASSET: "Add more headlines or descriptions to your ads",
  RESPONSIVE_SEARCH_AD_IMPROVE_AD_STRENGTH: "Improve ad strength by adding more assets",
  USE_BROAD_MATCH_KEYWORD: "Use broad match to reach more customers",
  KEYWORD_MATCH_TYPE: "Change keyword match type for better targeting",
  SITELINK_ASSET: "Add sitelinks to show more links in your ads",
  CALLOUT_ASSET: "Add callouts to highlight key benefits",
  CALL_ASSET: "Add a phone number to your ads",
  PERFORMANCE_MAX_OPT_IN: "Upgrade to Performance Max campaign",
  IMPROVE_PERFORMANCE_MAX_AD_STRENGTH: "Add more assets to improve PMax ad strength",
};

// Budget-related types that share the same logic
const BUDGET_TYPES = new Set([
  "CAMPAIGN_BUDGET",
  "FORECASTING_CAMPAIGN_BUDGET",
  "MARGINAL_ROI_CAMPAIGN_BUDGET",
]);

// Build keyword description
function buildKeywordDescription(details: Recommendation["details"]): string {
  if (!details.keyword) return "";
  const kw = details.keyword as { text?: string; match_type?: string };
  const matchType = kw.match_type ? ` (${kw.match_type})` : "";
  return `Add keyword "${kw.text || ""}${matchType}"`;
}

// Build budget description
function buildBudgetDescription(details: Recommendation["details"]): string {
  if (!details.budget) return "";
  const budget = details.budget as { recommended_budget_micros?: number };
  if (!budget.recommended_budget_micros) return "";
  const amount = budget.recommended_budget_micros / 1_000_000;
  return `Increase daily budget to $${amount.toFixed(2)}`;
}

// Build target CPA description
function buildTargetCpaDescription(details: Recommendation["details"]): string {
  if (!details.target_cpa) return "Enable Target CPA bidding strategy";
  const cpa = details.target_cpa as { target_cpa_micros?: number };
  if (!cpa.target_cpa_micros) return "Enable Target CPA bidding strategy";
  const amount = cpa.target_cpa_micros / 1_000_000;
  return `Set target CPA to $${amount.toFixed(2)}`;
}

// Build a human-readable description from recommendation details
function buildDescription(recommendation: Recommendation): string {
  const { type, details } = recommendation;

  // Check static descriptions first
  if (type in STATIC_DESCRIPTIONS) {
    return STATIC_DESCRIPTIONS[type];
  }

  // Handle dynamic descriptions
  if (type === "KEYWORD") return buildKeywordDescription(details);
  if (BUDGET_TYPES.has(type)) return buildBudgetDescription(details);
  if (type === "TARGET_CPA_OPT_IN") return buildTargetCpaDescription(details);

  // Fallback: try to find any text in details
  if (typeof details === "object") {
    const text = findTextInObject(details);
    if (text) return text;
  }

  return "";
}

// Helper to find text values in nested objects
function findTextInObject(obj: Record<string, unknown>, depth = 0): string {
  if (depth > 3) return "";

  for (const [key, value] of Object.entries(obj)) {
    if (key === "text" && typeof value === "string") {
      return value;
    }
    if (typeof value === "object" && value !== null) {
      const found = findTextInObject(value as Record<string, unknown>, depth + 1);
      if (found) return found;
    }
  }
  return "";
}
