"use client";

import { History } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccounts } from "@/features/accounts";
import type { ChangeResourceType } from "@/features/change-history";
import { ChangeHistoryTimeline } from "@/features/change-history";

export function ChangeHistoryContent() {
  const { data: accounts, isLoading: isLoadingAccounts } = useAccounts();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [resourceType, setResourceType] = useState<ChangeResourceType | "ALL">("ALL");

  // Auto-select first account if only one
  if (!selectedAccountId && accounts?.length === 1) {
    setSelectedAccountId(accounts[0].id);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <History className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Change History</h1>
          <p className="text-muted-foreground">Audit log of changes made to your account</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Select an account and resource type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-64">
              <Select
                value={selectedAccountId}
                onValueChange={setSelectedAccountId}
                disabled={isLoadingAccounts}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.descriptive_name || account.customer_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-48">
              <Select
                value={resourceType}
                onValueChange={(value) => setResourceType(value as ChangeResourceType | "ALL")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All types</SelectItem>
                  <SelectItem value="CAMPAIGN">Campaigns</SelectItem>
                  <SelectItem value="AD_GROUP">Ad Groups</SelectItem>
                  <SelectItem value="AD">Ads</SelectItem>
                  <SelectItem value="CRITERION">Keywords</SelectItem>
                  <SelectItem value="CAMPAIGN_BUDGET">Budgets</SelectItem>
                  <SelectItem value="ASSET">Assets</SelectItem>
                  <SelectItem value="ASSET_GROUP">Asset Groups</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {selectedAccountId ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Changes</CardTitle>
            <CardDescription>Changes made to your account in the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChangeHistoryTimeline
              filters={{
                account_id: selectedAccountId,
                resource_type: resourceType === "ALL" ? undefined : resourceType,
                limit: 100,
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <History className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select an account</h3>
              <p className="text-muted-foreground">
                Choose a Google Ads account to view change history
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
