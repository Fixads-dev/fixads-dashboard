"use client";

import type { PieLabelRenderProps } from "recharts";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PerformanceData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number; // Index signature for recharts compatibility
}

interface PerformancePieChartProps {
  data: PerformanceData[];
  title: string;
  description?: string;
  height?: number;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

const PERFORMANCE_COLORS = {
  best: "#22c55e", // green-500
  good: "#3b82f6", // blue-500
  low: "#ef4444", // red-500
  learning: "#eab308", // yellow-500
  pending: "#6b7280", // gray-500
  unspecified: "#9ca3af", // gray-400
};

export function PerformancePieChart({
  data,
  title,
  description,
  height = 300,
  showLegend = true,
  innerRadius = 60,
  outerRadius = 100,
}: PerformancePieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const renderCustomLabel = (props: PieLabelRenderProps) => {
    const { cx, cy, midAngle, innerRadius: ir, outerRadius: or, percent } = props;
    if (
      typeof cx !== "number" ||
      typeof cy !== "number" ||
      typeof midAngle !== "number" ||
      typeof ir !== "number" ||
      typeof or !== "number" ||
      typeof percent !== "number" ||
      percent < 0.05
    ) {
      return null;
    }

    const RADIAN = Math.PI / 180;
    const radius = ir + (or - ir) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              dataKey="value"
              label={renderCustomLabel}
              labelLine={false}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                fontSize: 12,
              }}
              formatter={(value, name) => [
                `${value} (${((Number(value) / total) * 100).toFixed(1)}%)`,
                name,
              ]}
            />
            {showLegend && (
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                formatter={(value) => (
                  <span className="text-sm text-muted-foreground capitalize">{value}</span>
                )}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
        {/* Center text showing total */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-xs text-muted-foreground">Total Assets</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { PERFORMANCE_COLORS };
