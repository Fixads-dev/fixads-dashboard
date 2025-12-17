"use client";

import { AlertTriangle, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApplyRecommendationParameters, Recommendation } from "../types";
import { getRecommendationLabel } from "../types";
import { RecommendationTypeBadge } from "./recommendation-type-badge";

interface ApplyRecommendationDialogProps {
  recommendation: Recommendation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (recommendation: Recommendation, parameters?: ApplyRecommendationParameters) => void;
  isApplying?: boolean;
}

export function ApplyRecommendationDialog({
  recommendation,
  open,
  onOpenChange,
  onConfirm,
  isApplying,
}: ApplyRecommendationDialogProps) {
  const [parameters, setParameters] = useState<ApplyRecommendationParameters>({});

  if (!recommendation) return null;

  const label = getRecommendationLabel(recommendation.type);
  const hasCustomParameters = canCustomize(recommendation.type);

  const handleConfirm = () => {
    const params =
      hasCustomParameters && Object.keys(parameters).length > 0 ? parameters : undefined;
    onConfirm(recommendation, params);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-emerald-600" />
            Apply Recommendation
          </DialogTitle>
          <DialogDescription>
            You&apos;re about to apply the following recommendation to your Google Ads account.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Recommendation summary */}
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="font-medium">{label}</span>
              <RecommendationTypeBadge type={recommendation.type} showLabel={false} />
            </div>
            {recommendation.campaign_name && (
              <p className="text-sm text-muted-foreground">
                Campaign: {recommendation.campaign_name}
              </p>
            )}
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400 mb-4">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              This action will modify your Google Ads account. Changes may take a few minutes to
              reflect in your account.
            </p>
          </div>

          {/* Custom parameters for certain recommendation types */}
          {recommendation.type === "KEYWORD" && (
            <KeywordParameters
              details={recommendation.details}
              parameters={parameters}
              onChange={setParameters}
            />
          )}

          {recommendation.type.includes("BUDGET") && (
            <BudgetParameters
              details={recommendation.details}
              parameters={parameters}
              onChange={setParameters}
            />
          )}

          {recommendation.type === "TARGET_CPA_OPT_IN" && (
            <TargetCpaParameters
              details={recommendation.details}
              parameters={parameters}
              onChange={setParameters}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isApplying}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isApplying}>
            {isApplying ? "Applying..." : "Apply Now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function canCustomize(type: string): boolean {
  return [
    "KEYWORD",
    "CAMPAIGN_BUDGET",
    "FORECASTING_CAMPAIGN_BUDGET",
    "TARGET_CPA_OPT_IN",
  ].includes(type);
}

function KeywordParameters({
  details,
  parameters,
  onChange,
}: {
  details: Record<string, unknown>;
  parameters: ApplyRecommendationParameters;
  onChange: (params: ApplyRecommendationParameters) => void;
}) {
  const keyword = details.keyword as Record<string, unknown> | undefined;
  const suggestedMatchType = keyword?.match_type as string | undefined;
  const suggestedBid = keyword?.cpc_bid_micros as number | undefined;

  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="text-sm font-medium">Customize (optional)</h4>

      <div className="space-y-2">
        <Label htmlFor="match-type">Match Type</Label>
        <Select
          value={parameters.keyword?.match_type || suggestedMatchType || "BROAD"}
          onValueChange={(value) =>
            onChange({
              ...parameters,
              keyword: { ...parameters.keyword, match_type: value as "EXACT" | "PHRASE" | "BROAD" },
            })
          }
        >
          <SelectTrigger id="match-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BROAD">Broad</SelectItem>
            <SelectItem value="PHRASE">Phrase</SelectItem>
            <SelectItem value="EXACT">Exact</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cpc-bid">Max CPC Bid ($)</Label>
        <Input
          id="cpc-bid"
          type="number"
          step="0.01"
          placeholder={
            suggestedBid ? `Suggested: $${(suggestedBid / 1_000_000).toFixed(2)}` : "Auto"
          }
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            if (!Number.isNaN(value)) {
              onChange({
                ...parameters,
                keyword: { ...parameters.keyword, cpc_bid_micros: Math.round(value * 1_000_000) },
              });
            }
          }}
        />
      </div>
    </div>
  );
}

function BudgetParameters({
  details,
  parameters,
  onChange,
}: {
  details: Record<string, unknown>;
  parameters: ApplyRecommendationParameters;
  onChange: (params: ApplyRecommendationParameters) => void;
}) {
  const budget = details.budget as Record<string, unknown> | undefined;
  const recommended = budget?.recommended_budget_micros as number | undefined;
  const current = budget?.current_budget_micros as number | undefined;

  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="text-sm font-medium">Customize Budget (optional)</h4>

      {current && (
        <p className="text-sm text-muted-foreground">
          Current: ${(current / 1_000_000).toFixed(2)}/day
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="new-budget">New Daily Budget ($)</Label>
        <Input
          id="new-budget"
          type="number"
          step="0.01"
          placeholder={
            recommended ? `Recommended: $${(recommended / 1_000_000).toFixed(2)}` : "Enter amount"
          }
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            if (!Number.isNaN(value)) {
              onChange({
                ...parameters,
                campaign_budget: { new_budget_amount_micros: Math.round(value * 1_000_000) },
              });
            }
          }}
        />
      </div>
    </div>
  );
}

function TargetCpaParameters({
  details,
  parameters,
  onChange,
}: {
  details: Record<string, unknown>;
  parameters: ApplyRecommendationParameters;
  onChange: (params: ApplyRecommendationParameters) => void;
}) {
  const cpa = details.target_cpa as Record<string, unknown> | undefined;
  const recommended = cpa?.target_cpa_micros as number | undefined;

  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="text-sm font-medium">Customize Target CPA (optional)</h4>

      <div className="space-y-2">
        <Label htmlFor="target-cpa">Target CPA ($)</Label>
        <Input
          id="target-cpa"
          type="number"
          step="0.01"
          placeholder={
            recommended ? `Recommended: $${(recommended / 1_000_000).toFixed(2)}` : "Enter amount"
          }
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            if (!Number.isNaN(value)) {
              onChange({
                ...parameters,
                target_cpa: { target_cpa_micros: Math.round(value * 1_000_000) },
              });
            }
          }}
        />
      </div>
    </div>
  );
}
