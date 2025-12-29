"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Filter,
  History,
  Play,
  RefreshCw,
  Sparkles,
  Type,
  Wand2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAccounts } from "@/features/accounts";
import {
  type OptimizationRun,
  type OptimizationRunStatus,
  useOptimizationRuns,
} from "@/features/optimizer";
import { ROUTES } from "@/shared/lib/constants";
import { formatDate } from "@/shared/lib/format";

const STATUS_CONFIG: Record<
  OptimizationRunStatus,
  { label: string; icon: typeof CheckCircle2; color: string; bgColor: string }
> = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-500/10",
  },
  RUNNING: {
    label: "Running",
    icon: RefreshCw,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-500/10",
  },
  FAILED: {
    label: "Failed",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-500/10",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: AlertCircle,
    color: "text-gray-600",
    bgColor: "bg-gray-500/10",
  },
};

const RUN_TYPE_CONFIG = {
  MANUAL: { label: "Manual", icon: Play },
  SCHEDULED: { label: "Scheduled", icon: Clock },
  AUTO: { label: "Auto", icon: Sparkles },
};

const PAGE_SIZE = 20;

function calculateDurationForExport(start: string, end: string | null | undefined): string {
  if (!end) return "-";
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  if (diffMs < 1000) return "<1s";
  if (diffMs < 60000) return `${Math.round(diffMs / 1000)}s`;
  if (diffMs < 3600000) return `${Math.round(diffMs / 60000)}m`;
  return `${Math.round(diffMs / 3600000)}h`;
}

