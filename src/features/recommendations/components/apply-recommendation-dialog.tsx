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
import type { ApplyRecommendationParameters, Recommendation } from "../types";
import {
  BudgetParameters,
  canCustomize,
  KeywordParameters,
  TargetCpaParameters,
} from "./parameter-forms";
import { RecommendationSummary } from "./recommendation-summary";

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
          <RecommendationSummary recommendation={recommendation} />

          <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400 mb-4">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              This action will modify your Google Ads account. Changes may take a few minutes to
              reflect in your account.
            </p>
          </div>

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
