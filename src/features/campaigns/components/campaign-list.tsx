"use client";

import { Megaphone } from "lucide-react";
import { useMemo } from "react";
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

  // Filter campaigns client-side (backend doesn't support status/search filtering)
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];
    return campaigns.filter((campaign) => {
      if (filters?.status && campaign.status !== filters.status) return false;
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        if (!campaign.campaign_name.toLowerCase().includes(search)) return false;
      }
      return true;
    });
  }, [campaigns, filters?.status, filters?.search]);

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

  if (!filteredCampaigns.length) {
    const hasFilters = filters?.status || filters?.search;
    return (
      <EmptyState
        icon={Megaphone}
        title="No campaigns found"
        description={
          hasFilters
            ? "No campaigns match your filters. Try adjusting your search or status filter."
            : accountId
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
      {filteredCampaigns.map((campaign) => (
        <CampaignCard key={campaign.campaign_id} campaign={campaign} accountId={accountId ?? ""} />
      ))}
    </div>
  );
}
