"use client";

import { Check, X } from "lucide-react";
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
import type { Recommendation } from "../types";
import { getRecommendationLabel } from "../types";
import { ImpactMetricsSection, RecommendationDetails } from "./recommendation-details";
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
          {recommendation.impact && (
            <section>
              <h4 className="text-sm font-medium mb-3">Estimated Impact</h4>
              <ImpactMetricsSection impact={recommendation.impact} />
            </section>
          )}

          <Separator />

          <section>
            <h4 className="text-sm font-medium mb-3">Recommendation Details</h4>
            <RecommendationDetails details={recommendation.details} type={recommendation.type} />
          </section>

          <Separator />

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
