"use client";

import { Megaphone } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompact, formatCurrency, formatPercent } from "@/shared/lib/format";
import type { Campaign, CampaignStatus } from "../types";

interface CampaignCardProps {
  campaign: Campaign;
  accountId: string;
}

const statusColors: Record<CampaignStatus, "default" | "secondary" | "destructive"> = {
  ENABLED: "default",
  PAUSED: "secondary",
  REMOVED: "destructive",
  UNKNOWN: "secondary",
};

export function CampaignCard({ campaign, accountId }: CampaignCardProps) {
  const ctr =
    campaign.metrics?.ctr ??
    (campaign.metrics?.impressions
      ? (campaign.metrics.clicks / campaign.metrics.impressions) * 100
      : 0);

  return (
    <Link href={`/campaigns/${campaign.campaign_id}?account=${accountId}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
            <Megaphone className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1 space-y-1">
            <CardTitle className="text-base font-semibold line-clamp-1">{campaign.name}</CardTitle>
            {campaign.asset_group_count !== undefined && (
              <CardDescription className="text-xs">
                {campaign.asset_group_count} asset groups
              </CardDescription>
            )}
          </div>
          <Badge variant={statusColors[campaign.status] ?? "secondary"}>{campaign.status}</Badge>
        </CardHeader>
        <CardContent>
          {campaign.metrics ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Impressions</p>
                <p className="font-medium">{formatCompact(campaign.metrics.impressions)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Clicks</p>
                <p className="font-medium">{formatCompact(campaign.metrics.clicks)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cost</p>
                <p className="font-medium">{formatCurrency(campaign.metrics.cost)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">CTR</p>
                <p className="font-medium">{formatPercent(ctr)}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No metrics available</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
