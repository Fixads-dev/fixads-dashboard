"use client";

import { MoreHorizontal, Plus, XCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import type { SearchTerm, SearchTermStatus } from "../types";
import { getSearchTermStatusLabel } from "../types";
import { AddKeywordDialog } from "./add-keyword-dialog";
import { formatCost, formatPercent } from "./utils/search-terms-formatters";

interface SearchTermsTableRowProps {
  term: SearchTerm;
  accountId: string;
  selected?: boolean;
  onSelectChange?: (selected: boolean) => void;
  showCheckbox?: boolean;
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

export function SearchTermsTableRow({
  term,
  accountId,
  selected = false,
  onSelectChange,
  showCheckbox = false,
}: SearchTermsTableRowProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isNegative, setIsNegative] = useState(false);

  const canAddAsKeyword = term.status === "NONE";

  const handleAddKeyword = () => {
    setIsNegative(false);
    setDialogOpen(true);
  };

  const handleAddNegative = () => {
    setIsNegative(true);
    setDialogOpen(true);
  };

  return (
    <>
      <TableRow className={selected ? "bg-muted/50" : undefined}>
        {showCheckbox && (
          <TableCell className="w-12">
            <Checkbox
              checked={selected}
              onCheckedChange={(checked) => onSelectChange?.(checked === true)}
              disabled={!canAddAsKeyword}
              aria-label={`Select ${term.search_term}`}
            />
          </TableCell>
        )}
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
        <TableCell className="w-12">
          {canAddAsKeyword && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleAddKeyword}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add as Keyword
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleAddNegative} className="text-destructive">
                  <XCircle className="mr-2 h-4 w-4" />
                  Add as Negative
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </TableCell>
      </TableRow>

      <AddKeywordDialog
        searchTerm={term}
        accountId={accountId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultIsNegative={isNegative}
      />
    </>
  );
}
