"use client";

import { Megaphone } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompact, formatCurrency, formatPercent } from "@/shared/lib/format";
import type { Campaign, CampaignStatus } from "../types";

interface CampaignCardProps {
  campaign: Campaign;
}

const statusColors: Record<CampaignStatus, "default" | "secondary" | "destructive"> = {
  ENABLED: "default",
  PAUSED: "secondary",
  REMOVED: "destructive",
};

export function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <Link href={`/campaigns/${campaign.id}?account=${campaign.accountId}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
            <Megaphone className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1 space-y-1">
            <CardTitle className="text-base font-semibold line-clamp-1">{campaign.name}</CardTitle>
            <CardDescription className="text-xs">
              {campaign.assetGroupCount} asset groups
            </CardDescription>
          </div>
          <Badge variant={statusColors[campaign.status]}>{campaign.status}</Badge>
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
                <p className="font-medium">{formatPercent(campaign.metrics.ctr)}</p>
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
