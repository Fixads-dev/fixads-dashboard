"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface OptimizationProgressProps {
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  message?: string;
}

export function OptimizationProgress({ status, progress, message }: OptimizationProgressProps) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === "processing" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          {status === "completed" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          {status === "failed" && <XCircle className="h-4 w-4 text-destructive" />}
          <span className="text-sm font-medium">
            {status === "pending" && "Starting analysis..."}
            {status === "processing" && "Analyzing assets..."}
            {status === "completed" && "Analysis complete"}
            {status === "failed" && "Analysis failed"}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  );
}
