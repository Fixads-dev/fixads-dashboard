interface BudgetDetailsProps {
  details: Record<string, unknown>;
}

function formatMicros(micros: number, suffix = ""): string {
  return `$${(micros / 1_000_000).toFixed(2)}${suffix}`;
}

export function BudgetDetails({ details }: BudgetDetailsProps) {
  const budget = details.budget as Record<string, unknown>;
  const currentBudget =
    typeof budget.current_budget_micros === "number" ? budget.current_budget_micros : null;
  const recommendedBudget =
    typeof budget.recommended_budget_micros === "number" ? budget.recommended_budget_micros : null;

  return (
    <div className="space-y-2 text-sm">
      {currentBudget !== null && (
        <p>
          <span className="text-muted-foreground">Current Budget:</span>{" "}
          {formatMicros(currentBudget, "/day")}
        </p>
      )}
      {recommendedBudget !== null && (
        <p>
          <span className="text-muted-foreground">Recommended Budget:</span>{" "}
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {formatMicros(recommendedBudget, "/day")}
          </span>
        </p>
      )}
    </div>
  );
}
