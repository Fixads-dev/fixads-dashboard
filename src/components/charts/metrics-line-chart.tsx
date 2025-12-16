"use client";

import { format, parseISO } from "date-fns";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompact, formatCurrency } from "@/shared/lib/format";

interface MetricConfig {
  key: string;
  label: string;
  color: string;
  formatter?: (value: number) => string;
  yAxisId?: "left" | "right";
}

interface MetricsLineChartProps<T extends Record<string, unknown> = Record<string, unknown>> {
  data: T[];
  title: string;
  description?: string;
  metrics: MetricConfig[];
  dateKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
}

const microsToDollars = (micros: number) => micros / 1_000_000;

const defaultFormatters: Record<string, (value: number) => string> = {
  impressions: formatCompact,
  clicks: formatCompact,
  cost_micros: (v) => formatCurrency(microsToDollars(v)),
  conversions: (v) => v.toFixed(1),
  ctr: (v) => `${(v * 100).toFixed(2)}%`,
  average_cpc: (v) => formatCurrency(microsToDollars(v)),
};

export function MetricsLineChart({
  data,
  title,
  description,
  metrics,
  dateKey = "date",
  height = 300,
  showGrid = true,
  showLegend = true,
}: MetricsLineChartProps) {
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "MMM d");
    } catch {
      return dateStr;
    }
  };

  const formatTooltipValue = (value: number, metricKey: string) => {
    const metric = metrics.find((m) => m.key === metricKey);
    if (metric?.formatter) {
      return metric.formatter(value);
    }
    return defaultFormatters[metricKey]?.(value) ?? value.toLocaleString();
  };

  const hasRightAxis = metrics.some((m) => m.yAxisId === "right");

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            <XAxis
              dataKey={dateKey}
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCompact(value)}
              className="text-muted-foreground"
            />
            {hasRightAxis && (
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCompact(value)}
                className="text-muted-foreground"
              />
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                fontSize: 12,
              }}
              labelFormatter={(label) => formatDate(String(label))}
              formatter={(value, name) => [
                formatTooltipValue(Number(value), String(name)),
                metrics.find((m) => m.key === name)?.label ?? name,
              ]}
            />
            {showLegend && (
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                formatter={(value) => metrics.find((m) => m.key === value)?.label ?? value}
              />
            )}
            {metrics.map((metric) => (
              <Line
                key={metric.key}
                type="monotone"
                dataKey={metric.key}
                stroke={metric.color}
                strokeWidth={2}
                dot={false}
                yAxisId={metric.yAxisId ?? "left"}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
