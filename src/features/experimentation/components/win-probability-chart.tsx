"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AssetProbability } from "../types";

interface WinProbabilityChartProps {
  assets: AssetProbability[];
  title?: string;
  description?: string;
  maxDisplay?: number;
}

/**
 * Get color based on win probability value
 */
function getBarColor(probability: number, status: string): string {
  if (status === "DECAYED") return "#ef4444"; // red-500
  if (status === "PAUSED") return "#9ca3af"; // gray-400

  if (probability >= 0.1) return "#22c55e"; // green-500 - High performer
  if (probability >= 0.05) return "#eab308"; // yellow-500 - Average
  if (probability >= 0.02) return "#f97316"; // orange-500 - Below average
  return "#ef4444"; // red-500 - Low performer
}

/**
 * Truncate text for display
 */
function truncateText(text: string, maxLength = 20): string {
  if (!text) return "Unknown";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Custom tooltip for the chart
 */
function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: AssetProbability & { displayName: string } }>;
}) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const winProb = (data.win_probability * 100).toFixed(2);

  return (
    <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium mb-2">{data.asset_id.slice(0, 12)}...</p>
      <div className="space-y-1 text-muted-foreground">
        <p>
          Win Probability: <span className="font-mono text-foreground">{winProb}%</span>
        </p>
        <p>
          Beta({data.alpha.toFixed(1)}, {data.beta.toFixed(1)})
        </p>
        <p>
          Status: <span className="font-medium text-foreground">{data.status}</span>
        </p>
        <p>Mature Clicks: {data.mature_clicks.toLocaleString()}</p>
        <p>Conversions: {data.mature_conversions.toLocaleString()}</p>
        {data.z_score != null && <p>Z-Score: {data.z_score.toFixed(2)}</p>}
      </div>
    </div>
  );
}

export function WinProbabilityChart({
  assets,
  title = "Asset Win Probabilities",
  description = "Thompson Sampling belief states ranked by win probability",
  maxDisplay = 15,
}: WinProbabilityChartProps) {
  // Sort by win probability and take top N
  const sortedAssets = [...assets]
    .sort((a, b) => b.win_probability - a.win_probability)
    .slice(0, maxDisplay);

  // Transform data for chart
  const chartData = sortedAssets.map((asset) => ({
    ...asset,
    displayName: truncateText(asset.asset_id.slice(0, 12), 12),
    winProbabilityPercent: asset.win_probability * 100,
  }));

  if (assets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No MAB states available for this campaign
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description} ({assets.length} total assets)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 35)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis
              type="number"
              domain={[0, "dataMax"]}
              tickFormatter={(value) => `${value.toFixed(1)}%`}
              fontSize={12}
            />
            <YAxis
              type="category"
              dataKey="displayName"
              width={120}
              tick={{ fontSize: 11 }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="winProbabilityPercent" radius={[0, 4, 4, 0]} maxBarSize={24}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.asset_id}
                  fill={getBarColor(entry.win_probability, entry.status)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <span>High (&ge;10%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-yellow-500" />
            <span>Average (5-10%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-orange-500" />
            <span>Below Avg (2-5%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-500" />
            <span>Low/Decayed (&lt;2%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-gray-400" />
            <span>Paused</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
