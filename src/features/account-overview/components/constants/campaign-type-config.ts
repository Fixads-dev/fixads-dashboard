import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  Circle,
  Megaphone,
  Monitor,
  Pause,
  Play,
  Rocket,
  Search,
  ShoppingBag,
  Sparkles,
  Zap,
} from "lucide-react";

export const campaignTypeIcons: Record<string, LucideIcon> = {
  SEARCH: Search,
  SHOPPING: ShoppingBag,
  DISPLAY: Monitor,
  PERFORMANCE_MAX: Rocket,
  VIDEO: Play,
  SMART: Zap,
  DISCOVERY: Sparkles,
  DEMAND_GEN: Megaphone,
};

export const campaignTypeColors: Record<string, string> = {
  SEARCH: "bg-blue-500",
  SHOPPING: "bg-green-500",
  DISPLAY: "bg-purple-500",
  PERFORMANCE_MAX: "bg-orange-500",
  VIDEO: "bg-red-500",
  SMART: "bg-yellow-500",
  DISCOVERY: "bg-pink-500",
  DEMAND_GEN: "bg-indigo-500",
};

export const campaignTypeHexColors: Record<string, string> = {
  SEARCH: "#3b82f6",
  SHOPPING: "#22c55e",
  DISPLAY: "#a855f7",
  PERFORMANCE_MAX: "#f97316",
  VIDEO: "#ef4444",
  SMART: "#eab308",
  DISCOVERY: "#ec4899",
  DEMAND_GEN: "#6366f1",
};

export interface StatusConfig {
  color: string;
  bgColor: string;
  icon: LucideIcon;
  label: string;
}

export const statusConfig: Record<string, StatusConfig> = {
  ENABLED: {
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    icon: Circle,
    label: "Active",
  },
  PAUSED: {
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    icon: Pause,
    label: "Paused",
  },
  REMOVED: {
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    icon: AlertCircle,
    label: "Removed",
  },
};
