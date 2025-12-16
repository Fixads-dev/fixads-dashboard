"use client";

import {
  Activity,
  ArrowLeft,
  Calendar,
  CircleDollarSign,
  Eye,
  Layers,
  Loader2,
  Megaphone,
  MousePointerClick,
  Percent,
  Settings,
  Target,
  TrendingUp,
  Type,
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ImpressionShareChart, KPICard, MetricsLineChart } from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAssetGroups,
  useCampaignDetail,
  useCampaigns,
  useDailyMetrics,
  useTextAssets,
} from "@/features/campaigns";
import type { AssetPerformance, CampaignStatus, TextAsset } from "@/features/campaigns/types";
import { formatCompact, formatCurrency, formatPercent } from "@/shared/lib/format";

/** Convert cost in micros to dollars */
const microsToDollars = (micros: number) => micros / 1_000_000;

const statusColors: Record<CampaignStatus, "default" | "secondary" | "destructive"> = {
  ENABLED: "default",
  PAUSED: "secondary",
  REMOVED: "destructive",
  UNKNOWN: "secondary",
};

const statusLabels: Record<CampaignStatus, string> = {
  ENABLED: "Active",
  PAUSED: "Paused",
  REMOVED: "Removed",
  UNKNOWN: "Pending",
};

const performanceColors: Record<AssetPerformance, string> = {
  BEST: "bg-green-500/10 text-green-600 border-green-500/20",
  GOOD: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  LOW: "bg-red-500/10 text-red-600 border-red-500/20",
  LEARNING: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  PENDING: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  UNSPECIFIED: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const biddingStrategyLabels: Record<string, string> = {
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

function TextAssetItem({ asset }: { asset: TextAsset }) {
  return (
    <div className="flex items-start justify-between gap-2 rounded border p-2 text-sm">
      <span className="flex-1">{asset.text}</span>
      {asset.performance_label && (
        <span
          className={`shrink-0 rounded border px-1.5 py-0.5 text-xs font-medium ${performanceColors[asset.performance_label] ?? performanceColors.UNSPECIFIED}`}
        >
          {asset.performance_label}
        </span>
      )}
    </div>
  );
}

export function CampaignDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const campaignId = params.campaignId as string;
  const accountId = searchParams.get("account") ?? "";

  // Fetch all data
  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns(
    accountId ? { account_id: accountId } : undefined,
  );
  const { data: campaignDetail, isLoading: detailLoading } = useCampaignDetail(
    accountId,
    campaignId,
  );
  const { data: dailyMetrics, isLoading: dailyLoading } = useDailyMetrics(accountId, campaignId);
  const { data: assetGroups, isLoading: assetGroupsLoading } = useAssetGroups(
    accountId,
    campaignId,
  );
  const { data: textAssets, isLoading: textAssetsLoading } = useTextAssets(accountId, campaignId);

  // Use campaign detail if available, otherwise fall back to basic campaign data
  const campaign = campaignDetail ?? campaigns?.find((c) => c.campaign_id === campaignId);

  // Calculate derived metrics
  const ctr = campaign?.impressions ? (campaign.clicks / campaign.impressions) * 100 : 0;
  const conversionRate = campaign?.clicks ? (campaign.conversions / campaign.clicks) * 100 : 0;
  const avgCpc = campaign?.clicks ? microsToDollars(campaign.cost_micros) / campaign.clicks : 0;

  // Loading state
  if (campaignsLoading || detailLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not found state
  if (!campaign) {
    return (
      <div className="p-6">
        <Link href="/campaigns">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>
        </Link>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Campaign not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/campaigns">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      {/* Campaign Title */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
          <Megaphone className="h-6 w-6 text-blue-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{campaign.campaign_name}</h1>
            <Badge variant={statusColors[campaign.status as CampaignStatus] ?? "secondary"}>
              {statusLabels[campaign.status as CampaignStatus] ?? campaign.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Campaign ID: {campaign.campaign_id}</p>
        </div>
        {campaign.optimization_score !== undefined && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Optimization Score</p>
            <div className="flex items-center gap-2">
              <Progress value={campaign.optimization_score * 100} className="w-24" />
              <span className="font-semibold">
                {(campaign.optimization_score * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs for organized content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* New Campaign Notice */}
          {campaign.impressions === 0 && campaign.clicks === 0 && (
            <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">No activity yet</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      This campaign hasn&apos;t received any impressions or clicks. Metrics will
                      appear once the campaign starts serving ads.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* KPI Cards */}
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
            <KPICard
              title="CTR"
              value={formatPercent(campaign.ctr ?? ctr)}
              icon={Percent}
              size="sm"
            />
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

          {/* Secondary KPIs */}
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
              value={formatCurrency(
                campaign.cost_per_conversion
                  ? microsToDollars(campaign.cost_per_conversion)
                  : campaign.conversions > 0
                    ? microsToDollars(campaign.cost_micros) / campaign.conversions
                    : 0,
              )}
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

          {/* Performance Chart */}
          {dailyMetrics && dailyMetrics.length > 0 && (
            <MetricsLineChart
              data={dailyMetrics}
              title="Performance Over Time"
              description="Last 30 days"
              metrics={[
                { key: "impressions", label: "Impressions", color: "#3b82f6" },
                { key: "clicks", label: "Clicks", color: "#22c55e" },
                { key: "conversions", label: "Conversions", color: "#f59e0b", yAxisId: "right" },
              ]}
              height={300}
            />
          )}

          {/* Impression Share */}
          {(campaign.search_impression_share !== undefined ||
            campaign.search_budget_lost_impression_share !== undefined) && (
            <div className="grid gap-6 md:grid-cols-2">
              <ImpressionShareChart
                impressionShare={campaign.search_impression_share ?? 0}
                budgetLost={campaign.search_budget_lost_impression_share ?? 0}
                rankLost={campaign.search_rank_lost_impression_share ?? 0}
                title="Search Impression Share"
                description="How often your ads show vs. eligible impressions"
              />
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
                      <span className="font-medium">{assetGroups?.length ?? 0}</span>
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
            </div>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* Cost Analysis */}
          {dailyMetrics && dailyMetrics.length > 0 && (
            <>
              <MetricsLineChart
                data={dailyMetrics}
                title="Cost Analysis"
                description="Daily spending and CPC"
                metrics={[
                  {
                    key: "cost_micros",
                    label: "Cost",
                    color: "#ef4444",
                    formatter: (v) => formatCurrency(microsToDollars(v)),
                  },
                  {
                    key: "average_cpc",
                    label: "Avg. CPC",
                    color: "#8b5cf6",
                    yAxisId: "right",
                    formatter: (v) => formatCurrency(microsToDollars(v)),
                  },
                ]}
                height={300}
              />

              <MetricsLineChart
                data={dailyMetrics}
                title="Conversion Performance"
                description="Daily conversions and CTR"
                metrics={[
                  { key: "conversions", label: "Conversions", color: "#22c55e" },
                  {
                    key: "ctr",
                    label: "CTR",
                    color: "#f59e0b",
                    yAxisId: "right",
                    formatter: (v) => `${(v * 100).toFixed(2)}%`,
                  },
                ]}
                height={300}
              />
            </>
          )}

          {dailyLoading && (
            <Card>
              <CardContent className="flex items-center justify-center p-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          )}

          {!dailyLoading && (!dailyMetrics || dailyMetrics.length === 0) && (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No performance data available yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets" className="space-y-6">
          {/* Asset Groups */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Asset Groups</CardTitle>
              </div>
              <CardDescription>Manage assets for this campaign</CardDescription>
            </CardHeader>
            <CardContent>
              {assetGroupsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : assetGroups && assetGroups.length > 0 ? (
                <div className="space-y-3">
                  {assetGroups.map((group) => (
                    <div
                      key={group.asset_group_id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <p className="font-medium">{group.asset_group_name}</p>
                        <p className="text-sm text-muted-foreground">ID: {group.asset_group_id}</p>
                        {group.final_url && (
                          <p className="text-sm text-muted-foreground truncate max-w-md">
                            {group.final_url}
                          </p>
                        )}
                      </div>
                      {group.status && (
                        <Badge variant={statusColors[group.status] ?? "secondary"}>
                          {group.status}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No asset groups found</p>
              )}
            </CardContent>
          </Card>

          {/* Text Assets */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Type className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Text Assets</CardTitle>
              </div>
              <CardDescription>
                Headlines, long headlines, and descriptions for this campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              {textAssetsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : textAssets && textAssets.length > 0 ? (
                <div className="space-y-6">
                  {textAssets.map((group) => (
                    <div key={group.asset_group_id} className="space-y-3">
                      <h4 className="font-medium text-sm border-b pb-2">
                        {group.asset_group_name}
                      </h4>

                      {group.headlines.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Headlines ({group.headlines.length})
                          </p>
                          <div className="space-y-1">
                            {group.headlines.map((asset) => (
                              <TextAssetItem key={asset.asset_id} asset={asset} />
                            ))}
                          </div>
                        </div>
                      )}

                      {group.long_headlines.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Long Headlines ({group.long_headlines.length})
                          </p>
                          <div className="space-y-1">
                            {group.long_headlines.map((asset) => (
                              <TextAssetItem key={asset.asset_id} asset={asset} />
                            ))}
                          </div>
                        </div>
                      )}

                      {group.descriptions.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Descriptions ({group.descriptions.length})
                          </p>
                          <div className="space-y-1">
                            {group.descriptions.map((asset) => (
                              <TextAssetItem key={asset.asset_id} asset={asset} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No text assets found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Campaign Settings</CardTitle>
              </div>
              <CardDescription>Configuration and bidding details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Bidding Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <CircleDollarSign className="h-4 w-4" />
                    Bidding
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Strategy</span>
                      <span className="font-medium">
                        {biddingStrategyLabels[campaign.bidding_strategy_type ?? "UNSPECIFIED"]}
                      </span>
                    </div>
                    {campaign.target_cpa_micros && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Target CPA</span>
                        <span className="font-medium">
                          {formatCurrency(microsToDollars(campaign.target_cpa_micros))}
                        </span>
                      </div>
                    )}
                    {campaign.target_roas && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Target ROAS</span>
                        <span className="font-medium">
                          {(campaign.target_roas * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                    {campaign.budget_amount_micros != null && campaign.budget_amount_micros > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Daily Budget</span>
                        <span className="font-medium">
                          {formatCurrency(microsToDollars(campaign.budget_amount_micros))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Schedule */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Schedule
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date</span>
                      <span className="font-medium">{campaign.start_date ?? "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">End Date</span>
                      <span className="font-medium">{campaign.end_date ?? "No end date"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge
                        variant={statusColors[campaign.status as CampaignStatus] ?? "secondary"}
                        className="h-5"
                      >
                        {statusLabels[campaign.status as CampaignStatus] ?? campaign.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Performance Summary */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Performance Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    {campaign.optimization_score !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Optimization Score</span>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={campaign.optimization_score * 100}
                            className="w-16 h-2"
                          />
                          <span className="font-medium">
                            {(campaign.optimization_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    )}
                    {campaign.search_impression_share !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Impression Share</span>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={campaign.search_impression_share * 100}
                            className="w-16 h-2"
                          />
                          <span className="font-medium">
                            {(campaign.search_impression_share * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* IDs */}
                <div className="space-y-4">
                  <h4 className="font-medium">Identifiers</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Campaign ID</span>
                      <code className="text-xs bg-muted px-2 py-0.5 rounded">
                        {campaign.campaign_id}
                      </code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account ID</span>
                      <code className="text-xs bg-muted px-2 py-0.5 rounded">{accountId}</code>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Raw Metrics Card - for developers/debugging */}
          {campaignDetail?.metrics && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">All Metrics (Raw Data)</CardTitle>
                <CardDescription>Complete metrics data from Google Ads API</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3 lg:grid-cols-4">
                  {Object.entries(campaignDetail.metrics).map(([key, value]) => {
                    if (value === undefined || value === null) return null;
                    let displayValue = String(value);
                    if (key.includes("micros")) {
                      displayValue = formatCurrency(microsToDollars(Number(value)));
                    } else if (key.includes("rate") || key.includes("share") || key === "ctr") {
                      displayValue = formatPercent(Number(value) * 100);
                    } else if (typeof value === "number") {
                      displayValue = formatCompact(value);
                    }
                    return (
                      <div key={key} className="flex flex-col">
                        <span className="text-muted-foreground text-xs capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="font-medium">{String(displayValue)}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
