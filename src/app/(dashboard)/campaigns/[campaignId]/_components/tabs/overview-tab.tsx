"use client";

import {
  Activity,
  CircleDollarSign,
  Eye,
  Loader2,
  MousePointerClick,
  Percent,
  Target,
  TrendingUp,
} from "lucide-react";
import { ImpressionShareChart, KPICard, MetricsLineChart } from "@/components/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AssetGroup,
  Campaign,
  CampaignDetail,
  DailyMetrics,
} from "@/features/campaigns/types";
import { formatCompact, formatCurrency, formatPercent } from "@/shared/lib/format";
import { biddingStrategyLabels, DATE_RANGE_OPTIONS, microsToDollars } from "../constants";

interface OverviewTabProps {
  campaign: Campaign | CampaignDetail;
  dailyMetrics: DailyMetrics[] | undefined;
  dailyLoading: boolean;
  assetGroups: AssetGroup[] | undefined;
  dateRangeDays: number;
  onDateRangeChange: (days: number) => void;
}

// Sub-components to reduce cognitive complexity

function NoActivityNotice() {
  return (
    <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">No activity yet</p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              This campaign hasn&apos;t received any impressions or clicks. Metrics will appear once
              the campaign starts serving ads.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface KPIGridProps {
  campaign: Campaign | CampaignDetail;
  ctr: number;
  conversionRate: number;
  avgCpc: number;
}

function PrimaryKPIGrid({ campaign, ctr, conversionRate }: KPIGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
      <KPICard
        title="Impressions"
        value={formatCompact(campaign.impressions)}
        icon={Eye}
        size="sm"
      />
      <KPICard
        title="Clicks"
        value={formatCompact(campaign.clicks)}
        icon={MousePointerClick}
        size="sm"
      />
      <KPICard
        title="Cost"
        value={formatCurrency(microsToDollars(campaign.cost_micros))}
        icon={CircleDollarSign}
        size="sm"
      />
      <KPICard title="CTR" value={formatPercent(campaign.ctr ?? ctr)} icon={Percent} size="sm" />
      <KPICard
        title="Conversions"
        value={campaign.conversions.toFixed(1)}
        icon={Target}
        size="sm"
      />
      <KPICard
        title="Conv. Rate"
        value={formatPercent(conversionRate)}
        icon={TrendingUp}
        size="sm"
      />
    </div>
  );
}

function SecondaryKPIGrid({ campaign, avgCpc }: KPIGridProps) {
  const costPerConversion = campaign.cost_per_conversion
    ? microsToDollars(campaign.cost_per_conversion)
    : campaign.conversions > 0
      ? microsToDollars(campaign.cost_micros) / campaign.conversions
      : 0;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <KPICard
        title="Avg. CPC"
        value={formatCurrency(
          campaign.average_cpc ? microsToDollars(campaign.average_cpc) : avgCpc,
        )}
        subtitle="Cost per click"
        size="sm"
      />
      <KPICard
        title="Cost/Conv."
        value={formatCurrency(costPerConversion)}
        subtitle="Cost per conversion"
        size="sm"
      />
      <KPICard
        title="Conv. Value"
        value={formatCurrency(campaign.conversions_value ?? 0)}
        subtitle="Total conversion value"
        size="sm"
      />
      <KPICard
        title="View-Through"
        value={formatCompact(campaign.view_through_conversions ?? 0)}
        subtitle="View-through conversions"
        size="sm"
      />
    </div>
  );
}

interface PerformanceChartProps {
  dailyMetrics: DailyMetrics[] | undefined;
  dailyLoading: boolean;
  dateRangeDays: number;
  onDateRangeChange: (days: number) => void;
}

function PerformanceChartSection({
  dailyMetrics,
  dailyLoading,
  dateRangeDays,
  onDateRangeChange,
}: PerformanceChartProps) {
  const dateRangeLabel = DATE_RANGE_OPTIONS.find((o) => o.value === dateRangeDays)?.label ?? "";
  const hasData = dailyMetrics && dailyMetrics.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Performance Over Time</h3>
        <Select value={String(dateRangeDays)} onValueChange={(v) => onDateRangeChange(Number(v))}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {dailyLoading && (
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      )}

      {!dailyLoading && hasData && (
        <MetricsLineChart
          data={dailyMetrics}
          title="Performance Over Time"
          description={dateRangeLabel}
          metrics={[
            { key: "impressions", label: "Impressions", color: "#3b82f6" },
            { key: "clicks", label: "Clicks", color: "#22c55e" },
            { key: "conversions", label: "Conversions", color: "#f59e0b", yAxisId: "right" },
          ]}
          height={300}
        />
      )}

      {!dailyLoading && !hasData && (
        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              No performance data available for the selected period
            </p>
            <p className="text-xs text-muted-foreground mt-1">Try selecting a longer date range</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface QuickStatsProps {
  campaign: Campaign | CampaignDetail;
  assetGroupCount: number;
}

function QuickStatsCard({ campaign, assetGroupCount }: QuickStatsProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Quick Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">All Conversions</span>
            <span className="font-medium">
              {(campaign.all_conversions ?? campaign.conversions).toFixed(1)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">View-Through Conv.</span>
            <span className="font-medium">
              {formatCompact(campaign.view_through_conversions ?? 0)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Asset Groups</span>
            <span className="font-medium">{assetGroupCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Bidding Strategy</span>
            <span className="font-medium">
              {biddingStrategyLabels[campaign.bidding_strategy_type ?? "UNSPECIFIED"]}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main component - now with reduced complexity
export function OverviewTab({
  campaign,
  dailyMetrics,
  dailyLoading,
  assetGroups,
  dateRangeDays,
  onDateRangeChange,
}: OverviewTabProps) {
  const ctr = campaign.impressions ? (campaign.clicks / campaign.impressions) * 100 : 0;
  const conversionRate = campaign.clicks ? (campaign.conversions / campaign.clicks) * 100 : 0;
  const avgCpc = campaign.clicks ? microsToDollars(campaign.cost_micros) / campaign.clicks : 0;

  const showNoActivity = campaign.impressions === 0 && campaign.clicks === 0;
  const hasImpressionShare =
    campaign.search_impression_share !== undefined ||
    campaign.search_budget_lost_impression_share !== undefined;

  return (
    <div className="space-y-6">
      {showNoActivity && <NoActivityNotice />}

      <PrimaryKPIGrid
        campaign={campaign}
        ctr={ctr}
        conversionRate={conversionRate}
        avgCpc={avgCpc}
      />
      <SecondaryKPIGrid
        campaign={campaign}
        ctr={ctr}
        conversionRate={conversionRate}
        avgCpc={avgCpc}
      />

      <PerformanceChartSection
        dailyMetrics={dailyMetrics}
        dailyLoading={dailyLoading}
        dateRangeDays={dateRangeDays}
        onDateRangeChange={onDateRangeChange}
      />

      {hasImpressionShare && (
        <div className="grid gap-6 md:grid-cols-2">
          <ImpressionShareChart
            impressionShare={campaign.search_impression_share ?? 0}
            budgetLost={campaign.search_budget_lost_impression_share ?? 0}
            rankLost={campaign.search_rank_lost_impression_share ?? 0}
            title="Search Impression Share"
            description="How often your ads show vs. eligible impressions"
          />
          <QuickStatsCard campaign={campaign} assetGroupCount={assetGroups?.length ?? 0} />
        </div>
      )}
    </div>
  );
}
