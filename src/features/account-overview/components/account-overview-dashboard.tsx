"use client";

import {
  AlertCircle,
  ChevronRight,
  Circle,
  DollarSign,
  Eye,
  Megaphone,
  Monitor,
  MousePointer,
  Pause,
  Play,
  RefreshCw,
  Rocket,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccountOverview } from "../hooks/use-account-overview";
import type { AccountOverviewFilters, TopCampaign } from "../types";
import { formatCost, formatNumber, getCampaignTypeLabel } from "../types";

interface AccountOverviewDashboardProps {
  filters: AccountOverviewFilters;
}

// KPI Card component
function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

// Campaign type icon mapping
const campaignTypeIcons: Record<string, React.ElementType> = {
  SEARCH: Search,
  SHOPPING: ShoppingBag,
  DISPLAY: Monitor,
  PERFORMANCE_MAX: Rocket,
  VIDEO: Play,
  SMART: Zap,
  DISCOVERY: Sparkles,
  DEMAND_GEN: Megaphone,
};

// Campaign type color mapping
const campaignTypeColors: Record<string, string> = {
  SEARCH: "bg-blue-500",
  SHOPPING: "bg-green-500",
  DISPLAY: "bg-purple-500",
  PERFORMANCE_MAX: "bg-orange-500",
  VIDEO: "bg-red-500",
  SMART: "bg-yellow-500",
  DISCOVERY: "bg-pink-500",
  DEMAND_GEN: "bg-indigo-500",
};

// Status color and icon mapping
const statusConfig: Record<string, { color: string; bgColor: string; icon: React.ElementType; label: string }> = {
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

// Top campaigns table
function TopCampaignsTable({
  campaigns,
  currencyCode,
  accountId,
}: {
  campaigns: TopCampaign[];
  currencyCode?: string;
  accountId?: string;
}) {
  if (!campaigns.length) {
    return <p className="text-center text-muted-foreground py-8">No campaigns with conversions</p>;
  }

  return (
    <div className="space-y-2">
      {campaigns.map((campaign) => {
        const TypeIcon = campaignTypeIcons[campaign.campaign_type] || Megaphone;
        const typeColor = campaignTypeColors[campaign.campaign_type] || "bg-gray-500";
        const status = statusConfig[campaign.status] || statusConfig.PAUSED;
        const StatusIcon = status.icon;

        return (
          <Link
            key={campaign.campaign_id}
            href={`/campaigns/${campaign.campaign_id}?account_id=${accountId || ""}`}
            className="block"
          >
            <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent hover:border-primary/50 transition-colors cursor-pointer group">
              {/* Campaign type icon */}
              <div className={`p-2 rounded-lg ${typeColor} bg-opacity-20 shrink-0`}>
                <TypeIcon className={`h-5 w-5 ${typeColor.replace("bg-", "text-")}`} />
              </div>

              {/* Campaign info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate group-hover:text-primary transition-colors">
                  {campaign.campaign_name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {/* Campaign type badge */}
                  <Badge variant="outline" className="text-xs">
                    {getCampaignTypeLabel(campaign.campaign_type)}
                  </Badge>
                  {/* Status badge with color */}
                  <Badge className={`text-xs ${status.bgColor} ${status.color} border-0`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>
              </div>

              {/* Metrics */}
              <div className="text-right shrink-0">
                <p className="font-bold text-lg">{campaign.conversions.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">conversions</p>
              </div>

              {/* Cost */}
              <div className="text-right shrink-0 min-w-[80px]">
                <p className="font-medium">{formatCost(campaign.cost_micros, currencyCode)}</p>
                <p className="text-xs text-muted-foreground">spent</p>
              </div>

              {/* Arrow indicator */}
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// Campaign type distribution
function CampaignTypeDistribution({ counts }: { counts: Record<string, number> }) {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  if (total === 0) {
    return <p className="text-center text-muted-foreground py-4">No campaigns</p>;
  }

  // Sort by count (highest first)
  const sortedEntries = Object.entries(counts).sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-3">
      {sortedEntries.map(([type, count]) => {
        const Icon = campaignTypeIcons[type] || Megaphone;
        const colorClass = campaignTypeColors[type] || "bg-gray-500";
        const percentage = ((count / total) * 100).toFixed(0);

        return (
          <div key={type} className="flex items-center gap-3 py-1">
            {/* Icon */}
            <div className={`p-1.5 rounded ${colorClass} bg-opacity-20`}>
              <Icon className={`h-4 w-4 ${colorClass.replace("bg-", "text-")}`} />
            </div>

            {/* Label and count */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{getCampaignTypeLabel(type)}</span>
                <span className="text-sm text-muted-foreground">
                  {count} {count === 1 ? "campaign" : "campaigns"} ({percentage}%)
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className={`${colorClass} rounded-full h-2 transition-all`}
                  style={{ width: `${(count / total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* Total summary */}
      <div className="pt-2 mt-2 border-t flex justify-between text-sm">
        <span className="font-medium">Total</span>
        <span className="font-bold">{total} campaigns</span>
      </div>
    </div>
  );
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {["sk-1", "sk-2", "sk-3", "sk-4"].map((id) => (
          <Card key={id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["sk-5", "sk-6", "sk-7"].map((id) => (
                <Skeleton key={id} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["sk-8", "sk-9", "sk-10"].map((id) => (
                <Skeleton key={id} className="h-6 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function AccountOverviewDashboard({ filters }: AccountOverviewDashboardProps) {
  const { data, isLoading, error, refetch, isFetching } = useAccountOverview(filters);

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load account overview</h3>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : "An unexpected error occurred"}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { metrics } = data;

  return (
    <div className="space-y-6">
      {/* Refresh button */}
      <div className="flex justify-end">
        <Button onClick={() => refetch()} variant="ghost" size="sm" disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Spend"
          value={formatCost(metrics.cost_micros, data.currency_code || undefined)}
          subtitle={`${data.date_range.replace(/_/g, " ").toLowerCase()}`}
          icon={DollarSign}
        />
        <KPICard
          title="Impressions"
          value={formatNumber(metrics.impressions)}
          subtitle={`${metrics.ctr.toFixed(2)}% CTR`}
          icon={Eye}
        />
        <KPICard
          title="Clicks"
          value={formatNumber(metrics.clicks)}
          subtitle={`${formatCost(metrics.average_cpc_micros, data.currency_code || undefined)} avg CPC`}
          icon={MousePointer}
        />
        <KPICard
          title="Conversions"
          value={metrics.conversions.toFixed(1)}
          subtitle={
            metrics.cost_per_conversion_micros > 0
              ? `${formatCost(metrics.cost_per_conversion_micros, data.currency_code || undefined)} / conv`
              : "No conversions"
          }
          icon={ShoppingCart}
        />
      </div>

      {/* Secondary metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversion Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCost(metrics.conversions_value * 1_000_000, data.currency_code || undefined)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ROAS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {metrics.roas > 0 ? `${metrics.roas.toFixed(2)}x` : "N/A"}
              {metrics.roas > 1 && <TrendingUp className="h-5 w-5 text-green-500" />}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total_campaigns}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Campaigns</CardTitle>
            <CardDescription>By conversion count</CardDescription>
          </CardHeader>
          <CardContent>
            <TopCampaignsTable
              campaigns={data.top_campaigns}
              currencyCode={data.currency_code || undefined}
              accountId={filters.account_id}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Campaign Distribution</CardTitle>
            <CardDescription>By campaign type</CardDescription>
          </CardHeader>
          <CardContent>
            <CampaignTypeDistribution counts={data.campaign_type_counts} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
