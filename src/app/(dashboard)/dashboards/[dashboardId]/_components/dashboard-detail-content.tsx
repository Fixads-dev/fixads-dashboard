"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Settings,
  BarChart3,
  LineChart,
  Loader2,
  PieChart,
  Table2,
  Grid3X3,
  CreditCard,
  Trash2,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useDashboard,
  useAddWidget,
  useRemoveWidget,
} from "@/features/dashboards";
import type { CreateWidgetRequest, DashboardWidget, WidgetType } from "@/features/dashboards";
import { toast } from "sonner";

interface Props {
  dashboardId: string;
}

const WIDGET_TYPES: { value: WidgetType; label: string; icon: typeof BarChart3 }[] = [
  { value: "METRIC_CARD", label: "Metric Card", icon: CreditCard },
  { value: "LINE_CHART", label: "Line Chart", icon: LineChart },
  { value: "BAR_CHART", label: "Bar Chart", icon: BarChart3 },
  { value: "PIE_CHART", label: "Pie Chart", icon: PieChart },
  { value: "TABLE", label: "Data Table", icon: Table2 },
  { value: "HEATMAP", label: "Heatmap", icon: Grid3X3 },
];

const AVAILABLE_METRICS = [
  { value: "clicks", label: "Clicks" },
  { value: "impressions", label: "Impressions" },
  { value: "ctr", label: "CTR" },
  { value: "cost", label: "Cost" },
  { value: "conversions", label: "Conversions" },
  { value: "conversions_value", label: "Conversion Value" },
  { value: "cost_per_conversion", label: "Cost per Conversion" },
  { value: "roas", label: "ROAS" },
];

export function DashboardDetailContent({ dashboardId }: Props) {
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [newWidget, setNewWidget] = useState<CreateWidgetRequest>({
    widget_type: "METRIC_CARD",
    title: "",
    config: {
      metric: "clicks",
      comparison: "PREVIOUS_PERIOD",
    },
    position: { x: 0, y: 0, w: 4, h: 2 },
  });

  const { data: dashboard, isLoading } = useDashboard(dashboardId);
  const addWidgetMutation = useAddWidget();
  const removeWidgetMutation = useRemoveWidget();

  const handleAddWidget = async () => {
    if (!newWidget.title.trim()) {
      toast.error("Widget title is required");
      return;
    }

    try {
      await addWidgetMutation.mutateAsync({
        dashboardId,
        data: newWidget,
      });
      toast.success("Widget added successfully");
      setIsAddWidgetOpen(false);
      setNewWidget({
        widget_type: "METRIC_CARD",
        title: "",
        config: {
          metric: "clicks",
          comparison: "PREVIOUS_PERIOD",
        },
        position: { x: 0, y: 0, w: 4, h: 2 },
      });
    } catch {
      toast.error("Failed to add widget");
    }
  };

  const handleRemoveWidget = async (widgetId: string) => {
    try {
      await removeWidgetMutation.mutateAsync({ dashboardId, widgetId });
      toast.success("Widget removed");
    } catch {
      toast.error("Failed to remove widget");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 motion-safe:animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground">Dashboard not found</p>
        <Button asChild className="mt-4">
          <Link href="/dashboards">Back to Dashboards</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboards">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to dashboards</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{dashboard.name}</h1>
            {dashboard.description && (
              <p className="text-muted-foreground">{dashboard.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddWidgetOpen} onOpenChange={setIsAddWidgetOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Widget
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Widget</DialogTitle>
                <DialogDescription>
                  Add a new widget to your dashboard.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Widget Title</Label>
                  <Input
                    id="title"
                    value={newWidget.title}
                    onChange={(e) => setNewWidget({ ...newWidget, title: e.target.value })}
                    placeholder="Total Clicks"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Widget Type</Label>
                  <Select
                    value={newWidget.widget_type}
                    onValueChange={(value) =>
                      setNewWidget({ ...newWidget, widget_type: value as WidgetType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WIDGET_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Metric</Label>
                  <Select
                    value={newWidget.config.metric as string}
                    onValueChange={(value) =>
                      setNewWidget({
                        ...newWidget,
                        config: { ...newWidget.config, metric: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_METRICS.map((metric) => (
                        <SelectItem key={metric.value} value={metric.value}>
                          {metric.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddWidgetOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddWidget} disabled={addWidgetMutation.isPending}>
                  {addWidgetMutation.isPending ? "Adding..." : "Add Widget"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Dashboard settings</span>
          </Button>
        </div>
      </div>

      {dashboard.widgets && dashboard.widgets.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dashboard.widgets.map((widget) => (
            <WidgetCard
              key={widget.id}
              widget={widget}
              onRemove={() => handleRemoveWidget(widget.id)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Grid3X3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Widgets Yet</h3>
            <p className="text-muted-foreground text-center max-w-sm mt-2">
              Add widgets to your dashboard to start visualizing your campaign data.
            </p>
            <Button className="mt-4" onClick={() => setIsAddWidgetOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Widget
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface WidgetCardProps {
  widget: DashboardWidget;
  onRemove: () => void;
}

function WidgetCard({ widget, onRemove }: WidgetCardProps) {
  const widgetType = WIDGET_TYPES.find((t) => t.value === widget.widget_type);
  const Icon = widgetType?.icon ?? BarChart3;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
          <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remove widget</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-24 bg-muted/50 rounded-md">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Icon className="h-8 w-8" />
            <span className="text-xs">{widgetType?.label ?? widget.widget_type}</span>
          </div>
        </div>
        <CardDescription className="mt-2 text-xs">
          Metric: {widget.config.metric ?? "N/A"}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
