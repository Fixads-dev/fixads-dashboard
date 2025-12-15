"use client";

import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccounts, useStartConnectAccount } from "@/features/accounts";
import { type CampaignFilters, CampaignList, type CampaignStatus } from "@/features/campaigns";
import { useDebounce } from "@/shared/hooks";

const statusOptions: Array<{ value: CampaignStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "All Statuses" },
  { value: "ENABLED", label: "Enabled" },
  { value: "PAUSED", label: "Paused" },
  { value: "REMOVED", label: "Removed" },
];

export function CampaignsContent() {
  const searchParams = useSearchParams();
  const initialAccountId = searchParams.get("account") ?? undefined;

  const [accountId, setAccountId] = useState<string | undefined>(initialAccountId);
  const [status, setStatus] = useState<CampaignStatus | undefined>();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data: accountsData } = useAccounts();
  const { mutate: connectAccount } = useStartConnectAccount();

  const filters: CampaignFilters = {
    accountId,
    status,
    search: debouncedSearch || undefined,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
        <p className="text-muted-foreground">View and manage your Performance Max campaigns</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={accountId ?? "ALL"}
          onValueChange={(value) => setAccountId(value === "ALL" ? undefined : value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Accounts</SelectItem>
            {accountsData?.items.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.descriptiveName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={status ?? "ALL"}
          onValueChange={(value) =>
            setStatus(value === "ALL" ? undefined : (value as CampaignStatus))
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <CampaignList filters={filters} onConnectAccount={() => connectAccount()} />
    </div>
  );
}
