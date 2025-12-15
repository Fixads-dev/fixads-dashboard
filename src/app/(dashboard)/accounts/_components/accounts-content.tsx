"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountList, useStartConnectAccount } from "@/features/accounts";

export function AccountsContent() {
  const { mutate: startConnect, isPending } = useStartConnectAccount();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">Manage your connected Google Ads accounts</p>
        </div>
        <Button onClick={() => startConnect()} disabled={isPending}>
          <Plus className="mr-2 h-4 w-4" />
          {isPending ? "Connecting..." : "Connect Account"}
        </Button>
      </div>

      <AccountList onConnectClick={() => startConnect()} />
    </div>
  );
}
