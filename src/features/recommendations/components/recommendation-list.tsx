"use client";

import { AlertCircle, Lightbulb, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useApplyRecommendation,
  useDismissRecommendation,
} from "../hooks/use-recommendation-actions";
import { useRecommendations } from "../hooks/use-recommendations";
import type {
  ApplyRecommendationParameters,
  Recommendation,
  RecommendationFilters,
} from "../types";
import { ApplyRecommendationDialog } from "./apply-recommendation-dialog";
import { RecommendationCard } from "./recommendation-card";
import { RecommendationDetailPanel } from "./recommendation-detail-panel";

interface RecommendationListProps {
  filters: RecommendationFilters;
}

// Static skeleton keys - order never changes
const SKELETON_IDS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"] as const;

export function RecommendationList({ filters }: RecommendationListProps) {
  const { data, isLoading, error, refetch, isFetching } = useRecommendations(filters);
  const applyMutation = useApplyRecommendation(filters.account_id);
  const dismissMutation = useDismissRecommendation(filters.account_id);

  // Panel and dialog state
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  const handleViewDetails = (rec: Recommendation) => {
    setSelectedRecommendation(rec);
    setDetailPanelOpen(true);
  };

  const handleApplyClick = (rec: Recommendation) => {
    setSelectedRecommendation(rec);
    setApplyDialogOpen(true);
  };

  const handleApplyConfirm = async (
    rec: Recommendation,
    params?: ApplyRecommendationParameters,
  ) => {
    setApplyingId(rec.recommendation_id);
    try {
      await applyMutation.mutateAsync({
        recommendation_id: rec.resource_name,
        parameters: params,
      });
      setApplyDialogOpen(false);
      setDetailPanelOpen(false);
    } finally {
      setApplyingId(null);
    }
  };

  const handleDismiss = async (rec: Recommendation) => {
    setDismissingId(rec.recommendation_id);
    try {
      await dismissMutation.mutateAsync({
        recommendation_id: rec.resource_name,
      });
      setDetailPanelOpen(false);
    } finally {
      setDismissingId(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SKELETON_IDS.map((id) => (
          <div key={id} className="rounded-lg border p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-12 w-full mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load recommendations</h3>
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
  if (!data?.recommendations.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No recommendations</h3>
        <p className="text-muted-foreground mb-4">
          Google hasn&apos;t generated any recommendations for this account yet.
          <br />
          Check back later for optimization suggestions.
        </p>
        <Button onClick={() => refetch()} variant="outline" disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Header with count and refresh */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {data.total_count} recommendation{data.total_count !== 1 ? "s" : ""} found
        </p>
        <Button onClick={() => refetch()} variant="ghost" size="sm" disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Recommendations grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.recommendations.map((rec) => (
          <RecommendationCard
            key={rec.recommendation_id}
            recommendation={rec}
            onApply={handleApplyClick}
            onDismiss={handleDismiss}
            onViewDetails={handleViewDetails}
            isApplying={applyingId === rec.recommendation_id}
            isDismissing={dismissingId === rec.recommendation_id}
          />
        ))}
      </div>

      {/* Detail panel */}
      <RecommendationDetailPanel
        recommendation={selectedRecommendation}
        open={detailPanelOpen}
        onOpenChange={setDetailPanelOpen}
        onApply={handleApplyClick}
        onDismiss={handleDismiss}
        isApplying={applyingId === selectedRecommendation?.recommendation_id}
        isDismissing={dismissingId === selectedRecommendation?.recommendation_id}
      />

      {/* Apply confirmation dialog */}
      <ApplyRecommendationDialog
        recommendation={selectedRecommendation}
        open={applyDialogOpen}
        onOpenChange={setApplyDialogOpen}
        onConfirm={handleApplyConfirm}
        isApplying={applyingId === selectedRecommendation?.recommendation_id}
      />
    </>
  );
}
