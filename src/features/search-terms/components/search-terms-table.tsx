"use client";

import { AlertCircle, Loader2, Plus, RefreshCw, Search, XCircle } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBulkAddKeywords, useSearchTerms } from "../hooks/use-search-terms";
import type { KeywordMatchType, SearchTerm, SearchTermsFilters } from "../types";
import { MATCH_TYPE_LABELS } from "../types";
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
  const bulkAdd = useBulkAddKeywords(filters.account_id);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("impressions");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedTerms, setSelectedTerms] = useState<Set<string>>(new Set());
  const [bulkMatchType, setBulkMatchType] = useState<KeywordMatchType>("BROAD");

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

  // Only terms that can be added as keywords
  const selectableTerms = useMemo(
    () => filteredAndSorted.filter((term) => term.status === "NONE"),
    [filteredAndSorted],
  );

  const getTermKey = (term: SearchTerm) =>
    `${term.search_term}-${term.campaign_id}-${term.ad_group_id}`;

  const allSelected = selectableTerms.length > 0 && selectedTerms.size === selectableTerms.length;
  const someSelected = selectedTerms.size > 0 && selectedTerms.size < selectableTerms.length;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        setSelectedTerms(new Set(selectableTerms.map(getTermKey)));
      } else {
        setSelectedTerms(new Set());
      }
    },
    [selectableTerms],
  );

  const handleSelectTerm = useCallback((term: SearchTerm, selected: boolean) => {
    const key = getTermKey(term);
    setSelectedTerms((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  }, []);

  const handleBulkAdd = (isNegative: boolean) => {
    const termsToAdd = selectableTerms.filter((term) => selectedTerms.has(getTermKey(term)));

    bulkAdd.mutate(
      {
        keywords: termsToAdd.map((term) => ({
          ad_group_id: term.ad_group_id,
          keyword_text: term.search_term,
          match_type: bulkMatchType,
          is_negative: isNegative,
        })),
      },
      {
        onSuccess: () => {
          setSelectedTerms(new Set());
        },
      },
    );
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SKELETON_ROWS.map((id) => (
                <TableRow key={id}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((cell) => (
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

      {/* Bulk Action Bar */}
      {selectedTerms.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
          <span className="text-sm font-medium">{selectedTerms.size} selected</span>
          <div className="h-4 w-px bg-border" />
          <Select
            value={bulkMatchType}
            onValueChange={(v) => setBulkMatchType(v as KeywordMatchType)}
          >
            <SelectTrigger className="w-36 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(MATCH_TYPE_LABELS) as KeywordMatchType[]).map((type) => (
                <SelectItem key={type} value={type}>
                  {MATCH_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={() => handleBulkAdd(false)}
            disabled={bulkAdd.isPending}
          >
            {bulkAdd.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Add as Keywords
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleBulkAdd(true)}
            disabled={bulkAdd.isPending}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Add as Negatives
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedTerms(new Set())}
            disabled={bulkAdd.isPending}
          >
            Clear
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <SearchTermsTableHeader
            onSort={handleSort}
            showCheckbox={selectableTerms.length > 0}
            allSelected={allSelected}
            someSelected={someSelected}
            onSelectAll={handleSelectAll}
          />
          <TableBody>
            {filteredAndSorted.map((term) => {
              const key = getTermKey(term);
              return (
                <SearchTermsTableRow
                  key={key}
                  term={term}
                  accountId={filters.account_id}
                  showCheckbox={selectableTerms.length > 0}
                  selected={selectedTerms.has(key)}
                  onSelectChange={(selected) => handleSelectTerm(term, selected)}
                />
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
