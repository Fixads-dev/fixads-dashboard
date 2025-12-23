import { RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchTermsFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filteredCount: number;
  totalCount: number;
  onRefresh: () => void;
  isFetching: boolean;
}

export function SearchTermsFilters({
  searchQuery,
  onSearchChange,
  filteredCount,
  totalCount,
  onRefresh,
  isFetching,
}: SearchTermsFiltersProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search terms, campaigns..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">
          {filteredCount} of {totalCount} terms
        </p>
        <Button onClick={onRefresh} variant="ghost" size="sm" disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
}
