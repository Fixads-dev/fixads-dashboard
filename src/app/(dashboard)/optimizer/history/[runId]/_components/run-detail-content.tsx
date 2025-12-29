"use client";

import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  Play,
  RefreshCw,
  Sparkles,
  Timer,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { type OptimizationRunStatus, useOptimizationRun } from "@/features/optimizer";
import { ROUTES } from "@/shared/lib/constants";
import { formatDate } from "@/shared/lib/format";

const STATUS_CONFIG: Record<
  OptimizationRunStatus,
  { label: string; icon: typeof CheckCircle2; color: string; bgColor: string; description: string }
> = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-500/10",
    description: "Optimization is queued and waiting to start",
  },
  RUNNING: {
    label: "Running",
    icon: RefreshCw,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    description: "Optimization is currently in progress",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-500/10",
    description: "Optimization finished successfully",
  },
  FAILED: {
    label: "Failed",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-500/10",
    description: "Optimization encountered an error",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: AlertCircle,
    color: "text-gray-600",
    bgColor: "bg-gray-500/10",
    description: "Optimization was cancelled",
  },
};

const RUN_TYPE_CONFIG = {
  MANUAL: { label: "Manual", icon: Play, description: "Triggered manually by user" },
  SCHEDULED: { label: "Scheduled", icon: Clock, description: "Triggered by schedule" },
  AUTO: { label: "Auto", icon: Sparkles, description: "Triggered automatically" },
};

function calculateDuration(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();

  if (diffMs < 1000) return "< 1 second";
  if (diffMs < 60000) return `${Math.round(diffMs / 1000)} seconds`;
  if (diffMs < 3600000) {
    const mins = Math.floor(diffMs / 60000);
    const secs = Math.round((diffMs % 60000) / 1000);
    return secs > 0 ? `${mins}m ${secs}s` : `${mins} minutes`;
  }
  const hours = Math.floor(diffMs / 3600000);
  const mins = Math.round((diffMs % 3600000) / 60000);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`;
}

export function RunDetailContent() {
  const params = useParams();
  const router = useRouter();
  const runId = params.runId as string;

  const { data: run, isPending, isError, refetch } = useOptimizationRun(runId);

  if (isPending) {
    return <LoadingSkeleton />;
  }

  if (isError || !run) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive/50" />
            <p className="mt-4 text-sm font-medium">Failed to load optimization run</p>
            <p className="text-sm text-muted-foreground">
              The run may not exist or you don&apos;t have access
            </p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Try Again
              </Button>
              <Button asChild size="sm">
                <Link href={ROUTES.OPTIMIZER_HISTORY}>View All Runs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[run.status];
  const StatusIcon = statusConfig.icon;
  const runTypeConfig = RUN_TYPE_CONFIG[run.run_type];
  const RunTypeIcon = runTypeConfig.icon;

  const duration =
    run.completed_at && run.started_at
      ? calculateDuration(run.started_at, run.completed_at)
      : run.status === "RUNNING"
        ? "In progress..."
        : "-";

  const improvementRate =
    run.assets_analyzed > 0
      ? ((run.assets_applied / run.assets_analyzed) * 100).toFixed(1)
      : "0";

  const badAssetRate =
    run.assets_analyzed > 0
      ? ((run.assets_not_good / run.assets_analyzed) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Optimization Run</h1>
              <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">{statusConfig.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {(run.status === "COMPLETED" || run.status === "FAILED") && (
            <Button asChild size="sm">
              <Link
                href={`${ROUTES.OPTIMIZER_TEXT}?accountId=${run.account_id}&campaignId=${run.campaign_id}`}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Re-run Optimization
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
              <CardDescription>Overview of optimization results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Assets Analyzed"
                  value={run.assets_analyzed}
                  icon={FileText}
                  color="text-blue-600"
                />
                <StatCard
                  label="Bad Assets Found"
                  value={run.assets_not_good}
                  icon={TrendingDown}
                  color="text-red-600"
                  subtitle={`${badAssetRate}% of total`}
                />
                <StatCard
                  label="Suggestions Made"
                  value={run.assets_suggested}
                  icon={Sparkles}
                  color="text-purple-600"
                />
                <StatCard
                  label="Changes Applied"
                  value={run.assets_applied}
                  icon={TrendingUp}
                  color="text-green-600"
                  subtitle={`${improvementRate}% applied`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Error Message (if failed) */}
          {run.status === "FAILED" && run.error_message && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                  <XCircle className="h-5 w-5" />
                  Error Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                  {run.error_message}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <TimelineItem
                  icon={Calendar}
                  label="Created"
                  value={formatDate(run.created_at, "PPpp")}
                  isFirst
                />
                <TimelineItem
                  icon={Play}
                  label="Started"
                  value={run.started_at ? formatDate(run.started_at, "PPpp") : "Not started"}
                />
                <TimelineItem
                  icon={run.status === "COMPLETED" ? CheckCircle2 : StatusIcon}
                  label="Completed"
                  value={run.completed_at ? formatDate(run.completed_at, "PPpp") : "Not completed"}
                  isLast
                  color={statusConfig.color}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          {/* Run Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Run Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow label="Run ID" value={run.id} mono />
              <Separator />
              <InfoRow
                label="Type"
                value={
                  <div className="flex items-center gap-2">
                    <RunTypeIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{runTypeConfig.label}</span>
                  </div>
                }
              />
              <Separator />
              <InfoRow
                label="Duration"
                value={
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <span>{duration}</span>
                  </div>
                }
              />
            </CardContent>
          </Card>

          {/* Campaign Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow label="Campaign ID" value={run.campaign_id} mono />
              <Separator />
              <InfoRow label="Account ID" value={run.account_id} mono />
              <Separator />
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={ROUTES.CAMPAIGNS}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Campaign
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href={ROUTES.OPTIMIZER_HISTORY}>
                  <Clock className="mr-2 h-4 w-4" />
                  View All Runs
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href={ROUTES.OPTIMIZER_TEXT}>
                  <FileText className="mr-2 h-4 w-4" />
                  Text Optimizer
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href={ROUTES.OPTIMIZER_SMART}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Smart Optimizer
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  label: string;
  value: number;
  icon: typeof FileText;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold">{value.toLocaleString()}</p>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function TimelineItem({
  icon: Icon,
  label,
  value,
  isFirst = false,
  isLast = false,
  color = "text-muted-foreground",
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
  isFirst?: boolean;
  isLast?: boolean;
  color?: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`rounded-full p-2 ${isLast ? "bg-muted" : "bg-muted/50"}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-border" />}
      </div>
      <div className={`pb-4 ${isLast ? "pb-0" : ""}`}>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      {typeof value === "string" ? (
        <span className={`text-sm ${mono ? "font-mono text-xs" : ""} break-all`}>{value}</span>
      ) : (
        value
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
}
