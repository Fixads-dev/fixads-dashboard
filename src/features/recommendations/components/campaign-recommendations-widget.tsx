"use client";

import { ArrowRight, Lightbulb } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCampaignRecommendationsSummary } from "../hooks/use-recommendations";
import { RecommendationCategoryBadge } from "./recommendation-type-badge";

interface CampaignRecommendationsWidgetProps {
  accountId: string;
  campaignId: string;
}

export function CampaignRecommendationsWidget({
  accountId,
  campaignId,
}: CampaignRecommendationsWidgetProps) {
  const { summary, isLoading, error } = useCampaignRecommendationsSummary(accountId, campaignId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-12 mb-2" />
          <Skeleton className="h-4 w-40" />
        </CardContent>
      </Card>
    );
  }

  if (error || !summary) {
    return null; // Don't show widget if there's an error
  }

  if (summary.total === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No recommendations available for this campaign.
          </p>
        </CardContent>
      </Card>
    );
  }

  const categories = Object.entries(summary.byCategory);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Recommendations
          </CardTitle>
          <Link href={`/recommendations?account_id=${accountId}&campaign_id=${campaignId}`}>
            <Button variant="ghost" size="sm">
              View all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        <CardDescription>
          Google&apos;s AI-powered suggestions to improve performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Total count */}
        <div className="mb-4">
          <span className="text-3xl font-bold">{summary.total}</span>
          <span className="text-muted-foreground ml-2">
            recommendation{summary.total !== 1 ? "s" : ""}
          </span>
          {summary.highImpact > 0 && (
            <span className="ml-2 text-sm text-emerald-600 dark:text-emerald-400">
              ({summary.highImpact} high impact)
            </span>
          )}
        </div>

        {/* Categories breakdown */}
        <div className="flex flex-wrap gap-2">
          {categories.map(([category, count]) => (
            <RecommendationCategoryBadge key={category} category={category} count={count} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
