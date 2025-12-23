"use client";

import {
  AlertCircle,
  DollarSign,
  Eye,
  MousePointer,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccountOverview } from "../hooks/use-account-overview";
import type { AccountOverviewFilters } from "../types";
import { formatCost, formatNumber } from "../types";
import { CampaignDistributionSection } from "./campaign-distribution-section";
import { KPICard, MetricInfoTooltip } from "./kpi-section";
import { AccountOverviewSkeleton } from "./loading-skeleton";
import { TopCampaignsSection } from "./top-campaigns-section";

interface AccountOverviewDashboardProps {
  filters: AccountOverviewFilters;
}

export function AccountOverviewDashboard({ filters }: AccountOverviewDashboardProps) {
  const { data, isLoading, error, refetch, isFetching } = useAccountOverview(filters);

  if (isLoading) {
    return <AccountOverviewSkeleton />;
  }

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
  const currencyCode = data.currency_code || undefined;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => refetch()} variant="ghost" size="sm" disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Spend"
          value={formatCost(metrics.cost_micros, currencyCode)}
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
          subtitle={`${formatCost(metrics.average_cpc_micros, currencyCode)} avg CPC`}
          icon={MousePointer}
        />
        <KPICard
          title="Conversions"
          value={metrics.conversions.toFixed(1)}
          subtitle={
            metrics.cost_per_conversion_micros > 0
              ? `${formatCost(metrics.cost_per_conversion_micros, currencyCode)} / conv`
              : "No conversions"
          }
          icon={ShoppingCart}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <CardTitle className="text-sm font-medium">Conversion Value</CardTitle>
              <MetricInfoTooltip metricName="Conversion Value" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCost(metrics.conversions_value * 1_000_000, currencyCode)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <CardTitle className="text-sm font-medium">ROAS</CardTitle>
              <MetricInfoTooltip metricName="ROAS" />
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
              <MetricInfoTooltip metricName="Total Campaigns" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total_campaigns}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1">
              <CardTitle className="text-lg">Top Campaigns</CardTitle>
              <MetricInfoTooltip metricName="Top Campaigns" />
            </div>
            <CardDescription>By conversion count - Click to view details</CardDescription>
          </CardHeader>
          <CardContent>
            <TopCampaignsSection
              campaigns={data.top_campaigns}
              currencyCode={currencyCode}
              accountId={filters.account_id}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1">
              <CardTitle className="text-lg">Campaign Distribution</CardTitle>
              <MetricInfoTooltip metricName="Campaign Distribution" />
            </div>
            <CardDescription>By campaign type</CardDescription>
          </CardHeader>
          <CardContent>
            <CampaignDistributionSection counts={data.campaign_type_counts} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
