"use client";

import { Building2 } from "lucide-react";
import { EmptyState, ErrorFallback } from "@/shared/components";
import { CardSkeleton } from "@/shared/components/loading-skeleton";
import { useAccounts, useDisconnectAccount } from "../hooks";
import { AccountCard } from "./account-card";

interface AccountListProps {
  onConnectClick?: () => void;
}

export function AccountList({ onConnectClick }: AccountListProps) {
  const { data: accounts, isLoading, error, refetch } = useAccounts();
  const { mutate: disconnect, isPending: isDisconnecting } = useDisconnectAccount();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton list never reorders
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorFallback error={error} onRetry={() => refetch()} />;
  }

  if (!accounts?.length) {
    return (
      <EmptyState
        icon={Building2}
        title="No accounts connected"
        description="Connect your Google Ads account to start optimizing your campaigns."
        action={
          onConnectClick
            ? {
                label: "Connect Account",
                onClick: onConnectClick,
              }
            : undefined
        }
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          onDisconnect={disconnect}
          isDisconnecting={isDisconnecting}
        />
      ))}
    </div>
  );
}
