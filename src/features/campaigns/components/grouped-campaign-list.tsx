"use client";

import { ChevronDown, Loader2, Megaphone } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { GoogleAdsAccount } from "@/features/accounts";
import { SyncButton } from "@/features/accounts";
import { EmptyState, ErrorFallback } from "@/shared/components";
import { CardSkeleton } from "@/shared/components/loading-skeleton";
import type { AccountCampaigns, CampaignFilters, GroupedCampaignsData } from "../types";
import { CampaignCard } from "./campaign-card";

interface GroupedCampaignListProps {
  data: GroupedCampaignsData;
  accounts?: GoogleAdsAccount[];
  filters?: CampaignFilters;
  onConnectAccount?: () => void;
}

interface AccountSectionProps {
  account: AccountCampaigns;
  displayName: string;
  filters?: CampaignFilters;
  defaultOpen?: boolean;
}

function formatCustomerId(customerId: string) {
  const cleaned = customerId.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return customerId;
}

function AccountSection({ account, displayName, filters, defaultOpen = true }: AccountSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Filter campaigns client-side
  const filteredCampaigns = account.campaigns.filter((campaign) => {
    if (filters?.status && campaign.status !== filters.status) return false;
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      if (!campaign.campaign_name.toLowerCase().includes(search)) return false;
    }
    return true;
  });

  // Don't render section if no campaigns match filters
  if (filteredCampaigns.length === 0 && !account.isLoading) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="rounded-lg border bg-card overflow-hidden">
      <div className="flex w-full items-center justify-between gap-4 px-4 py-3">
        <CollapsibleTrigger className="flex flex-1 items-center gap-3 min-w-0 hover:bg-muted/50 transition-colors -my-3 -ml-4 py-3 pl-4 rounded-l-lg">
          <div className="font-medium truncate">{displayName}</div>
          <span className="text-xs text-muted-foreground">
            ({filteredCampaigns.length})
          </span>
          <span className="text-xs text-muted-foreground font-mono shrink-0">
            {formatCustomerId(account.customer_id)}
          </span>
        </CollapsibleTrigger>
        <div className="flex items-center gap-2 shrink-0">
          {account.isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {account.isError && (
            <Badge variant="destructive" className="text-xs" title={account.error ?? "Error loading campaigns"}>
              Error
            </Badge>
          )}
          <SyncButton
            accountId={account.account_id}
            size="icon"
            variant="ghost"
            showLabel={false}
            className="h-7 w-7"
          />
          <CollapsibleTrigger className="p-1 hover:bg-muted/50 rounded transition-colors">
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                isOpen ? "" : "-rotate-90"
              }`}
            />
          </CollapsibleTrigger>
        </div>
      </div>
      <CollapsibleContent>
        <div className="border-t bg-muted/30 p-4">
          {account.isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton list
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.campaign_id}
                  campaign={campaign}
                  accountId={account.account_id}
                />
              ))}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function GroupedCampaignList({ data, accounts, filters, onConnectAccount }: GroupedCampaignListProps) {
  const { accounts: accountCampaigns, isLoading, isError } = data;

  // Create a map of account_id -> descriptive_name from the accounts list
  const accountNameMap = useMemo(() => {
    const map = new Map<string, string>();
    if (accounts) {
      for (const acc of accounts) {
        if (acc.descriptive_name) {
          map.set(acc.id, acc.descriptive_name);
        }
      }
    }
    return map;
  }, [accounts]);

  // Get display name for an account
  const getDisplayName = (account: AccountCampaigns) => {
    // First try to get from our accounts list (most accurate)
    const fromAccountsList = accountNameMap.get(account.account_id);
    if (fromAccountsList) return fromAccountsList;

    // Fall back to what the API returned
    if (account.account_name && !account.account_name.startsWith("Account ")) {
      return account.account_name;
    }

    // Last resort: format the customer ID nicely
    return `Account ${formatCustomerId(account.customer_id)}`;
  };

  if (isLoading && accountCampaigns.every((a) => a.isLoading)) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton list
          <div key={i} className="rounded-xl border bg-card p-4 animate-pulse flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-muted" />
            <div className="flex-1">
              <div className="h-5 w-48 bg-muted rounded mb-2" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorFallback
        error={new Error("Failed to load campaigns from all accounts")}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Check if any campaigns match filters
  const hasAnyMatchingCampaigns = accountCampaigns.some((account) =>
    account.campaigns.some((campaign) => {
      if (filters?.status && campaign.status !== filters.status) return false;
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        if (!campaign.campaign_name.toLowerCase().includes(search)) return false;
      }
      return true;
    }),
  );

  if (!hasAnyMatchingCampaigns && !isLoading) {
    const hasFilters = filters?.status || filters?.search;
    return (
      <EmptyState
        icon={Megaphone}
        title="No campaigns found"
        description={
          hasFilters
            ? "No campaigns match your filters. Try adjusting your search or status filter."
            : "No Performance Max campaigns found in your connected accounts."
        }
        action={
          onConnectAccount
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
    <div className="space-y-4">
      {accountCampaigns.map((account) => (
        <AccountSection
          key={account.account_id}
          account={account}
          displayName={getDisplayName(account)}
          filters={filters}
          defaultOpen={true}
        />
      ))}
    </div>
  );
}
