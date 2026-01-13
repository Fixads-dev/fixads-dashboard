"use client";

import {
  Building2,
  ChevronDown,
  ChevronUp,
  Crown,
  LogOut,
  MoreVertical,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/features/auth";
import {
  type Organization,
  useCreateOrganization,
  useDeleteOrganization,
  useLeaveOrganization,
  useOrganizationSubscription,
  useOrganizations,
} from "@/features/organizations";
import { PendingInvitations } from "./pending-invitations";

function OrganizationCard({ org }: { org: Organization }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const { user } = useAuthStore();
  const { data: subscription } = useOrganizationSubscription(org.id);
  const { mutate: deleteOrg, isPending: isDeleting } = useDeleteOrganization();
  const { mutate: leaveOrg, isPending: isLeaving } = useLeaveOrganization();

  // Determine ownership by comparing user ID with owner_id
  const isOwner = user?.id === org.owner_id;
  // For now, only owners can manage invitations (until API returns role info)
  const canManageInvitations = isOwner;

  const handleDelete = () => {
    deleteOrg(org.id, {
      onSuccess: () => {
        toast.success("Organization deleted");
        setShowDeleteDialog(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete organization");
      },
    });
  };

  const handleLeave = () => {
    leaveOrg(org.id, {
      onSuccess: () => {
        toast.success("Left organization");
        setShowLeaveDialog(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to leave organization");
      },
    });
  };

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="rounded-lg border">
          <div className="flex items-center justify-between p-4">
            <CollapsibleTrigger asChild disabled={!canManageInvitations}>
              <div
                className={`flex flex-1 items-center gap-3 ${canManageInvitations ? "cursor-pointer" : ""}`}
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{org.name}</p>
                    {isOwner && <Crown className="h-3.5 w-3.5 text-amber-500" />}
                  </div>
                  <p className="text-sm text-muted-foreground">@{org.slug}</p>
                </div>
              </div>
            </CollapsibleTrigger>
            <div className="flex items-center gap-2">
              {subscription && (
                <Badge variant="outline" className="capitalize">
                  {subscription.tier.display_name}
                </Badge>
              )}
              {isOwner && (
                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400">owner</Badge>
              )}
              {canManageInvitations &&
                (isOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ))}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isOwner ? (
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Organization
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => setShowLeaveDialog(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Leave Organization
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {canManageInvitations && (
            <CollapsibleContent>
              <div className="border-t p-4">
                <PendingInvitations orgId={org.id} orgName={org.name} />
              </div>
            </CollapsibleContent>
          )}
        </div>
      </Collapsible>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Organization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{org.name}</strong>? This action cannot be
              undone. All members will be removed and all associated data will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Organization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave <strong>{org.name}</strong>? You will lose access to
              all resources associated with this organization.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLeaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeave}
              disabled={isLeaving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLeaving ? "Leaving..." : "Leave"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function CreateOrganizationDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const { mutate: create, isPending } = useCreateOrganization();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create(
      { name, slug: slug || undefined },
      {
        onSuccess: () => {
          toast.success("Organization created");
          setOpen(false);
          setName("");
          setSlug("");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create organization");
        },
      },
    );
  };

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    if (!slug) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Organization
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>
              Create a new organization to manage team members and share resources.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="My Company"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-company"
              />
              <p className="text-xs text-muted-foreground">
                Used in URLs. Auto-generated from name if left empty.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function OrganizationsSection() {
  const { data, isLoading } = useOrganizations();
  const organizations = data?.organizations ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Organizations
          </CardTitle>
          <CardDescription>Manage your organizations and team members</CardDescription>
        </div>
        <CreateOrganizationDialog />
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-[72px] w-full" />
            <Skeleton className="h-[72px] w-full" />
          </>
        ) : organizations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">No organizations yet</p>
            <p className="text-xs text-muted-foreground">
              Create one to collaborate with your team
            </p>
          </div>
        ) : (
          organizations.map((org) => <OrganizationCard key={org.id} org={org} />)
        )}
      </CardContent>
    </Card>
  );
}
