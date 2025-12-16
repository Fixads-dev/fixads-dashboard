"use client";

import { ArrowRight, Eye, MousePointerClick, Target } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

/** Convert cost in micros to dollars */
const microsToDollars = (micros: number) => micros / 1_000_000;

export function CampaignCard({ campaign, accountId }: CampaignCardProps) {
  const ctr = campaign.impressions ? (campaign.clicks / campaign.impressions) * 100 : 0;
  const conversionRate = campaign.clicks ? (campaign.conversions / campaign.clicks) * 100 : 0;

  return (
    <Link href={`/campaigns/${campaign.campaign_id}?account=${accountId}`}>
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 group">
        <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-3">
          <div className="flex-1 space-y-1 min-w-0">
            <CardTitle className="text-base font-semibold line-clamp-1 group-hover:text-primary transition-colors">
              {campaign.campaign_name}
            </CardTitle>
            <p className="text-xs text-muted-foreground">ID: {campaign.campaign_id}</p>
          </div>
          <Badge variant={statusColors[campaign.status] ?? "secondary"} className="shrink-0">
            {campaign.status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Primary Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/10">
                <Eye className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Impressions</p>
                <p className="font-semibold">{formatCompact(campaign.impressions)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500/10">
                <MousePointerClick className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Clicks</p>
                <p className="font-semibold">{formatCompact(campaign.clicks)}</p>
              </div>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Cost</p>
              <p className="text-sm font-medium">
                {formatCurrency(microsToDollars(campaign.cost_micros))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">CTR</p>
              <p className="text-sm font-medium">{formatPercent(ctr)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Conv.</p>
              <p className="text-sm font-medium">{campaign.conversions.toFixed(1)}</p>
            </div>
          </div>

          {/* Conversion Rate Footer */}
          <div className="flex items-center justify-between pt-2 border-t text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Target className="h-3 w-3" />
              <span>Conv. Rate: {formatPercent(conversionRate)}</span>
            </div>
            <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              <span>View Details</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
