import { formatCompact, formatCurrency, formatPercent } from "@/shared/lib/format";

/**
 * Shared chart color palette for consistent styling across all charts
 */
export const CHART_COLORS = {
  primary: "#3b82f6",   // Blue
  success: "#10b981",   // Green
  warning: "#f59e0b",   // Amber
  danger: "#ef4444",    // Red
  purple: "#8b5cf6",
  cyan: "#06b6d4",
  pink: "#ec4899",
  lime: "#84cc16",
  orange: "#f97316",
  indigo: "#6366f1",
} as const;

/**
 * Default color sequence for multi-series charts
 */
export const CHART_COLOR_SEQUENCE = [
  CHART_COLORS.primary,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.danger,
  CHART_COLORS.purple,
  CHART_COLORS.cyan,
  CHART_COLORS.pink,
  CHART_COLORS.lime,
  CHART_COLORS.orange,
  CHART_COLORS.indigo,
];

/**
 * Type-safe tooltip formatter factory for Recharts
 * Handles undefined values gracefully
 */
export function createTooltipFormatter(type: "number" | "percent" | "currency" | "compact" = "compact") {
  return (value: unknown): string => {
    if (value === undefined || value === null) return "N/A";
    const numValue = Number(value);
    if (isNaN(numValue)) return "N/A";

    switch (type) {
      case "percent":
        return formatPercent(numValue);
      case "currency":
        return formatCurrency(numValue);
      case "compact":
        return formatCompact(numValue);
      default:
        return numValue.toLocaleString();
    }
  };
}

/**
 * Convert micros (Google Ads format) to dollars
 */
export function microsToDollars(micros: number): number {
  return micros / 1_000_000;
}

/**
 * Create a consistent pie chart label formatter
 * Only shows label if percentage is above threshold
 * Compatible with Recharts PieLabelRenderProps
 */
export function createPieLabelFormatter(threshold: number = 0.05) {
  return ({ name, percent }: { name?: string; percent?: number }): string => {
    const pct = percent ?? 0;
    const displayName = name ?? "";
    return pct > threshold ? `${displayName} (${(pct * 100).toFixed(0)}%)` : "";
  };
}

/**
 * Get heatmap color based on intensity (0-1)
 */
export function getHeatmapColor(intensity: number): string {
  if (intensity === 0) return "bg-gray-100 dark:bg-gray-800";
  if (intensity < 0.2) return "bg-blue-100 dark:bg-blue-900/30";
  if (intensity < 0.4) return "bg-blue-200 dark:bg-blue-800/40";
  if (intensity < 0.6) return "bg-yellow-200 dark:bg-yellow-700/40";
  if (intensity < 0.8) return "bg-orange-200 dark:bg-orange-700/50";
  return "bg-red-300 dark:bg-red-700/60";
}

/**
 * Heatmap color legend classes (for rendering legend)
 */
export const HEATMAP_LEGEND_COLORS = [
  "bg-gray-100",
  "bg-blue-100",
  "bg-blue-200",
  "bg-yellow-200",
  "bg-orange-200",
  "bg-red-300",
];
