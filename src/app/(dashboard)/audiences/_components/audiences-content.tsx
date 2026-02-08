"use client";

import { Loader2, Search, Users, UserCheck, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccounts } from "@/features/accounts";
import {
  useAudiences,
  useCombinedAudiences,
  useUserLists,
} from "@/features/campaigns";
import type {
  Audience,
  AudienceType,
  CombinedAudience,
  UserList,
} from "@/features/campaigns/types";
import { formatCompact } from "@/shared/lib/format";

const audienceTypeLabels: Record<AudienceType, string> = {
  CUSTOM: "Custom",
  COMBINED: "Combined",
  IN_MARKET: "In-Market",
  AFFINITY: "Affinity",
  REMARKETING: "Remarketing",
  SIMILAR: "Similar",
};

const audienceTypeColors: Record<AudienceType, string> = {
  CUSTOM: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  COMBINED: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  IN_MARKET: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  AFFINITY: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  REMARKETING: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  SIMILAR: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
};

function AudiencesTable({ audiences, searchQuery }: { audiences: Audience[]; searchQuery: string }) {
  const filtered = audiences.filter(
    (a) =>
      a.audience_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false),
  );

  if (filtered.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No audiences found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Members</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((audience) => (
          <TableRow key={audience.audience_id}>
            <TableCell className="font-medium">{audience.audience_name}</TableCell>
            <TableCell>
              <Badge
                variant="secondary"
                className={audienceTypeColors[audience.audience_type] ?? ""}
              >
                {audienceTypeLabels[audience.audience_type] ?? audience.audience_type}
              </Badge>
            </TableCell>
            <TableCell className="max-w-xs truncate text-muted-foreground">
              {audience.description ?? "-"}
            </TableCell>
            <TableCell className="text-right">
              {audience.member_count ? formatCompact(audience.member_count) : "-"}
            </TableCell>
            <TableCell>
              <Badge variant={audience.status === "ENABLED" ? "default" : "secondary"}>
                {audience.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function UserListsTable({ userLists, searchQuery }: { userLists: UserList[]; searchQuery: string }) {
  const filtered = userLists.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false),
  );

  if (filtered.length === 0) {
    return (
      <div className="text-center py-8">
        <UserCheck className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No remarketing lists found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Display Size</TableHead>
          <TableHead className="text-right">Search Size</TableHead>
          <TableHead>Eligible For</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((list) => (
          <TableRow key={list.user_list_id}>
            <TableCell className="font-medium">{list.name}</TableCell>
            <TableCell className="max-w-xs truncate text-muted-foreground">
              {list.description ?? "-"}
            </TableCell>
            <TableCell className="text-right">
              {list.size_for_display ? formatCompact(list.size_for_display) : "-"}
            </TableCell>
            <TableCell className="text-right">
              {list.size_for_search ? formatCompact(list.size_for_search) : "-"}
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                {list.eligible_for_display && (
                  <Badge variant="outline" className="text-xs">
                    Display
                  </Badge>
                )}
                {list.eligible_for_search && (
                  <Badge variant="outline" className="text-xs">
                    Search
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={list.membership_status === "OPEN" ? "default" : "secondary"}>
                {list.membership_status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function CombinedAudiencesTable({
  audiences,
  searchQuery,
}: {
  audiences: CombinedAudience[];
  searchQuery: string;
}) {
  const filtered = audiences.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false),
  );

  if (filtered.length === 0) {
    return (
      <div className="text-center py-8">
        <UsersRound className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No combined audiences found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((audience) => (
          <TableRow key={audience.combined_audience_id}>
            <TableCell className="font-medium">{audience.name}</TableCell>
            <TableCell className="max-w-md truncate text-muted-foreground">
              {audience.description ?? "-"}
            </TableCell>
            <TableCell>
              <Badge variant={audience.status === "ENABLED" ? "default" : "secondary"}>
                {audience.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function AudiencesContent() {
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Get the selected account to access customer_id
  const selectedAccount = accounts?.find((a) => a.id === selectedAccountId);
  const customerId = selectedAccount?.customer_id ?? "";

  // Fetch audiences data
  const { data: audiencesData, isLoading: audiencesLoading } = useAudiences(
    selectedAccountId,
    customerId,
  );
  const { data: userListsData, isLoading: userListsLoading } = useUserLists(
    selectedAccountId,
    customerId,
  );
  const { data: combinedData, isLoading: combinedLoading } = useCombinedAudiences(
    selectedAccountId,
    customerId,
  );

  const audiences = audiencesData?.audiences ?? [];
  const userLists = userListsData?.user_lists ?? [];
  const combinedAudiences = combinedData?.combined_audiences ?? [];

  // Auto-select first account
  useEffect(() => {
    if (!selectedAccountId && accounts?.length === 1) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  const isLoading = audiencesLoading || userListsLoading || combinedLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audiences</h1>
          <p className="text-muted-foreground">
            View and manage your Google Ads audiences and remarketing lists
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-64">
              <Select
                value={selectedAccountId}
                onValueChange={setSelectedAccountId}
                disabled={accountsLoading}
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
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search audiences..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {selectedAccountId && !isLoading && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">All Audiences</span>
              </div>
              <p className="text-2xl font-bold">{audiences.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <UserCheck className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Remarketing Lists</span>
              </div>
              <p className="text-2xl font-bold">{userLists.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <UsersRound className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-muted-foreground">Combined Audiences</span>
              </div>
              <p className="text-2xl font-bold">{combinedAudiences.length}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content */}
      {!selectedAccountId ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">Select an Account</h3>
            <p className="text-muted-foreground">
              Choose a Google Ads account to view its audiences
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="all" className="w-full">
              <div className="border-b px-4">
                <TabsList className="h-12">
                  <TabsTrigger value="all">All Audiences ({audiences.length})</TabsTrigger>
                  <TabsTrigger value="remarketing">
                    Remarketing Lists ({userLists.length})
                  </TabsTrigger>
                  <TabsTrigger value="combined">
                    Combined ({combinedAudiences.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="m-0 p-4">
                <AudiencesTable audiences={audiences} searchQuery={searchQuery} />
              </TabsContent>

              <TabsContent value="remarketing" className="m-0 p-4">
                <UserListsTable userLists={userLists} searchQuery={searchQuery} />
              </TabsContent>

              <TabsContent value="combined" className="m-0 p-4">
                <CombinedAudiencesTable audiences={combinedAudiences} searchQuery={searchQuery} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
