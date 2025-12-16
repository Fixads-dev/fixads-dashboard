"use client";

import { ArrowLeft, Loader2, Megaphone } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAssetGroups, useCampaigns } from "@/features/campaigns";
import type { CampaignStatus } from "@/features/campaigns/types";
import { formatCompact, formatCurrency, formatPercent } from "@/shared/lib/format";

/** Convert cost in micros to dollars */
const microsToDollars = (micros: number) => micros / 1_000_000;

const statusColors: Record<CampaignStatus, "default" | "secondary" | "destructive"> = {
  ENABLED: "default",
  PAUSED: "secondary",
  REMOVED: "destructive",
  UNKNOWN: "secondary",
};

export function CampaignDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const campaignId = params.campaignId as string;
  const accountId = searchParams.get("account") ?? "";

  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns(
    accountId ? { account_id: accountId } : undefined,
  );
  const { data: assetGroups, isLoading: assetGroupsLoading } = useAssetGroups(
    accountId,
    campaignId,
  );

  const campaign = campaigns?.find((c) => c.campaign_id === campaignId);

  // Calculate CTR from flat metrics
  const ctr = campaign?.impressions ? (campaign.clicks / campaign.impressions) * 100 : 0;

  if (campaignsLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
      <div className="flex items-center gap-4">
        <Link href="/campaigns">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
          <Megaphone className="h-6 w-6 text-blue-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{campaign.campaign_name}</h1>
            <Badge variant={statusColors[campaign.status] ?? "secondary"}>{campaign.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Campaign ID: {campaign.campaign_id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metrics (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Impressions</p>
              <p className="text-2xl font-semibold">{formatCompact(campaign.impressions)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clicks</p>
              <p className="text-2xl font-semibold">{formatCompact(campaign.clicks)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cost</p>
              <p className="text-2xl font-semibold">
                {formatCurrency(microsToDollars(campaign.cost_micros))}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CTR</p>
              <p className="text-2xl font-semibold">{formatPercent(ctr)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Asset Groups</CardTitle>
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
    </div>
  );
}
