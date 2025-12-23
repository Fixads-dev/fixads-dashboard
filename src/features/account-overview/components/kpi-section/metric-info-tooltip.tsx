import { Info } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { metricExplanations } from "../constants/metric-explanations";

interface MetricInfoTooltipProps {
  metricName: string;
}

export function MetricInfoTooltip({ metricName }: MetricInfoTooltipProps) {
  const info = metricExplanations[metricName];
  if (!info) return null;

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className="ml-1.5 inline-flex items-center text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          aria-label={`Learn more about ${metricName}`}
        >
          <Info className="h-4 w-4" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="top" align="start">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            {info.title}
          </h4>
          <p className="text-sm text-muted-foreground">{info.description}</p>
          {info.formula && (
            <div className="bg-muted/50 rounded-md p-2 text-xs font-mono">{info.formula}</div>
          )}
          {info.tip && (
            <p className="text-xs text-blue-600 dark:text-blue-400 flex items-start gap-1">
              <span className="font-semibold">Tip:</span> {info.tip}
            </p>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
