import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApplyRecommendationParameters } from "../../types";

interface BudgetParametersProps {
  details: Record<string, unknown>;
  parameters: ApplyRecommendationParameters;
  onChange: (params: ApplyRecommendationParameters) => void;
}

export function BudgetParameters({ details, parameters, onChange }: BudgetParametersProps) {
  const budget = details.budget as Record<string, unknown> | undefined;
  const recommended = budget?.recommended_budget_micros as number | undefined;
  const current = budget?.current_budget_micros as number | undefined;

  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="text-sm font-medium">Customize Budget (optional)</h4>

      {current && (
        <p className="text-sm text-muted-foreground">
          Current: ${(current / 1_000_000).toFixed(2)}/day
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="new-budget">New Daily Budget ($)</Label>
        <Input
          id="new-budget"
          type="number"
          step="0.01"
          placeholder={
            recommended ? `Recommended: $${(recommended / 1_000_000).toFixed(2)}` : "Enter amount"
          }
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            if (!Number.isNaN(value)) {
              onChange({
                ...parameters,
                campaign_budget: { new_budget_amount_micros: Math.round(value * 1_000_000) },
              });
            }
          }}
        />
      </div>
    </div>
  );
}
