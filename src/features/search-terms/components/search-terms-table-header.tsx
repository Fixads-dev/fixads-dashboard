import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SortField } from "./utils/search-terms-sort";

interface SearchTermsTableHeaderProps {
  onSort: (field: SortField) => void;
}

export function SearchTermsTableHeader({ onSort }: SearchTermsTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow>
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
      </TableRow>
    </TableHeader>
  );
}
