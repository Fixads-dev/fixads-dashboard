"use client";

import { Building2, Check, Crown, Loader2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { AccessibleCustomer } from "@/features/accounts";

interface AccountSelectionProps {
  customers: AccessibleCustomer[];
  onConnect: (accounts: Array<{ customer_id: string; login_customer_id?: string }>) => void;
  isConnecting: boolean;
}

export function AccountSelection({ customers, onConnect, isConnecting }: AccountSelectionProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Separate MCC accounts from regular accounts
  const mccAccounts = customers.filter((c) => c.is_manager);
  const regularAccounts = customers.filter((c) => !c.is_manager);

  const toggleAccount = (customerId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(customerId)) {
        next.delete(customerId);
      } else {
        next.add(customerId);
      }
      return next;
    });
  };

  const selectAll = () => {
    // Select all regular accounts (not MCCs - they don't have campaigns)
    setSelectedIds(new Set(regularAccounts.map((c) => c.customer_id)));
  };

  const handleConnect = () => {
    // Find the MCC to use as login_customer_id (if any)
    const mcc = mccAccounts[0];

    const accountsToConnect = customers
      .filter((c) => selectedIds.has(c.customer_id))
      .map((c) => ({
        customer_id: c.customer_id,
        // Use MCC as login_customer_id for sub-accounts, or own ID for MCC
        login_customer_id: c.is_manager ? c.customer_id : mcc?.customer_id,
      }));

    onConnect(accountsToConnect);
  };

  const formatCustomerId = (id: string) => {
    const cleaned = id.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return id;
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Select Accounts to Connect
        </CardTitle>
        <CardDescription>
          Choose which Google Ads accounts you want to manage. Select your ad accounts (not manager
          accounts) to see campaigns.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mccAccounts.length > 0 && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/50 p-3">
            <div className="flex items-start gap-2">
              <Crown className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Manager Account Detected
                </p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  Your MCC (
                  {mccAccounts
                    .map((m) => m.descriptive_name || formatCustomerId(m.customer_id))
                    .join(", ")}
                  ) will be used for authentication. Select the ad accounts below to see their
                  campaigns.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} account{selectedIds.size !== 1 ? "s" : ""} selected
          </span>
          <Button variant="ghost" size="sm" onClick={selectAll}>
            Select All Ad Accounts
          </Button>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {customers.map((customer) => {
            const isSelected = selectedIds.has(customer.customer_id);
            const isMCC = customer.is_manager;

            return (
              <button
                key={customer.customer_id}
                type="button"
                disabled={isMCC}
                className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors w-full text-left ${
                  isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                } ${isMCC ? "opacity-60 cursor-not-allowed" : ""}`}
                onClick={() => !isMCC && toggleAccount(customer.customer_id)}
              >
                <Checkbox
                  checked={isSelected}
                  disabled={isMCC}
                  onCheckedChange={() => toggleAccount(customer.customer_id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                      {customer.descriptive_name || "Unnamed Account"}
                    </span>
                    {isMCC && (
                      <Badge variant="outline" className="shrink-0">
                        <Crown className="h-3 w-3 mr-1" />
                        MCC
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatCustomerId(customer.customer_id)}
                  </span>
                </div>
                {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>

        <Button
          onClick={handleConnect}
          disabled={selectedIds.size === 0 || isConnecting}
          className="w-full"
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              Connect {selectedIds.size} Account{selectedIds.size !== 1 ? "s" : ""}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
