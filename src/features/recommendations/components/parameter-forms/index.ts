export { BudgetParameters } from "./budget-parameters";
export { KeywordParameters } from "./keyword-parameters";
export { TargetCpaParameters } from "./target-cpa-parameters";

const CUSTOMIZABLE_TYPES = [
  "KEYWORD",
  "CAMPAIGN_BUDGET",
  "FORECASTING_CAMPAIGN_BUDGET",
  "TARGET_CPA_OPT_IN",
] as const;

export function canCustomize(type: string): boolean {
  return CUSTOMIZABLE_TYPES.includes(type as (typeof CUSTOMIZABLE_TYPES)[number]);
}
