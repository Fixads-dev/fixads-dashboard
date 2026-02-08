"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingState({
  message = "Loading...",
  className,
  size = "md",
}: LoadingStateProps) {
  const sizeClasses = {
    sm: { container: "p-6", icon: "h-5 w-5", text: "text-sm" },
    md: { container: "p-12", icon: "h-8 w-8", text: "text-base" },
    lg: { container: "p-16", icon: "h-10 w-10", text: "text-lg" },
  };

  return (
    <div className={cn("flex items-center justify-center", sizeClasses[size].container, className)}>
      <Loader2 className={cn("motion-safe:animate-spin text-muted-foreground", sizeClasses[size].icon)} />
      <span className={cn("ml-2 text-muted-foreground", sizeClasses[size].text)}>{message}</span>
    </div>
  );
}
