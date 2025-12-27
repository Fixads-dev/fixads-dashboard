"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, Plus, Trash2, Edit, MoreHorizontal, Star, StarOff } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  useDashboards,
  useCreateDashboard,
  useDeleteDashboard,
  useUpdateDashboard,
} from "@/features/dashboards";
import type { CreateDashboardRequest, Dashboard } from "@/features/dashboards";
import { format } from "date-fns";
import { toast } from "sonner";

export function DashboardsContent() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDashboard, setNewDashboard] = useState<CreateDashboardRequest>({
    name: "",
    description: "",
    is_default: false,
  });

  const { data: dashboardsData, isLoading } = useDashboards();
  const createMutation = useCreateDashboard();
  const deleteMutation = useDeleteDashboard();
  const updateMutation = useUpdateDashboard();

  const handleCreate = async () => {
    if (!newDashboard.name.trim()) {
      toast.error("Dashboard name is required");
      return;
    }

    try {
      await createMutation.mutateAsync(newDashboard);
      toast.success("Dashboard created successfully");
      setIsCreateOpen(false);
      setNewDashboard({
        name: "",
        description: "",
        is_default: false,
      });
    } catch {
      toast.error("Failed to create dashboard");
    }
  };

  const handleDelete = async (dashboardId: string) => {
    try {
      await deleteMutation.mutateAsync(dashboardId);
      toast.success("Dashboard deleted");
    } catch {
      toast.error("Failed to delete dashboard");
    }
  };

  const handleSetDefault = async (dashboard: Dashboard) => {
    try {
      await updateMutation.mutateAsync({
        dashboardId: dashboard.id,
        data: { is_default: !dashboard.is_default },
      });
      toast.success(dashboard.is_default ? "Removed as default" : "Set as default");
    } catch {
      toast.error("Failed to update dashboard");
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboards</h1>
          <p className="text-muted-foreground">
            Create custom dashboards with widgets to visualize your campaign data
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Dashboard
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Dashboard</DialogTitle>
              <DialogDescription>
                Create a new dashboard to organize your campaign metrics.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Dashboard Name</Label>
                <Input
                  id="name"
                  value={newDashboard.name}
                  onChange={(e) => setNewDashboard({ ...newDashboard, name: e.target.value })}
                  placeholder="My Dashboard"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newDashboard.description}
                  onChange={(e) =>
                    setNewDashboard({ ...newDashboard, description: e.target.value })
                  }
                  placeholder="Optional description..."
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="default">Set as Default</Label>
                  <p className="text-sm text-muted-foreground">
                    Show this dashboard on the home page
                  </p>
                </div>
                <Switch
                  id="default"
                  checked={newDashboard.is_default}
                  onCheckedChange={(checked) =>
                    setNewDashboard({ ...newDashboard, is_default: checked })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Dashboard"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {dashboardsData?.dashboards && dashboardsData.dashboards.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dashboardsData.dashboards.map((dashboard) => (
            <Card key={dashboard.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                    {dashboard.is_default && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Default
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    {dashboard.description || "No description"}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleSetDefault(dashboard)}>
                      {dashboard.is_default ? (
                        <>
                          <StarOff className="mr-2 h-4 w-4" />
                          Remove as Default
                        </>
                      ) : (
                        <>
                          <Star className="mr-2 h-4 w-4" />
                          Set as Default
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboards/${dashboard.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(dashboard.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <Link href={`/dashboards/${dashboard.id}`} className="block">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Widgets:</span>
                      <span>{dashboard.widgets?.length ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{format(new Date(dashboard.created_at), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Updated:</span>
                      <span>{format(new Date(dashboard.updated_at), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LayoutGrid className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Dashboards Yet</h3>
            <p className="text-muted-foreground text-center max-w-sm mt-2">
              Create your first dashboard to start building custom views of your
              campaign performance data.
            </p>
            <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Dashboard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
