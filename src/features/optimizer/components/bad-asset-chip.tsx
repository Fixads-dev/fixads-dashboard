"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { BadAssetClassification } from "../types";

const classificationConfig: Record<
  BadAssetClassification,
  { label: string; variant: "destructive" | "secondary" | "outline"; description: string }
> = {
  ZOMBIE: {
    label: "Zombie",
    variant: "secondary",
    description: "Asset has very low impressions (< 10) after 5+ days",
  },
  MONEY_WASTER: {
    label: "Money Waster",
    variant: "destructive",
    description: "Asset cost > 2x target CPA with zero conversions",
  },
  CLICKBAIT: {
    label: "Clickbait",
    variant: "outline",
    description: "High clicks but conversion rate < 20% of group average",
  },
  TREND_DROPPER: {
    label: "Trend Dropper",
    variant: "secondary",
    description: "Recent CTR dropped below 50% of baseline performance",
  },
};

interface BadAssetChipProps {
  classification: BadAssetClassification;
  showTooltip?: boolean;
}

export function BadAssetChip({ classification, showTooltip = true }: BadAssetChipProps) {
  const config = classificationConfig[classification];
  const badge = <Badge variant={config.variant}>{config.label}</Badge>;

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-sm">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
