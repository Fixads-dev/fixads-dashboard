"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GoogleAdsAccount } from "@/features/accounts";
import type { AssetGroup, Campaign } from "@/features/campaigns";

interface CampaignSelectorProps {
  accounts: GoogleAdsAccount[] | undefined;
  campaigns: Campaign[] | undefined;
  assetGroups: AssetGroup[] | undefined;
  selectedAccountId: string;
  selectedCampaignId: string;
  selectedAssetGroupId: string;
  onAccountChange: (id: string) => void;
  onCampaignChange: (id: string) => void;
  onAssetGroupChange: (id: string) => void;
  isLoadingAccounts: boolean;
  isLoadingCampaigns: boolean;
  isLoadingAssetGroups: boolean;
  isAccountsError: boolean;
  isCampaignsError: boolean;
  isAssetGroupsError: boolean;
}

function getAccountDisplayName(acc: { descriptive_name: string | null; customer_id: string }) {
  return acc.descriptive_name ?? acc.customer_id;
}

export function CampaignSelector({
  accounts,
  campaigns,
  assetGroups,
  selectedAccountId,
  selectedCampaignId,
  selectedAssetGroupId,
  onAccountChange,
  onCampaignChange,
  onAssetGroupChange,
  isLoadingAccounts,
  isLoadingCampaigns,
  isLoadingAssetGroups,
  isAccountsError,
  isCampaignsError,
  isAssetGroupsError,
}: CampaignSelectorProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Account Select */}
      <div className="space-y-1">
        <Select
          value={selectedAccountId}
          onValueChange={onAccountChange}
          disabled={isLoadingAccounts}
        >
          <SelectTrigger>
            {isLoadingAccounts ? (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading accounts...
              </span>
            ) : isAccountsError ? (
              <span className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                Error loading
              </span>
            ) : (
              <SelectValue placeholder="Select account" />
            )}
          </SelectTrigger>
          <SelectContent>
            {accounts?.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {getAccountDisplayName(account)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Campaign Select */}
      <div className="space-y-1">
        <Select
          value={selectedCampaignId}
          onValueChange={onCampaignChange}
          disabled={!selectedAccountId || isLoadingCampaigns}
        >
          <SelectTrigger>
            {selectedAccountId && isLoadingCampaigns ? (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading campaigns...
              </span>
            ) : selectedAccountId && isCampaignsError ? (
              <span className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                Error loading
              </span>
            ) : (
              <SelectValue placeholder="Select campaign" />
            )}
          </SelectTrigger>
          <SelectContent>
            {campaigns
              ?.filter((c) => c.campaign_id)
              .map((campaign) => (
                <SelectItem key={campaign.campaign_id} value={campaign.campaign_id}>
                  {campaign.campaign_name || campaign.campaign_id}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Asset Group Select */}
      <div className="space-y-1">
        <Select
          value={selectedAssetGroupId}
          onValueChange={onAssetGroupChange}
          disabled={!selectedCampaignId || isLoadingAssetGroups}
        >
          <SelectTrigger>
            {selectedCampaignId && isLoadingAssetGroups ? (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading asset groups...
              </span>
            ) : selectedCampaignId && isAssetGroupsError ? (
              <span className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                Error loading
              </span>
            ) : (
              <SelectValue placeholder="Select asset group" />
            )}
          </SelectTrigger>
          <SelectContent>
            {assetGroups
              ?.filter((g) => g.asset_group_id)
              .map((group) => (
                <SelectItem key={group.asset_group_id} value={group.asset_group_id}>
                  {group.asset_group_name || group.asset_group_id}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
