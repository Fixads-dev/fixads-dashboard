import type { AssetPerformance, CampaignStatus } from "@/features/campaigns/types";

export const DATE_RANGE_OPTIONS = [
  { value: 7, label: "Last 7 days" },
  { value: 14, label: "Last 14 days" },
  { value: 30, label: "Last 30 days" },
  { value: 60, label: "Last 60 days" },
  { value: 90, label: "Last 90 days" },
] as const;

/** Convert cost in micros to dollars */
export const microsToDollars = (micros: number) => micros / 1_000_000;

export const statusColors: Record<CampaignStatus, "default" | "secondary" | "destructive"> = {
  ENABLED: "default",
  PAUSED: "secondary",
  REMOVED: "destructive",
  UNKNOWN: "secondary",
};

export const statusLabels: Record<CampaignStatus, string> = {
  ENABLED: "Active",
  PAUSED: "Paused",
  REMOVED: "Removed",
  UNKNOWN: "Pending",
};

export const performanceColors: Record<AssetPerformance, string> = {
  BEST: "bg-green-500/10 text-green-600 border-green-500/20",
  GOOD: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  LOW: "bg-red-500/10 text-red-600 border-red-500/20",
  LEARNING: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  PENDING: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  UNSPECIFIED: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export const biddingStrategyLabels: Record<string, string> = {
  TARGET_CPA: "Target CPA",
  TARGET_ROAS: "Target ROAS",
  MAXIMIZE_CONVERSIONS: "Maximize Conversions",
  MAXIMIZE_CONVERSION_VALUE: "Maximize Conversion Value",
  TARGET_SPEND: "Target Spend",
  MANUAL_CPC: "Manual CPC",
  MANUAL_CPM: "Manual CPM",
  UNSPECIFIED: "Not Set",
  UNKNOWN: "Unknown",
};
