"use client";

import { Info } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

interface MetricLabelProps {
  label: string;
  tooltip: string;
  tip?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Reusable metric label with HoverCard tooltip for explanations.
 * Uses the same pattern as the dashboard MetricInfoTooltip.
 */
export function MetricLabel({ label, tooltip, tip, className, size = "sm" }: MetricLabelProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span
        className={cn("text-muted-foreground", {
          "text-xs": size === "sm",
          "text-sm": size === "md",
          "text-base": size === "lg",
        })}
      >
        {label}
      </span>
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            aria-label={`Learn more about ${label}`}
          >
            <Info
              className={cn({
                "h-3 w-3": size === "sm",
                "h-3.5 w-3.5": size === "md",
                "h-4 w-4": size === "lg",
              })}
            />
          </button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80" side="top" align="start">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              {label}
            </h4>
            <p className="text-sm text-muted-foreground">{tooltip}</p>
            {tip && (
              <p className="text-xs text-blue-600 dark:text-blue-400 flex items-start gap-1">
                <span className="font-semibold">Tip:</span> {tip}
              </p>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
