"use client";

import { useState } from "react";
import { Building2, Crown, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateOrganization,
  useOrganizations,
  useOrganizationSubscription,
  type OrganizationRole,
  type OrganizationWithRole,
} from "@/features/organizations";

const ROLE_COLORS: Record<OrganizationRole, string> = {
  owner: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  manager: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  user: "bg-green-500/10 text-green-600 dark:text-green-400",
  viewer: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
};

function OrganizationCard({ org }: { org: OrganizationWithRole }) {
  const { data: subscription } = useOrganizationSubscription(org.id);

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{org.name}</p>
            {org.role === "owner" && (
              <Crown className="h-3.5 w-3.5 text-amber-500" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">@{org.slug}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {subscription && (
          <Badge variant="outline" className="capitalize">
            {subscription.tier.display_name}
          </Badge>
        )}
        <Badge className={ROLE_COLORS[org.role]}>{org.role}</Badge>
      </div>
    </div>
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
      }
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
          .replace(/^-|-$/g, "")
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
  const organizations = data?.items ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Organizations
          </CardTitle>
          <CardDescription>
            Manage your organizations and team members
          </CardDescription>
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
            <p className="mt-2 text-sm text-muted-foreground">
              No organizations yet
            </p>
            <p className="text-xs text-muted-foreground">
              Create one to collaborate with your team
            </p>
          </div>
        ) : (
          organizations.map((org) => (
            <OrganizationCard key={org.id} org={org} />
          ))
        )}
      </CardContent>
    </Card>
  );
}
