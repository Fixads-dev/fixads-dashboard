import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApplyRecommendationParameters } from "../../types";

interface KeywordParametersProps {
  details: Record<string, unknown>;
  parameters: ApplyRecommendationParameters;
  onChange: (params: ApplyRecommendationParameters) => void;
}

export function KeywordParameters({ details, parameters, onChange }: KeywordParametersProps) {
  const keyword = details.keyword as Record<string, unknown> | undefined;
  const suggestedMatchType = keyword?.match_type as string | undefined;
  const suggestedBid = keyword?.cpc_bid_micros as number | undefined;

  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="text-sm font-medium">Customize (optional)</h4>

      <div className="space-y-2">
        <Label htmlFor="match-type">Match Type</Label>
        <Select
          value={parameters.keyword?.match_type || suggestedMatchType || "BROAD"}
          onValueChange={(value) =>
            onChange({
              ...parameters,
              keyword: { ...parameters.keyword, match_type: value as "EXACT" | "PHRASE" | "BROAD" },
            })
          }
        >
          <SelectTrigger id="match-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BROAD">Broad</SelectItem>
            <SelectItem value="PHRASE">Phrase</SelectItem>
            <SelectItem value="EXACT">Exact</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cpc-bid">Max CPC Bid ($)</Label>
        <Input
          id="cpc-bid"
          type="number"
          step="0.01"
          placeholder={
            suggestedBid ? `Suggested: $${(suggestedBid / 1_000_000).toFixed(2)}` : "Auto"
          }
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            if (!Number.isNaN(value)) {
              onChange({
                ...parameters,
                keyword: { ...parameters.keyword, cpc_bid_micros: Math.round(value * 1_000_000) },
              });
            }
          }}
        />
      </div>
    </div>
  );
}
