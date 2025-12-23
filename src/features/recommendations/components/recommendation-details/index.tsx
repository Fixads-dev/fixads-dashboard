import { BudgetDetails } from "./budget-details";
import { GenericDetails } from "./generic-details";
import { KeywordDetails } from "./keyword-details";
import { TargetCpaDetails } from "./target-cpa-details";

export { ImpactMetricsSection } from "./impact-metrics-section";

interface RecommendationDetailsProps {
  details: Record<string, unknown>;
  type: string;
}

export function RecommendationDetails({ details, type }: RecommendationDetailsProps) {
  if (type === "KEYWORD" && details.keyword) {
    return <KeywordDetails details={details} />;
  }

  if (type.includes("BUDGET") && details.budget) {
    return <BudgetDetails details={details} />;
  }

  if (type.includes("TARGET_CPA") && details.target_cpa) {
    return <TargetCpaDetails details={details} />;
  }

  return <GenericDetails details={details} />;
}
