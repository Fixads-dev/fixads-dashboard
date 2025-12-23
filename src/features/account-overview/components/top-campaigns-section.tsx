import { ChevronRight, Megaphone } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { TopCampaign } from "../types";
import { formatCost, getCampaignTypeLabel } from "../types";
import {
  campaignTypeColors,
  campaignTypeIcons,
  statusConfig,
} from "./constants/campaign-type-config";

interface TopCampaignsSectionProps {
  campaigns: TopCampaign[];
  currencyCode?: string;
  accountId?: string;
}

export function TopCampaignsSection({
  campaigns,
  currencyCode,
  accountId,
}: TopCampaignsSectionProps) {
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
              <div className={`p-2 rounded-lg ${typeColor} bg-opacity-20 shrink-0`}>
                <TypeIcon className={`h-5 w-5 ${typeColor.replace("bg-", "text-")}`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate group-hover:text-primary transition-colors">
                  {campaign.campaign_name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {getCampaignTypeLabel(campaign.campaign_type)}
                  </Badge>
                  <Badge className={`text-xs ${status.bgColor} ${status.color} border-0`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="font-bold text-lg">{campaign.conversions.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">conversions</p>
              </div>

              <div className="text-right shrink-0 min-w-[80px]">
                <p className="font-medium">{formatCost(campaign.cost_micros, currencyCode)}</p>
                <p className="text-xs text-muted-foreground">spent</p>
              </div>

              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
