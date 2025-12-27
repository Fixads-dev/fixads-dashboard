import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SortField } from "./utils/search-terms-sort";

interface SearchTermsTableHeaderProps {
  onSort: (field: SortField) => void;
  showCheckbox?: boolean;
  allSelected?: boolean;
  someSelected?: boolean;
  onSelectAll?: (selected: boolean) => void;
}

export function SearchTermsTableHeader({
  onSort,
  showCheckbox = false,
  allSelected = false,
  someSelected = false,
  onSelectAll,
}: SearchTermsTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow>
        {showCheckbox && (
          <TableHead className="w-12">
            <Checkbox
              checked={allSelected}
              ref={(el) => {
                if (el) {
                  (el as HTMLButtonElement & { indeterminate?: boolean }).indeterminate =
                    !allSelected && someSelected;
                }
              }}
              onCheckedChange={(checked) => onSelectAll?.(checked === true)}
              aria-label="Select all"
            />
          </TableHead>
        )}
        <TableHead>
          <Button variant="ghost" size="sm" className="-ml-3" onClick={() => onSort("search_term")}>
            Search Term
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">
          <Button variant="ghost" size="sm" className="-mr-3" onClick={() => onSort("impressions")}>
            Impressions
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </TableHead>
        <TableHead className="text-right">
          <Button variant="ghost" size="sm" className="-mr-3" onClick={() => onSort("clicks")}>
            Clicks
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </TableHead>
        <TableHead className="text-right">
          <Button variant="ghost" size="sm" className="-mr-3" onClick={() => onSort("ctr")}>
            CTR
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </TableHead>
        <TableHead className="text-right">
          <Button variant="ghost" size="sm" className="-mr-3" onClick={() => onSort("cost_micros")}>
            Cost
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </TableHead>
        <TableHead className="text-right">
          <Button variant="ghost" size="sm" className="-mr-3" onClick={() => onSort("conversions")}>
            Conversions
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </TableHead>
        <TableHead className="w-12">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
