"use client";

import { AlertCircle, CheckCircle2, RefreshCw, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useConversionActions } from "../hooks/use-conversions";
import type { ConversionAction, ConversionActionsFilters } from "../types";
import {
  getAttributionModelLabel,
  getCategoryLabel,
  getConversionTypeLabel,
  getStatusVariant,
} from "../types";

interface ConversionActionsListProps {
  filters: ConversionActionsFilters;
}

// Static skeleton keys
const SKELETON_CARDS = ["sk-1", "sk-2", "sk-3", "sk-4"] as const;

function ConversionActionCard({ action }: { action: ConversionAction }) {
  const formatValue = (value: number | null) => {
    if (value === null) return "Not set";
    return `$${value.toFixed(2)}`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{action.name}</CardTitle>
              <CardDescription>{getConversionTypeLabel(action.type)}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {action.primary_for_goal && (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Primary
              </Badge>
            )}
            <Badge variant={getStatusVariant(action.status)}>{action.status}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Category</p>
            <p className="font-medium">{getCategoryLabel(action.category)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Counting</p>
            <p className="font-medium">
              {action.counting_type === "ONE_PER_CLICK" ? "One per click" : "Every conversion"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Default Value</p>
            <p className="font-medium">
              {formatValue(action.default_value)}
              {action.always_use_default_value && (
                <span className="text-muted-foreground text-xs ml-1">(always used)</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Attribution</p>
            <p className="font-medium">{getAttributionModelLabel(action.attribution_model)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConversionActionsList({ filters }: ConversionActionsListProps) {
  const { data, isLoading, error, refetch, isFetching } = useConversionActions(filters);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {SKELETON_CARDS.map((id) => (
          <Card key={id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load conversion actions</h3>
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
  if (!data?.conversion_actions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Target className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No conversion actions found</h3>
        <p className="text-muted-foreground mb-4">
          No conversion tracking has been set up for this account.
        </p>
        <Button onClick={() => refetch()} variant="outline" disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
    );
  }

  // Group by status
  const primaryActions = data.conversion_actions.filter((a) => a.primary_for_goal);
  const secondaryActions = data.conversion_actions.filter((a) => !a.primary_for_goal);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data.total_count} conversion action{data.total_count !== 1 ? "s" : ""} configured
        </p>
        <Button onClick={() => refetch()} variant="ghost" size="sm" disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Primary conversions */}
      {primaryActions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Primary Conversion Goals</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {primaryActions.map((action) => (
              <ConversionActionCard key={action.conversion_action_id} action={action} />
            ))}
          </div>
        </div>
      )}

      {/* Secondary conversions */}
      {secondaryActions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Other Conversion Actions</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {secondaryActions.map((action) => (
              <ConversionActionCard key={action.conversion_action_id} action={action} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
