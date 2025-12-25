"use client";

import { ArrowLeft, Loader2, Megaphone } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAssetGroups,
  useCampaign,
  useCampaignDetail,
  useDailyMetrics,
  useTextAssets,
} from "@/features/campaigns";
import type { CampaignStatus } from "@/features/campaigns/types";
import { statusColors, statusLabels } from "./constants";
import {
  AssetsTab,
  ExperimentationTab,
  InsightsTab,
  OverviewTab,
  PerformanceTab,
  ProductsTab,
  SettingsTab,
  SimulationsTab,
} from "./tabs";

export function CampaignDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const campaignId = params.campaignId as string;
  const accountId = searchParams.get("account") ?? "";
  const [dateRangeDays, setDateRangeDays] = useState<number>(30);

  // Fetch campaign data - useCampaign works for ALL campaign types via GAQL
  // useCampaignDetail provides richer data but only works for PMax
  const { data: basicCampaign, isLoading: campaignLoading } = useCampaign(accountId, campaignId);
  const { data: campaignDetail, isLoading: detailLoading } = useCampaignDetail(
    accountId,
    campaignId,
  );
  const { data: dailyMetrics, isLoading: dailyLoading } = useDailyMetrics(
    accountId,
    campaignId,
    dateRangeDays,
  );
  const { data: assetGroups, isLoading: assetGroupsLoading } = useAssetGroups(
    accountId,
    campaignId,
  );
  const { data: textAssets, isLoading: textAssetsLoading } = useTextAssets(accountId, campaignId);

  // Use campaign detail if available (PMax), otherwise fall back to basic campaign data (all types)
  const campaign = campaignDetail ?? basicCampaign;

  // Loading state
  if (campaignLoading || detailLoading) {
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
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="simulations">Forecasts</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="experimentation">Experimentation</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab
            campaign={campaign}
            dailyMetrics={dailyMetrics}
            dailyLoading={dailyLoading}
            assetGroups={assetGroups}
            dateRangeDays={dateRangeDays}
            onDateRangeChange={setDateRangeDays}
          />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceTab
            dailyMetrics={dailyMetrics}
            dailyLoading={dailyLoading}
            dateRangeDays={dateRangeDays}
            onDateRangeChange={setDateRangeDays}
          />
        </TabsContent>

        <TabsContent value="insights">
          <InsightsTab
            accountId={accountId}
            campaignId={campaignId}
            assetGroups={assetGroups}
          />
        </TabsContent>

        <TabsContent value="products">
          <ProductsTab accountId={accountId} campaignId={campaignId} />
        </TabsContent>

        <TabsContent value="simulations">
          <SimulationsTab accountId={accountId} campaignId={campaignId} />
        </TabsContent>

        <TabsContent value="assets">
          <AssetsTab
            accountId={accountId}
            assetGroups={assetGroups}
            assetGroupsLoading={assetGroupsLoading}
            textAssets={textAssets}
            textAssetsLoading={textAssetsLoading}
          />
        </TabsContent>

        <TabsContent value="experimentation">
          <ExperimentationTab campaignId={campaignId} />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab campaign={campaign} campaignDetail={campaignDetail} accountId={accountId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
