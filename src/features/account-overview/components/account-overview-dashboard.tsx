"use client";

import {
  AlertCircle,
  ChevronRight,
  Circle,
  DollarSign,
  Eye,
  Info,
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
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccountOverview } from "../hooks/use-account-overview";
import type { AccountOverviewFilters, TopCampaign } from "../types";
import { formatCost, formatNumber, getCampaignTypeLabel } from "../types";

interface AccountOverviewDashboardProps {
  filters: AccountOverviewFilters;
}

// Metric explanations
const metricExplanations: Record<
  string,
  { title: string; description: string; formula?: string; tip?: string }
> = {
  "Total Spend": {
    title: "Total Ad Spend",
    description:
      "The total amount of money spent on your Google Ads campaigns during the selected time period.",
    tip: "Monitor this to ensure you stay within budget. Lower spend with same results = better efficiency.",
  },
  Impressions: {
    title: "Ad Impressions",
    description:
      "The number of times your ads were shown to users. Each time your ad appears on a search result page or website, it counts as one impression.",
    formula: "CTR (Click-Through Rate) = Clicks ÷ Impressions × 100%",
    tip: "High impressions but low clicks may indicate your ad copy needs improvement.",
  },
  Clicks: {
    title: "Ad Clicks",
    description:
      "The number of times users clicked on your ads. This indicates user interest and drives traffic to your website.",
    formula: "Avg CPC (Cost Per Click) = Total Spend ÷ Total Clicks",
    tip: "Quality clicks matter more than quantity. Focus on attracting your target audience.",
  },
  Conversions: {
    title: "Conversions",
    description:
      "The number of valuable actions users completed after clicking your ad, such as purchases, sign-ups, or form submissions.",
    formula: "Cost per Conversion = Total Spend ÷ Conversions",
    tip: "This is your most important metric - it shows actual business results from your ads.",
  },
  "Conversion Value": {
    title: "Conversion Value",
    description:
      "The total monetary value of all conversions. This represents the revenue generated from your ad campaigns.",
    tip: "Compare this to your spend to understand profitability.",
  },
  ROAS: {
    title: "Return on Ad Spend",
    description:
      "How much revenue you earn for every dollar spent on advertising. A ROAS of 2x means you earn $2 for every $1 spent.",
    formula: "ROAS = Conversion Value ÷ Ad Spend",
    tip: "ROAS > 1x means profitable. Industry average is typically 2-4x depending on margins.",
  },
  "Total Campaigns": {
    title: "Total Campaigns",
    description:
      "The total number of advertising campaigns in your Google Ads account, including both active and paused campaigns.",
    tip: "Consolidating campaigns can simplify management and improve performance.",
  },
  "Top Campaigns": {
    title: "Top Performing Campaigns",
    description:
      "Your best-performing campaigns ranked by the number of conversions. Click on any campaign to view detailed performance data and optimization options.",
    tip: "Focus your budget on top performers. Consider pausing or optimizing low-performing campaigns.",
  },
  "Campaign Distribution": {
    title: "Campaign Type Breakdown",
    description:
      "Shows how your campaigns are distributed across different Google Ads campaign types (Search, Shopping, Display, Performance Max, etc.).",
    tip: "A diverse mix of campaign types can help you reach customers at different stages of their buying journey.",
  },
};

// Info tooltip component
function MetricInfo({ metricName }: { metricName: string }) {
  const info = metricExplanations[metricName];
  if (!info) return null;

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className="ml-1.5 inline-flex items-center text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          aria-label={`Learn more about ${metricName}`}
        >
          <Info className="h-4 w-4" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="top" align="start">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            {info.title}
          </h4>
          <p className="text-sm text-muted-foreground">{info.description}</p>
          {info.formula && (
            <div className="bg-muted/50 rounded-md p-2 text-xs font-mono">{info.formula}</div>
          )}
          {info.tip && (
            <p className="text-xs text-blue-600 dark:text-blue-400 flex items-start gap-1">
              <span className="font-semibold">Tip:</span> {info.tip}
            </p>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

// KPI Card component with info tooltip
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
        <div className="flex items-center">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <MetricInfo metricName={title} />
        </div>
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

// Campaign type color mapping (Tailwind classes for UI)
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

// Campaign type hex colors (for recharts)
const campaignTypeHexColors: Record<string, string> = {
  SEARCH: "#3b82f6", // blue-500
  SHOPPING: "#22c55e", // green-500
  DISPLAY: "#a855f7", // purple-500
  PERFORMANCE_MAX: "#f97316", // orange-500
  VIDEO: "#ef4444", // red-500
  SMART: "#eab308", // yellow-500
  DISCOVERY: "#ec4899", // pink-500
  DEMAND_GEN: "#6366f1", // indigo-500
};

// Status color and icon mapping
const statusConfig: Record<
  string,
  { color: string; bgColor: string; icon: React.ElementType; label: string }
> = {
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
            href={`/campaigns/${campaign.campaign_id}?account=${accountId || ""}`}
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

// Campaign type distribution - Simple horizontal bar chart
function CampaignTypeDistribution({ counts }: { counts: Record<string, number> }) {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  if (total === 0) {
    return <p className="text-center text-muted-foreground py-4">No campaigns</p>;
  }

  // Prepare data sorted by count (highest first)
  const data = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => ({
      type,
      name: getCampaignTypeLabel(type),
      count,
      percentage: (count / total) * 100,
      color: campaignTypeHexColors[type] || "#6b7280",
    }));

  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div className="space-y-3">
      {data.map((item) => {
        const Icon = campaignTypeIcons[item.type] || Megaphone;
        const barWidth = (item.count / maxCount) * 100;

        return (
          <div key={item.type} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" style={{ color: item.color }} />
                <span className="font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="tabular-nums">{item.count}</span>
                <span className="text-xs">({item.percentage.toFixed(0)}%)</span>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${barWidth}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        );
      })}
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
            <div className="flex items-center">
              <CardTitle className="text-sm font-medium">Conversion Value</CardTitle>
              <MetricInfo metricName="Conversion Value" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCost(metrics.conversions_value * 1_000_000, data.currency_code || undefined)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <CardTitle className="text-sm font-medium">ROAS</CardTitle>
              <MetricInfo metricName="ROAS" />
            </div>
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
            <div className="flex items-center">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <MetricInfo metricName="Total Campaigns" />
            </div>
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
            <div className="flex items-center gap-1">
              <CardTitle className="text-lg">Top Campaigns</CardTitle>
              <MetricInfo metricName="Top Campaigns" />
            </div>
            <CardDescription>By conversion count • Click to view details</CardDescription>
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
            <div className="flex items-center gap-1">
              <CardTitle className="text-lg">Campaign Distribution</CardTitle>
              <MetricInfo metricName="Campaign Distribution" />
            </div>
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
