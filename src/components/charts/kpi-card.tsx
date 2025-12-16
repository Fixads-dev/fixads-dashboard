"use client";

import { type LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  size = "md",
}: KPICardProps) {
  const isPositiveTrend = trend && trend.value >= 0;

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent
        className={cn("p-4", {
          "p-3": size === "sm",
          "p-6": size === "lg",
        })}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p
              className={cn("text-muted-foreground font-medium", {
                "text-xs": size === "sm",
                "text-sm": size === "md",
                "text-base": size === "lg",
              })}
            >
              {title}
            </p>
            <p
              className={cn("font-bold tracking-tight", {
                "text-lg": size === "sm",
                "text-2xl": size === "md",
                "text-3xl": size === "lg",
              })}
            >
              {value}
            </p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            {trend && (
              <div
                className={cn(
                  "flex items-center gap-1 mt-2 text-xs font-medium",
                  isPositiveTrend ? "text-green-600" : "text-red-600",
                )}
              >
                {isPositiveTrend ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>
                  {isPositiveTrend ? "+" : ""}
                  {trend.value.toFixed(1)}%
                </span>
                {trend.label && <span className="text-muted-foreground">{trend.label}</span>}
              </div>
            )}
          </div>
          {Icon && (
            <div
              className={cn("flex items-center justify-center rounded-lg bg-primary/10", {
                "h-8 w-8": size === "sm",
                "h-10 w-10": size === "md",
                "h-12 w-12": size === "lg",
              })}
            >
              <Icon
                className={cn("text-primary", {
                  "h-4 w-4": size === "sm",
                  "h-5 w-5": size === "md",
                  "h-6 w-6": size === "lg",
                })}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
