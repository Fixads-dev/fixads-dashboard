"use client";

import { AlertCircle, RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSearchTerms } from "../hooks/use-search-terms";
import type { SearchTermsFilters } from "../types";
import { SearchTermsFilters as SearchTermsFiltersComponent } from "./search-terms-filters";
import { SearchTermsTableHeader } from "./search-terms-table-header";
import { SearchTermsTableRow } from "./search-terms-table-row";
import type { SortDirection, SortField } from "./utils/search-terms-sort";
import { createComparator } from "./utils/search-terms-sort";

interface SearchTermsTableProps {
  filters: SearchTermsFilters;
}

const SKELETON_ROWS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6", "sk-7", "sk-8"] as const;

export function SearchTermsTable({ filters }: SearchTermsTableProps) {
  const { data, isLoading, error, refetch, isFetching } = useSearchTerms(filters);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("impressions");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const filteredAndSorted = useMemo(() => {
    if (!data?.search_terms) return [];

    let filtered = data.search_terms;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (term) =>
          term.search_term.toLowerCase().includes(query) ||
          term.campaign_name.toLowerCase().includes(query) ||
          term.ad_group_name.toLowerCase().includes(query),
      );
    }

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
                  {[1, 2, 3, 4, 5, 6, 7].map((cell) => (
                    <td key={cell} className="p-4">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

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
      <SearchTermsFiltersComponent
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filteredCount={filteredAndSorted.length}
        totalCount={data.total_count}
        onRefresh={() => refetch()}
        isFetching={isFetching}
      />

      <div className="rounded-md border">
        <Table>
          <SearchTermsTableHeader onSort={handleSort} />
          <TableBody>
            {filteredAndSorted.map((term) => (
              <SearchTermsTableRow
                key={`${term.search_term}-${term.campaign_id}-${term.ad_group_id}`}
                term={term}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
