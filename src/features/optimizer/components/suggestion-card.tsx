"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { TextSuggestion } from "../types";

interface SuggestionCardProps {
  suggestion: TextSuggestion;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

const improvementTypeLabels: Record<TextSuggestion["improvementType"], string> = {
  clarity: "Clarity",
  engagement: "Engagement",
  keywords: "Keywords",
  compliance: "Compliance",
};

export function SuggestionCard({ suggestion, isSelected, onToggle }: SuggestionCardProps) {
  const confidencePercent = Math.round(suggestion.confidenceScore * 100);

  return (
    <Card className={isSelected ? "ring-2 ring-primary" : ""}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <Checkbox
            id={suggestion.id}
            checked={isSelected}
            onCheckedChange={() => onToggle(suggestion.id)}
          />
          <div className="flex items-center gap-2">
            <Badge variant="outline">{improvementTypeLabels[suggestion.improvementType]}</Badge>
            <Badge variant="secondary">{confidencePercent}% confidence</Badge>
          </div>
        </div>
        <Sparkles className="h-4 w-4 text-yellow-500" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Original</p>
            <p className="text-sm rounded bg-muted p-2">{suggestion.originalText}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <ArrowRight className="h-3 w-3" />
              Suggested
            </p>
            <p className="text-sm rounded bg-primary/10 p-2 text-primary">
              {suggestion.suggestedText}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
      </CardContent>
    </Card>
  );
}
