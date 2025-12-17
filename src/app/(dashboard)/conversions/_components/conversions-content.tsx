"use client";

import { Target } from "lucide-react";
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
import { ConversionActionsList } from "@/features/conversions";

export function ConversionsContent() {
  const { data: accounts, isLoading: isLoadingAccounts } = useAccounts();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  // Auto-select first account if only one
  if (!selectedAccountId && accounts?.length === 1) {
    setSelectedAccountId(accounts[0].id);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Target className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Conversion Tracking</h1>
          <p className="text-muted-foreground">
            View conversion actions configured for your account
          </p>
        </div>
      </div>

      {/* Account selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Account</CardTitle>
          <CardDescription>Choose an account to view conversion tracking</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Conversion actions list */}
      {selectedAccountId ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conversion Actions</CardTitle>
            <CardDescription>Conversion goals and tracking configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <ConversionActionsList
              filters={{
                account_id: selectedAccountId,
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select an account</h3>
              <p className="text-muted-foreground">
                Choose a Google Ads account to view conversion tracking
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
