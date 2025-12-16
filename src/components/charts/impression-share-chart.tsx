"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercent } from "@/shared/lib/format";

interface ImpressionShareData {
  name: string;
  value: number;
  color: string;
  description?: string;
}

interface ImpressionShareChartProps {
  impressionShare?: number;
  budgetLost?: number;
  rankLost?: number;
  title?: string;
  description?: string;
  height?: number;
}

export function ImpressionShareChart({
  impressionShare = 0,
  budgetLost = 0,
  rankLost = 0,
  title = "Impression Share",
  description,
  height = 200,
}: ImpressionShareChartProps) {
  // Calculate the remaining portion (other factors)
  const otherLost = Math.max(0, 100 - impressionShare * 100 - budgetLost * 100 - rankLost * 100);

  const data: ImpressionShareData[] = [
    {
      name: "Won",
      value: impressionShare * 100,
      color: "#22c55e", // green
      description: "Impressions you received",
    },
    {
      name: "Lost (Budget)",
      value: budgetLost * 100,
      color: "#f97316", // orange
      description: "Lost due to insufficient budget",
    },
    {
      name: "Lost (Rank)",
      value: rankLost * 100,
      color: "#ef4444", // red
      description: "Lost due to low Ad Rank",
    },
  ];

  // Only add "Other" if there's a meaningful amount
  if (otherLost > 1) {
    data.push({
      name: "Other",
      value: otherLost,
      color: "#9ca3af", // gray
      description: "Other factors",
    });
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={[{ name: "Share", ...Object.fromEntries(data.map((d) => [d.name, d.value])) }]}
              layout="vertical"
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  fontSize: 12,
                }}
                formatter={(value, name) => {
                  const item = data.find((d) => d.name === name);
                  return [`${Number(value).toFixed(1)}%`, item?.description ?? name];
                }}
              />
              {data.map((item) => (
                <Bar key={item.name} dataKey={item.name} stackId="share" fill={item.color}>
                  <Cell fill={item.color} />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {data.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-sm shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  <p className="text-muted-foreground">{formatPercent(item.value)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
