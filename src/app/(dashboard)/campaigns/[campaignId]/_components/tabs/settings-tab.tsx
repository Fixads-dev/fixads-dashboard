"use client";

import { Calendar, CircleDollarSign, Settings, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Campaign, CampaignDetail, CampaignStatus } from "@/features/campaigns/types";
import { formatCompact, formatCurrency, formatPercent } from "@/shared/lib/format";
import { biddingStrategyLabels, microsToDollars, statusColors, statusLabels } from "../constants";

interface SettingsTabProps {
  campaign: Campaign | CampaignDetail;
  campaignDetail: CampaignDetail | null | undefined;
  accountId: string;
}

export function SettingsTab({ campaign, campaignDetail, accountId }: SettingsTabProps) {
  return (
    <div className="space-y-6">
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
                    <span className="font-medium">{(campaign.target_roas * 100).toFixed(0)}%</span>
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
                      <Progress value={campaign.optimization_score * 100} className="w-16 h-2" />
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
    </div>
  );
}
