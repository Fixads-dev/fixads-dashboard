"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccounts, useStartConnectAccount } from "@/features/accounts";
import {
  RECOMMENDATION_CATEGORIES,
  type RecommendationFilters,
  RecommendationList,
  type RecommendationType,
} from "@/features/recommendations";

export function RecommendationsContent() {
  const searchParams = useSearchParams();
  const initialAccountId = searchParams.get("account_id") ?? undefined;
  const initialCampaignId = searchParams.get("campaign_id") ?? undefined;

  const [accountId, setAccountId] = useState<string | undefined>(initialAccountId);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [includeDismissed, setIncludeDismissed] = useState(false);

  const { data: accounts } = useAccounts();
  const { mutate: connectAccount } = useStartConnectAccount();

  // Build type filter array
  const selectedTypes: RecommendationType[] | undefined =
    typeFilter === "ALL"
      ? undefined
      : (RECOMMENDATION_CATEGORIES[typeFilter] as RecommendationType[] | undefined);

  const filters: RecommendationFilters = {
    account_id: accountId ?? "",
    types: selectedTypes,
    campaign_id: initialCampaignId,
    include_dismissed: includeDismissed,
    limit: 100,
  };

  // Helper to get display name for account
  const getAccountDisplayName = (acc: { descriptive_name: string | null; customer_id: string }) =>
    acc.descriptive_name ?? acc.customer_id;

  // No accounts connected
  if (accounts && accounts.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recommendations</h1>
          <p className="text-muted-foreground">
            View and apply Google&apos;s AI-powered recommendations
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-4">
            Connect a Google Ads account to see recommendations.
          </p>
          <button
            type="button"
            onClick={() => connectAccount()}
            className="text-primary hover:underline"
          >
            Connect Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Recommendations</h1>
        <p className="text-muted-foreground">
          View and apply Google&apos;s AI-powered recommendations to improve your campaigns
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Account filter */}
        <Select value={accountId ?? ""} onValueChange={(value) => setAccountId(value || undefined)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {accounts?.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {getAccountDisplayName(account)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Type/Category filter */}
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            {Object.keys(RECOMMENDATION_CATEGORIES).map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Dismissed toggle */}
        <Select
          value={includeDismissed ? "include" : "active"}
          onValueChange={(value) => setIncludeDismissed(value === "include")}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="include">Include Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Show prompt if no account selected */}
      {!accountId ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <h3 className="text-lg font-semibold mb-2">Select an account</h3>
              <p className="text-muted-foreground">
                Choose a Google Ads account to view recommendations
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <RecommendationList filters={filters} />
      )}
    </div>
  );
}
