"use client";

import { AlertCircle, ArrowUpDown, RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSearchTerms } from "../hooks/use-search-terms";
import type { SearchTermStatus, SearchTermsFilters } from "../types";
import { getSearchTermStatusLabel } from "../types";

interface SearchTermsTableProps {
  filters: SearchTermsFilters;
}

type SortField = "search_term" | "impressions" | "clicks" | "ctr" | "cost_micros" | "conversions";
type SortDirection = "asc" | "desc";

// Static skeleton keys
const SKELETON_ROWS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6", "sk-7", "sk-8"] as const;

// Comparator for string values
function compareStrings(a: string, b: string, direction: SortDirection): number {
  return direction === "asc" ? a.localeCompare(b) : b.localeCompare(a);
}

// Comparator for numeric values
function compareNumbers(a: number, b: number, direction: SortDirection): number {
  return direction === "asc" ? a - b : b - a;
}

// Generic sort comparator
function createComparator<T>(field: SortField, direction: SortDirection) {
  return (a: T, b: T): number => {
    const aValue = (a as Record<string, unknown>)[field];
    const bValue = (b as Record<string, unknown>)[field];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return compareStrings(aValue, bValue, direction);
    }
    if (typeof aValue === "number" && typeof bValue === "number") {
      return compareNumbers(aValue, bValue, direction);
    }
    return 0;
  };
}

export function SearchTermsTable({ filters }: SearchTermsTableProps) {
  const { data, isLoading, error, refetch, isFetching } = useSearchTerms(filters);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("impressions");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Filter and sort data
  const filteredAndSorted = useMemo(() => {
    if (!data?.search_terms) return [];

    let filtered = data.search_terms;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (term) =>
          term.search_term.toLowerCase().includes(query) ||
          term.campaign_name.toLowerCase().includes(query) ||
          term.ad_group_name.toLowerCase().includes(query),
      );
    }

    // Apply sorting using extracted comparator
    return [...filtered].sort(createComparator(sortField, sortDirection));
  }, [data?.search_terms, searchQuery, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const formatCost = (micros: number) => {
    return `$${(micros / 1_000_000).toFixed(2)}`;
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const getStatusBadge = (status: SearchTermStatus) => {
    const variants: Record<SearchTermStatus, "default" | "secondary" | "destructive" | "outline"> =
      {
        NONE: "secondary",
        ADDED: "default",
        EXCLUDED: "destructive",
        ADDED_EXCLUDED: "outline",
        UNSPECIFIED: "secondary",
      };
    return (
      <Badge variant={variants[status] || "secondary"}>{getSearchTermStatusLabel(status)}</Badge>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Search Term</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Impressions</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>CTR</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Conversions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SKELETON_ROWS.map((id) => (
                <TableRow key={id}>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-14" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load search terms</h3>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : "An unexpected error occurred"}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
      </div>
    );
  }

  // Empty state
  if (!data?.search_terms.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Search className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No search terms found</h3>
        <p className="text-muted-foreground mb-4">
          No search queries have triggered your ads in the selected time period.
        </p>
        <Button onClick={() => refetch()} variant="outline" disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and refresh */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search terms, campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {filteredAndSorted.length} of {data.total_count} terms
          </p>
          <Button onClick={() => refetch()} variant="ghost" size="sm" disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3"
                  onClick={() => handleSort("search_term")}
                >
                  Search Term
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-mr-3"
                  onClick={() => handleSort("impressions")}
                >
                  Impressions
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-mr-3"
                  onClick={() => handleSort("clicks")}
                >
                  Clicks
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-mr-3"
                  onClick={() => handleSort("ctr")}
                >
                  CTR
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-mr-3"
                  onClick={() => handleSort("cost_micros")}
                >
                  Cost
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-mr-3"
                  onClick={() => handleSort("conversions")}
                >
                  Conversions
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSorted.map((term, index) => (
              <TableRow
                key={`${term.search_term}-${term.campaign_id}-${term.ad_group_id}-${index}`}
              >
                <TableCell>
                  <div>
                    <p className="font-medium">{term.search_term}</p>
                    <p className="text-xs text-muted-foreground">
                      {term.campaign_name} &gt; {term.ad_group_name}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(term.status)}</TableCell>
                <TableCell className="text-right">{term.impressions.toLocaleString()}</TableCell>
                <TableCell className="text-right">{term.clicks.toLocaleString()}</TableCell>
                <TableCell className="text-right">{formatPercent(term.ctr)}</TableCell>
                <TableCell className="text-right">{formatCost(term.cost_micros)}</TableCell>
                <TableCell className="text-right">{term.conversions.toFixed(1)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
