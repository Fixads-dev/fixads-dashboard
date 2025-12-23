import { ArrowUpRight } from "lucide-react";
import type { RecommendationImpact } from "../../types";
import { calculateImpactPercentage } from "../../types";

interface ImpactMetricsSectionProps {
  impact: RecommendationImpact;
}

const IMPACT_METRICS = [
  { key: "conversions" as const, label: "Conversions" },
  { key: "clicks" as const, label: "Clicks" },
  { key: "impressions" as const, label: "Impressions" },
  { key: "cost_micros" as const, label: "Cost" },
];

function formatValue(value: number, key: string): string {
  if (key === "cost_micros") return `$${(value / 1_000_000).toFixed(2)}`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(key === "conversions" ? 1 : 0);
}

export function ImpactMetricsSection({ impact }: ImpactMetricsSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {IMPACT_METRICS.map(({ key, label }) => {
        const base = impact.base_metrics[key];
        const potential = impact.potential_metrics[key];
        const change = calculateImpactPercentage(impact, key);
        const isCost = key === "cost_micros";
        const isPositive = isCost ? (change ?? 0) < 0 : (change ?? 0) > 0;

        return (
          <div key={key} className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold">{formatValue(potential, key)}</span>
              {change !== null && change !== 0 && (
                <span
                  className={`text-sm flex items-center ${
                    isPositive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  <ArrowUpRight className={`h-3 w-3 ${change < 0 ? "rotate-90" : ""}`} />
                  {change > 0 ? "+" : ""}
                  {change}%
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">from {formatValue(base, key)}</p>
          </div>
        );
      })}
    </div>
  );
}