function exportRunsToCSV(runs: OptimizationRun[]): void {
  const headers = [
    "Run ID",
    "Status",
    "Run Type",
    "Account ID",
    "Campaign ID",
    "Assets Analyzed",
    "Bad Assets Found",
    "Assets Suggested",
    "Assets Applied",
    "Created At",
    "Started At",
    "Completed At",
    "Duration",
    "Error Message",
  ];

  const rows = runs.map((run) => [
    run.id,
    run.status,
    run.run_type,
    run.account_id,
    run.campaign_id,
    run.assets_analyzed.toString(),
    run.assets_not_good.toString(),
    run.assets_suggested.toString(),
    run.assets_applied.toString(),
    run.created_at,
    run.started_at,
    run.completed_at ?? "-",
    calculateDurationForExport(run.started_at, run.completed_at),
    run.error_message ?? "-",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const timestamp = new Date().toISOString().slice(0, 10);
  link.download = `optimization-runs-${timestamp}-${runs.length}-items.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function HistoryContent() {
  const { data: accounts, isPending: isLoadingAccounts } = useAccounts();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<OptimizationRunStatus | "ALL">("ALL");
  const [page, setPage] = useState(0);
  const [selectedRunIds, setSelectedRunIds] = useState<Set<string>>(new Set());

  // Auto-select first account
  const accountId = selectedAccountId || accounts?.[0]?.id || "";

  const {
    data: runsData,
    isPending: isLoadingRuns,
    isError: isRunsError,
    refetch,
  } = useOptimizationRuns(accountId, {
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  const hasAccounts = accounts && accounts.length > 0;
  const runs = runsData?.items ?? [];
  const totalRuns = runsData?.total ?? 0;
  const totalPages = Math.ceil(totalRuns / PAGE_SIZE);

  const handleAccountChange = (value: string) => {
    setSelectedAccountId(value);
    setPage(0);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as OptimizationRunStatus | "ALL");
    setPage(0);
  };

  const toggleRunSelection = (runId: string) => {
    setSelectedRunIds((prev) => {
      const next = new Set(prev);
      if (next.has(runId)) {
        next.delete(runId);
      } else {
        next.add(runId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRunIds.size === runs.length) {
      setSelectedRunIds(new Set());
    } else {
      setSelectedRunIds(new Set(runs.map((r) => r.id)));
    }
  };

  const handleBulkExport = () => {
    const selectedRuns = runs.filter((r) => selectedRunIds.has(r.id));
    if (selectedRuns.length > 0) {
      exportRunsToCSV(selectedRuns);
    }
  };

  const handleExportAll = () => {
    if (runs.length > 0) {
      exportRunsToCSV(runs);
    }
  };

  const isAllSelected = runs.length > 0 && selectedRunIds.size === runs.length;
  const isSomeSelected = selectedRunIds.size > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Optimization History</h1>
          <p className="text-muted-foreground">
            View all optimization runs and their results
          </p>
        </div>
        <div className="flex gap-2">
          {isSomeSelected ? (
            <Button variant="outline" size="sm" onClick={handleBulkExport}>
              <Download className="mr-2 h-4 w-4" />
              Export Selected ({selectedRunIds.size})
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportAll}
              disabled={runs.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export All
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button asChild size="sm">
            <Link href={ROUTES.OPTIMIZER}>
              <Wand2 className="mr-2 h-4 w-4" />
              New Optimization
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {isLoadingAccounts ? (
              <Skeleton className="h-10 w-48" />
            ) : hasAccounts ? (
              <Select value={accountId} onValueChange={handleAccountChange}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.descriptive_name || account.customer_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}

            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="RUNNING">Running</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Optimization Runs
              </CardTitle>
              <CardDescription>
                {totalRuns > 0 ? `${totalRuns} total runs` : "No runs found"}
              </CardDescription>
            </div>
            {totalRuns > 0 && (
              <Badge variant="outline">
                Page {page + 1} of {totalPages}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!hasAccounts ? (
            <EmptyState
              icon={Sparkles}
              title="Connect an account"
              description="Connect a Google Ads account to see optimization history"
              action={
                <Button asChild variant="outline" size="sm">
                  <Link href={ROUTES.ACCOUNTS}>Connect Account</Link>
                </Button>
              }
            />
          ) : isLoadingRuns ? (
            <LoadingSkeleton />
          ) : isRunsError ? (
            <EmptyState
              icon={AlertCircle}
              title="Failed to load history"
              description="There was an error loading optimization runs"
              action={
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Try Again
                </Button>
              }
            />
          ) : runs.length === 0 ? (
            <EmptyState
              icon={History}
              title="No optimization runs"
              description={
                statusFilter !== "ALL"
                  ? `No ${statusFilter.toLowerCase()} runs found`
                  : "Run your first optimization to see history"
              }
              action={
                <div className="flex gap-2">
                  <Button asChild size="sm">
                    <Link href={ROUTES.OPTIMIZER_TEXT}>
                      <Type className="mr-2 h-4 w-4" />
                      Text Optimizer
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={ROUTES.OPTIMIZER_SMART}>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Smart Optimizer
                    </Link>
                  </Button>
                </div>
              }
            />
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={isAllSelected}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead className="text-center">Analyzed</TableHead>
                      <TableHead className="text-center">Bad</TableHead>
                      <TableHead className="text-center">Suggested</TableHead>
                      <TableHead className="text-center">Applied</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {runs.map((run) => (
                      <RunRow
                        key={run.id}
                        run={run}
                        isSelected={selectedRunIds.has(run.id)}
                        onToggleSelect={toggleRunSelection}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {page * PAGE_SIZE + 1} to{" "}
                    {Math.min((page + 1) * PAGE_SIZE, totalRuns)} of {totalRuns}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RunRow({
  run,
  isSelected,
  onToggleSelect,
}: {
  run: OptimizationRun;
  isSelected: boolean;
  onToggleSelect: (runId: string) => void;
}) {
  const router = useRouter();
  const statusConfig = STATUS_CONFIG[run.status];
  const StatusIcon = statusConfig.icon;
  const runTypeConfig = RUN_TYPE_CONFIG[run.run_type];
  const RunTypeIcon = runTypeConfig.icon;

  // Calculate duration
  const duration = run.completed_at
    ? calculateDuration(run.started_at, run.completed_at)
    : run.status === "RUNNING"
      ? "In progress..."
      : "-";

  const handleRowClick = () => {
    router.push(ROUTES.OPTIMIZER_RUN_DETAIL(run.id));
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect(run.id);
  };

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={handleRowClick}
    >
      <TableCell onClick={handleCheckboxClick}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(run.id)}
          aria-label={`Select run ${run.id}`}
        />
      </TableCell>
      <TableCell>
        <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}>
          <StatusIcon className="mr-1 h-3 w-3" />
          {statusConfig.label}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <RunTypeIcon className="h-3.5 w-3.5" />
          {runTypeConfig.label}
        </div>
      </TableCell>
      <TableCell>
        <span className="font-mono text-xs text-muted-foreground">
          {run.campaign_id.slice(0, 12)}...
        </span>
      </TableCell>
      <TableCell className="text-center">{run.assets_analyzed}</TableCell>
      <TableCell className="text-center">
        {run.assets_not_good > 0 ? (
          <span className="text-destructive font-medium">{run.assets_not_good}</span>
        ) : (
          <span className="text-muted-foreground">0</span>
        )}
      </TableCell>
      <TableCell className="text-center">
        {run.assets_suggested > 0 ? (
          <span className="text-blue-600 font-medium">{run.assets_suggested}</span>
        ) : (
          <span className="text-muted-foreground">0</span>
        )}
      </TableCell>
      <TableCell className="text-center">
        {run.assets_applied > 0 ? (
          <span className="text-green-600 font-medium">{run.assets_applied}</span>
        ) : (
          <span className="text-muted-foreground">0</span>
        )}
      </TableCell>
      <TableCell>
        <span className="text-sm">{formatDate(run.started_at, "MMM d, HH:mm")}</span>
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">{duration}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </TableCell>
    </TableRow>
  );
}

function calculateDuration(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();

  if (diffMs < 1000) return "<1s";
  if (diffMs < 60000) return `${Math.round(diffMs / 1000)}s`;
  if (diffMs < 3600000) return `${Math.round(diffMs / 60000)}m`;
  return `${Math.round(diffMs / 3600000)}h`;
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof Sparkles;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-12 w-12 text-muted-foreground/30" />
      <p className="mt-4 text-sm font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
