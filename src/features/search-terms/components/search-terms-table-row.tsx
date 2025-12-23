import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import type { SearchTerm, SearchTermStatus } from "../types";
import { getSearchTermStatusLabel } from "../types";
import { formatCost, formatPercent } from "./utils/search-terms-formatters";

interface SearchTermsTableRowProps {
  term: SearchTerm;
}

const statusVariants: Record<
  SearchTermStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  NONE: "secondary",
  ADDED: "default",
  EXCLUDED: "destructive",
  ADDED_EXCLUDED: "outline",
  UNSPECIFIED: "secondary",
};

export function SearchTermsTableRow({ term }: SearchTermsTableRowProps) {
  return (
    <TableRow>
      <TableCell>
        <div>
          <p className="font-medium">{term.search_term}</p>
          <p className="text-xs text-muted-foreground">
            {term.campaign_name} &gt; {term.ad_group_name}
          </p>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={statusVariants[term.status] || "secondary"}>
          {getSearchTermStatusLabel(term.status)}
        </Badge>
      </TableCell>
      <TableCell className="text-right">{term.impressions.toLocaleString()}</TableCell>
      <TableCell className="text-right">{term.clicks.toLocaleString()}</TableCell>
      <TableCell className="text-right">{formatPercent(term.ctr)}</TableCell>
      <TableCell className="text-right">{formatCost(term.cost_micros)}</TableCell>
      <TableCell className="text-right">{term.conversions.toFixed(1)}</TableCell>
    </TableRow>
  );
}
