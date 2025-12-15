"use client";

import { Megaphone } from "lucide-react";
import { EmptyState, ErrorFallback } from "@/shared/components";
import { CardSkeleton } from "@/shared/components/loading-skeleton";
import { useCampaigns } from "../hooks";
import type { CampaignFilters } from "../types";
import { CampaignCard } from "./campaign-card";

interface CampaignListProps {
  filters?: CampaignFilters;
  onConnectAccount?: () => void;
}

export function CampaignList({ filters, onConnectAccount }: CampaignListProps) {
  const { data: campaigns, isLoading, error, refetch } = useCampaigns(filters);
  const accountId = filters?.account_id;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton list never reorders
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorFallback error={error} onRetry={() => refetch()} />;
  }

  if (!campaigns?.length) {
    return (
      <EmptyState
        icon={Megaphone}
        title="No campaigns found"
        description={
          accountId
            ? "No Performance Max campaigns found for this account."
            : "Select a Google Ads account to see your campaigns."
        }
        action={
          onConnectAccount && !accountId
            ? {
                label: "Connect Account",
                onClick: onConnectAccount,
              }
            : undefined
        }
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <CampaignCard
          key={campaign.campaign_id}
          campaign={campaign}
          accountId={accountId ?? ""}
        />
      ))}
    </div>
  );
}
