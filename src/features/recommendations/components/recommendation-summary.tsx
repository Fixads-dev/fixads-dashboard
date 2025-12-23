import type { Recommendation } from "../types";
import { getRecommendationLabel } from "../types";
import { RecommendationTypeBadge } from "./recommendation-type-badge";

interface RecommendationSummaryProps {
  recommendation: Recommendation;
}

export function RecommendationSummary({ recommendation }: RecommendationSummaryProps) {
  const label = getRecommendationLabel(recommendation.type);

  return (
    <div className="bg-muted/50 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-medium">{label}</span>
        <RecommendationTypeBadge type={recommendation.type} showLabel={false} />
      </div>
      {recommendation.campaign_name && (
        <p className="text-sm text-muted-foreground">Campaign: {recommendation.campaign_name}</p>
      )}
    </div>
  );
}
