"use client";

import { useState } from "react";
import { FileText, Plus, Trash2, Play, Edit, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReports, useCreateReport, useDeleteReport, useGenerateReport } from "@/features/reports";
import type { CreateReportRequest, CustomReport, DateRange } from "@/features/reports";
import { format } from "date-fns";
import { toast } from "sonner";

const AVAILABLE_METRICS = [
  { value: "clicks", label: "Clicks" },
  { value: "impressions", label: "Impressions" },
  { value: "ctr", label: "CTR" },
  { value: "cost", label: "Cost" },
  { value: "conversions", label: "Conversions" },
  { value: "conversions_value", label: "Conversion Value" },
  { value: "cost_per_conversion", label: "Cost per Conversion" },
  { value: "average_cpc", label: "Average CPC" },
  { value: "roas", label: "ROAS" },
];

const AVAILABLE_DIMENSIONS = [
  { value: "campaign", label: "Campaign" },
  { value: "date", label: "Date" },
  { value: "device", label: "Device" },
  { value: "day_of_week", label: "Day of Week" },
  { value: "hour", label: "Hour" },
  { value: "geo_country", label: "Country" },
  { value: "geo_region", label: "Region" },
];

const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: "TODAY", label: "Today" },
  { value: "YESTERDAY", label: "Yesterday" },
  { value: "LAST_7_DAYS", label: "Last 7 Days" },
  { value: "LAST_14_DAYS", label: "Last 14 Days" },
  { value: "LAST_30_DAYS", label: "Last 30 Days" },
  { value: "LAST_90_DAYS", label: "Last 90 Days" },
  { value: "THIS_MONTH", label: "This Month" },
  { value: "LAST_MONTH", label: "Last Month" },
];

export function ReportsContent() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newReport, setNewReport] = useState<CreateReportRequest>({
    name: "",
    description: "",
    metrics: ["clicks", "impressions", "ctr"],
    dimensions: ["campaign", "date"],
    date_range: "LAST_30_DAYS",
  });

  const { data: reportsData, isLoading } = useReports();
  const createMutation = useCreateReport();
  const deleteMutation = useDeleteReport();
  const generateMutation = useGenerateReport();

  const handleCreate = async () => {
    if (!newReport.name.trim()) {
      toast.error("Report name is required");
      return;
    }

    try {
      await createMutation.mutateAsync(newReport);
      toast.success("Report created successfully");
      setIsCreateOpen(false);
      setNewReport({
        name: "",
        description: "",
        metrics: ["clicks", "impressions", "ctr"],
        dimensions: ["campaign", "date"],
        date_range: "LAST_30_DAYS",
      });
    } catch {
      toast.error("Failed to create report");
    }
  };

  const handleDelete = async (reportId: string) => {
    try {
      await deleteMutation.mutateAsync(reportId);
      toast.success("Report deleted");
    } catch {
      toast.error("Failed to delete report");
    }
  };

  const handleGenerate = async (report: CustomReport) => {
    try {
      const result = await generateMutation.mutateAsync({ reportId: report.id });
      toast.success(`Report generated: ${result.total_rows} rows in ${result.execution_time_ms}ms`);
    } catch {
      toast.error("Failed to generate report");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Custom Reports</h1>
          <p className="text-muted-foreground">
            Create and manage custom reports with your preferred metrics and dimensions
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Report
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Custom Report</DialogTitle>
              <DialogDescription>
                Define the metrics, dimensions, and date range for your report.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Report Name</Label>
                <Input
                  id="name"
                  value={newReport.name}
                  onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                  placeholder="My Report"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newReport.description}
                  onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                  placeholder="Optional description..."
                />
              </div>
              <div className="grid gap-2">
                <Label>Date Range</Label>
                <Select
                  value={newReport.date_range}
                  onValueChange={(value) =>
                    setNewReport({ ...newReport, date_range: value as DateRange })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_RANGES.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Report"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {reportsData?.reports && reportsData.reports.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reportsData.reports.map((report) => (
            <Card key={report.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{report.name}</CardTitle>
                  <CardDescription>
                    {report.description || "No description"}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleGenerate(report)}>
                      <Play className="mr-2 h-4 w-4" />
                      Run Report
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(report.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date Range:</span>
                    <span>{report.date_range.replace(/_/g, " ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Metrics:</span>
                    <span>{report.metrics.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dimensions:</span>
                    <span>{report.dimensions.length}</span>
                  </div>
                  {report.last_run_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Run:</span>
                      <span>{format(new Date(report.last_run_at), "MMM d, HH:mm")}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Reports Yet</h3>
            <p className="text-muted-foreground text-center max-w-sm mt-2">
              Create your first custom report to start analyzing your campaign data
              with the metrics and dimensions you need.
            </p>
            <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Report
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
