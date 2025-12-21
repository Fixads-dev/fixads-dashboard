"use client";

import { Activity, Loader2 } from "lucide-react";
import { MetricsLineChart } from "@/components/charts";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DailyMetrics } from "@/features/campaigns/types";
import { formatCurrency } from "@/shared/lib/format";
import { DATE_RANGE_OPTIONS, microsToDollars } from "../constants";

interface PerformanceTabProps {
  dailyMetrics: DailyMetrics[] | undefined;
  dailyLoading: boolean;
  dateRangeDays: number;
  onDateRangeChange: (days: number) => void;
}

export function PerformanceTab({
  dailyMetrics,
  dailyLoading,
  dateRangeDays,
  onDateRangeChange,
}: PerformanceTabProps) {
  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Detailed Performance</h3>
        <Select
          value={String(dateRangeDays)}
          onValueChange={(value) => onDateRangeChange(Number(value))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {dailyLoading && (
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      )}

      {/* Cost Analysis */}
      {!dailyLoading && dailyMetrics && dailyMetrics.length > 0 && (
        <>
          <MetricsLineChart
            data={dailyMetrics}
            title="Cost Analysis"
            description={`Daily spending and CPC - ${DATE_RANGE_OPTIONS.find((o) => o.value === dateRangeDays)?.label ?? ""}`}
            metrics={[
              {
                key: "cost_micros",
                label: "Cost",
                color: "#ef4444",
                formatter: (v) => formatCurrency(microsToDollars(v)),
              },
              {
                key: "average_cpc",
                label: "Avg. CPC",
                color: "#8b5cf6",
                yAxisId: "right",
                formatter: (v) => formatCurrency(microsToDollars(v)),
              },
            ]}
            height={300}
          />

          <MetricsLineChart
            data={dailyMetrics}
            title="Conversion Performance"
            description={`Daily conversions and CTR - ${DATE_RANGE_OPTIONS.find((o) => o.value === dateRangeDays)?.label ?? ""}`}
            metrics={[
              { key: "conversions", label: "Conversions", color: "#22c55e" },
              {
                key: "ctr",
                label: "CTR",
                color: "#f59e0b",
                yAxisId: "right",
                formatter: (v) => `${(v * 100).toFixed(2)}%`,
              },
            ]}
            height={300}
          />
        </>
      )}

      {!dailyLoading && (!dailyMetrics || dailyMetrics.length === 0) && (
        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              No performance data available for the selected period
            </p>
            <p className="text-xs text-muted-foreground mt-1">Try selecting a longer date range</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
