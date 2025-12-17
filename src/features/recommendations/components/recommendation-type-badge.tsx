"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RecommendationType } from "../types";
import { getRecommendationCategory, getRecommendationLabel } from "../types";

interface RecommendationTypeBadgeProps {
  type: RecommendationType;
  showLabel?: boolean;
  className?: string;
}

const categoryColors: Record<string, string> = {
  Budget: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  Bidding: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Keywords: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  Ads: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  Extensions: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  "Performance Max": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  Other: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export function RecommendationTypeBadge({
  type,
  showLabel = true,
  className,
}: RecommendationTypeBadgeProps) {
  const category = getRecommendationCategory(type);
  const label = showLabel ? getRecommendationLabel(type) : category;
  const colorClass = categoryColors[category] || categoryColors.Other;

  return (
    <Badge variant="secondary" className={cn(colorClass, "font-medium", className)}>
      {label}
    </Badge>
  );
}

export function RecommendationCategoryBadge({
  category,
  count,
  className,
}: {
  category: string;
  count?: number;
  className?: string;
}) {
  const colorClass = categoryColors[category] || categoryColors.Other;

  return (
    <Badge variant="secondary" className={cn(colorClass, "font-medium", className)}>
      {category}
      {count !== undefined && <span className="ml-1 opacity-70">({count})</span>}
    </Badge>
  );
}
