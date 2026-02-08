"use client";

import { Clock, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangeSelect } from "@/components/ui/date-range-select";
import { EmptyState } from "@/shared/components";
import { LoadingState } from "@/components/ui/loading-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TabPageHeader } from "@/components/ui/tab-page-header";
import { ChartCard } from "@/components/charts";
import { useTimePerformance } from "@/features/campaigns";
import type {
  DayOfWeek,
  DayOfWeekPerformance,
  HeatmapCell,
  HourlyPerformance,
} from "@/features/campaigns/types";
import { cn } from "@/lib/utils";
import {
  createTooltipFormatter,
  getHeatmapColor,
  HEATMAP_LEGEND_COLORS,
  microsToDollars,
} from "@/shared/lib/chart-utils";
import { formatCompact, formatCurrency, formatPercent } from "@/shared/lib/format";

interface TimeHeatmapTabProps {
  accountId: string;
  campaignId: string;
}

type MetricType = "clicks" | "impressions" | "conversions" | "ctr" | "cost_micros";

const DAYS_ORDER: DayOfWeek[] = [
  "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY",
];

const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed",
  THURSDAY: "Thu", FRIDAY: "Fri", SATURDAY: "Sat", SUNDAY: "Sun",
};

const METRIC_LABELS: Record<MetricType, string> = {
  clicks: "Clicks",
  impressions: "Impressions",
  conversions: "Conversions",
  ctr: "CTR",
  cost_micros: "Cost",
};

