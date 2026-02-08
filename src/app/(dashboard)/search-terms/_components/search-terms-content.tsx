"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccounts } from "@/features/accounts";
import { SearchTermsTable } from "@/features/search-terms";

type DateRange = "LAST_7_DAYS" | "LAST_14_DAYS" | "LAST_30_DAYS" | "LAST_90_DAYS";

export function SearchTermsContent() {
  const { data: accounts, isLoading: isLoadingAccounts } = useAccounts();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange>("LAST_30_DAYS");

  // Auto-select first account if only one
  useEffect(() => {
    if (!selectedAccountId && accounts?.length === 1) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Search className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Search Terms</h1>
          <p className="text-muted-foreground">View search queries that triggered your ads</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Select an account and time range</CardDescription>
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
              <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LAST_7_DAYS">Last 7 days</SelectItem>
                  <SelectItem value="LAST_14_DAYS">Last 14 days</SelectItem>
                  <SelectItem value="LAST_30_DAYS">Last 30 days</SelectItem>
                  <SelectItem value="LAST_90_DAYS">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {selectedAccountId ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search Terms Report</CardTitle>
            <CardDescription>
              Search queries that triggered your ads in the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SearchTermsTable
              filters={{
                account_id: selectedAccountId,
                date_range: dateRange,
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select an account</h3>
              <p className="text-muted-foreground">
                Choose a Google Ads account to view search terms
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
