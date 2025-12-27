"use client";

import { AlertCircle, Check, Loader2, Plus, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddKeyword } from "../hooks/use-search-terms";
import type { KeywordMatchType, SearchTerm } from "../types";
import { MATCH_TYPE_DESCRIPTIONS, MATCH_TYPE_LABELS } from "../types";

interface AddKeywordDialogProps {
  searchTerm: SearchTerm;
  accountId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultIsNegative?: boolean;
}

export function AddKeywordDialog({
  searchTerm,
  accountId,
  open,
  onOpenChange,
  defaultIsNegative = false,
}: AddKeywordDialogProps) {
  const [matchType, setMatchType] = useState<KeywordMatchType>("BROAD");
  const [isNegative] = useState(defaultIsNegative);

  const addKeyword = useAddKeyword(accountId);

  const handleAdd = () => {
    addKeyword.mutate(
      {
        ad_group_id: searchTerm.ad_group_id,
        keyword_text: searchTerm.search_term,
        match_type: matchType,
        is_negative: isNegative,
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            onOpenChange(false);
          }
        },
      },
    );
  };

  const title = isNegative ? "Add as Negative Keyword" : "Add as Keyword";
  const description = isNegative
    ? "Prevent this search term from triggering your ads"
    : "Add this search term as a keyword to your ad group";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isNegative ? (
              <XCircle className="h-5 w-5 text-destructive" />
            ) : (
              <Plus className="h-5 w-5 text-primary" />
            )}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search Term Info */}
          <div className="rounded-lg bg-muted p-3">
            <p className="font-medium">&quot;{searchTerm.search_term}&quot;</p>
            <p className="text-sm text-muted-foreground">
              {searchTerm.campaign_name} &gt; {searchTerm.ad_group_name}
            </p>
          </div>

          {/* Match Type Selector */}
          {!isNegative && (
            <div className="space-y-2">
              <Label htmlFor="match-type">Match Type</Label>
              <Select value={matchType} onValueChange={(v) => setMatchType(v as KeywordMatchType)}>
                <SelectTrigger id="match-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(MATCH_TYPE_LABELS) as KeywordMatchType[]).map((type) => (
                    <SelectItem key={type} value={type}>
                      <div className="flex flex-col">
                        <span>{MATCH_TYPE_LABELS[type]}</span>
                        <span className="text-xs text-muted-foreground">
                          {MATCH_TYPE_DESCRIPTIONS[type]}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Error Display */}
          {addKeyword.isError && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>
                {addKeyword.error instanceof Error
                  ? addKeyword.error.message
                  : "Failed to add keyword"}
              </p>
            </div>
          )}

          {/* Success Display */}
          {addKeyword.isSuccess && addKeyword.data?.success && (
            <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-600">
              <Check className="h-4 w-4 shrink-0" />
              <p>Keyword added successfully!</p>
            </div>
          )}

          {/* API Error Display */}
          {addKeyword.isSuccess && !addKeyword.data?.success && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{addKeyword.data?.error_message || "Failed to add keyword"}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={addKeyword.isPending}
            variant={isNegative ? "destructive" : "default"}
          >
            {addKeyword.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add {isNegative ? "Negative " : ""}Keyword
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