// Heatmap Grid Component
function HeatmapGrid({ data, metric }: { data: HeatmapCell[]; metric: MetricType }) {
  const cellMap = new Map<string, HeatmapCell>();
  data.forEach((cell) => cellMap.set(`${cell.day_of_week}-${cell.hour}`, cell));

  const maxValue = Math.max(
    ...data.map((cell) => {
      if (metric === "ctr") return cell.ctr;
      if (metric === "cost_micros") return cell.cost_micros;
      return cell[metric] as number;
    }),
    1,
  );

  const getIntensity = (cell: HeatmapCell): number => {
    const value = metric === "ctr" ? cell.ctr : metric === "cost_micros" ? cell.cost_micros : cell[metric];
    return (value as number) / maxValue;
  };

  const formatValue = (cell: HeatmapCell): string => {
    if (metric === "ctr") return formatPercent(cell.ctr);
    if (metric === "cost_micros") return formatCurrency(microsToDollars(cell.cost_micros));
    return formatCompact(cell[metric] as number);
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Hour headers */}
        <div className="flex">
          <div className="w-16 flex-shrink-0" />
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="w-12 flex-shrink-0 text-center text-xs text-muted-foreground py-1">
              {i.toString().padStart(2, "0")}
            </div>
          ))}
        </div>

        {/* Heatmap rows */}
        {DAYS_ORDER.map((day) => (
          <div key={day} className="flex">
            <div className="w-16 flex-shrink-0 text-sm font-medium py-2 flex items-center">
              {DAY_LABELS[day]}
            </div>
            {Array.from({ length: 24 }, (_, hour) => {
              const cell = cellMap.get(`${day}-${hour}`);
              const intensity = cell ? getIntensity(cell) : 0;
              return (
                <div
                  key={hour}
                  className={cn(
                    "w-12 h-10 flex-shrink-0 border border-gray-200 dark:border-gray-700",
                    "flex items-center justify-center text-xs cursor-default",
                    "transition-colors hover:ring-2 hover:ring-primary hover:z-10",
                    getHeatmapColor(intensity),
                  )}
                  title={cell ? `${DAY_LABELS[day]} ${hour}:00\n${METRIC_LABELS[metric]}: ${formatValue(cell)}` : "No data"}
                >
                  {cell && formatCompact(cell[metric === "ctr" ? "clicks" : metric] as number)}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <span className="text-xs text-muted-foreground">Low</span>
        <div className="flex gap-0.5">
          {HEATMAP_LEGEND_COLORS.map((color, i) => (
            <div key={i} className={cn("w-6 h-4 rounded-sm", color)} />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">High</span>
      </div>
    </div>
  );
}

// Hourly Performance Chart
function HourlyChart({ data }: { data: HourlyPerformance[] }) {
  const chartData = data
    .sort((a, b) => a.hour - b.hour)
    .map((h) => ({
      hour: `${h.hour.toString().padStart(2, "0")}:00`,
      clicks: h.clicks,
      conversions: h.conversions,
      cost: microsToDollars(h.cost_micros),
    }));

  return (
    <ChartCard title="Hourly Performance" description="Performance breakdown by hour of day">
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
        <YAxis />
        <Tooltip formatter={createTooltipFormatter("compact")} />
        <Legend />
        <Bar dataKey="clicks" fill="#3b82f6" name="Clicks" />
        <Bar dataKey="conversions" fill="#10b981" name="Conversions" />
      </BarChart>
    </ChartCard>
  );
}

// Day of Week Performance Chart
function DayOfWeekChart({ data }: { data: DayOfWeekPerformance[] }) {
  const chartData = DAYS_ORDER.map((day) => {
    const dayData = data.find((d) => d.day_of_week === day);
    return {
      day: DAY_LABELS[day],
      clicks: dayData?.clicks ?? 0,
      conversions: dayData?.conversions ?? 0,
      cost: microsToDollars(dayData?.cost_micros ?? 0),
    };
  });

  return (
    <ChartCard title="Day of Week Performance" description="Performance breakdown by day">
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip formatter={createTooltipFormatter("compact")} />
        <Legend />
        <Bar dataKey="clicks" fill="#3b82f6" name="Clicks" />
        <Bar dataKey="conversions" fill="#10b981" name="Conversions" />
      </BarChart>
    </ChartCard>
  );
}

// Best Times Section
function BestTimesSection({ bestHours, bestDays }: { bestHours: number[]; bestDays: DayOfWeek[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Best Performing Times
        </CardTitle>
        <CardDescription>Recommended times for peak performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Best Hours</h4>
          <div className="flex flex-wrap gap-2">
            {bestHours.length > 0 ? (
              bestHours.map((hour) => (
                <Badge key={hour} variant="secondary">
                  {hour.toString().padStart(2, "0")}:00
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">Not enough data</span>
            )}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">Best Days</h4>
          <div className="flex flex-wrap gap-2">
            {bestDays.length > 0 ? (
              bestDays.map((day) => (
                <Badge key={day} variant="secondary">{DAY_LABELS[day]}</Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">Not enough data</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TimeHeatmapTab({ accountId, campaignId }: TimeHeatmapTabProps) {
  const [dateRange, setDateRange] = useState("LAST_30_DAYS");
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("clicks");
  const { data, isLoading } = useTimePerformance(accountId, campaignId, dateRange);

  if (isLoading) {
    return <LoadingState message="Loading time performance data..." />;
  }

  if (!data || data.heatmap.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="No Time Performance Data"
        description="Time-based performance data is not yet available for this campaign."
      />
    );
  }

  return (
    <div className="space-y-6">
      <TabPageHeader
        title="Time Performance"
        description="Analyze performance by hour and day of week"
        actions={
          <>
            <Select value={selectedMetric} onValueChange={(v) => setSelectedMetric(v as MetricType)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(METRIC_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DateRangeSelect value={dateRange} onValueChange={setDateRange} />
          </>
        }
      />

      <BestTimesSection bestHours={data.best_hours} bestDays={data.best_days} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance Heatmap</CardTitle>
          <CardDescription>
            {METRIC_LABELS[selectedMetric]} by hour (columns) and day (rows)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HeatmapGrid data={data.heatmap} metric={selectedMetric} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <HourlyChart data={data.by_hour} />
        <DayOfWeekChart data={data.by_day_of_week} />
      </div>
    </div>
  );
}
