import { Megaphone } from "lucide-react";
import { getCampaignTypeLabel } from "../types";
import { campaignTypeHexColors, campaignTypeIcons } from "./constants/campaign-type-config";

interface CampaignDistributionSectionProps {
  counts: Record<string, number>;
}

export function CampaignDistributionSection({ counts }: CampaignDistributionSectionProps) {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  if (total === 0) {
    return <p className="text-center text-muted-foreground py-4">No campaigns</p>;
  }

  const data = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => ({
      type,
      name: getCampaignTypeLabel(type),
      count,
      percentage: (count / total) * 100,
      color: campaignTypeHexColors[type] || "#6b7280",
    }));

  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div className="space-y-3">
      {data.map((item) => {
        const Icon = campaignTypeIcons[item.type] || Megaphone;
        const barWidth = (item.count / maxCount) * 100;

        return (
          <div key={item.type} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" style={{ color: item.color }} />
                <span className="font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="tabular-nums">{item.count}</span>
                <span className="text-xs">({item.percentage.toFixed(0)}%)</span>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${barWidth}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
