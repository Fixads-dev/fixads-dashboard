"use client";

import { Building2, ExternalLink, MoreHorizontal, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/shared/lib/constants";
import { useSyncAccount } from "../hooks/use-sync-account";
import type { GoogleAdsAccount } from "../types";

interface AccountCardProps {
  account: GoogleAdsAccount;
  onDisconnect?: (accountId: string) => void;
  onRefresh?: (accountId: string) => void;
  isDisconnecting?: boolean;
  isRefreshing?: boolean;
}

export function AccountCard({
  account,
  onDisconnect,
  onRefresh,
  isDisconnecting,
  isRefreshing,
}: AccountCardProps) {
  const { mutate: syncAccount, isPending: isSyncing } = useSyncAccount();

  const handleSync = () => {
    syncAccount({ account_id: account.id });
  };

  const formatCustomerId = (id: string) => {
    // Format as XXX-XXX-XXXX
    const cleaned = id.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return id;
  };

  const isConnected = account.status === "active";
  const displayName = account.descriptive_name ?? formatCustomerId(account.customer_id);

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">{displayName}</CardTitle>
            <CardDescription className="font-mono text-xs">
              {formatCustomerId(account.customer_id)}
            </CardDescription>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`${ROUTES.CAMPAIGNS}?account=${account.id}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View Campaigns
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSync} disabled={isSyncing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
              Sync Data
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDisconnect?.(account.id)}
              disabled={isDisconnecting}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          {account.is_manager && <Badge variant="outline">Manager Account</Badge>}
          {account.currency_code && (
            <span className="text-xs text-muted-foreground">
              {account.currency_code}
              {account.time_zone && ` · ${account.time_zone}`}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
