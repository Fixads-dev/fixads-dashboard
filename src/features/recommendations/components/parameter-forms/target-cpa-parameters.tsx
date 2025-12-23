import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApplyRecommendationParameters } from "../../types";

interface TargetCpaParametersProps {
  details: Record<string, unknown>;
  parameters: ApplyRecommendationParameters;
  onChange: (params: ApplyRecommendationParameters) => void;
}

export function TargetCpaParameters({ details, parameters, onChange }: TargetCpaParametersProps) {
  const cpa = details.target_cpa as Record<string, unknown> | undefined;
  const recommended = cpa?.target_cpa_micros as number | undefined;

  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="text-sm font-medium">Customize Target CPA (optional)</h4>

      <div className="space-y-2">
        <Label htmlFor="target-cpa">Target CPA ($)</Label>
        <Input
          id="target-cpa"
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
                target_cpa: { target_cpa_micros: Math.round(value * 1_000_000) },
              });
            }
          }}
        />
      </div>
    </div>
  );
}
