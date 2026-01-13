"use client";

import {
  Building2,
  CheckCircle2,
  Key,
  MoreVertical,
  Plus,
  Shield,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  CREDENTIAL_PLATFORM_LABELS,
  CREDENTIAL_TYPE_DESCRIPTIONS,
  CREDENTIAL_TYPE_LABELS,
  type Credential,
  type CredentialPlatform,
  type CredentialScope,
  type CredentialType,
  useCreateCredential,
  useCredentials,
  useDeleteCredential,
  useValidateCredential,
} from "@/features/credentials";
import { useOrganizations } from "@/features/organizations";
import { formatDate } from "@/shared/lib/format";

const SCOPE_COLORS: Record<CredentialScope, string> = {
  PLATFORM: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  ORGANIZATION: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  USER: "bg-green-500/10 text-green-600 dark:text-green-400",
};

function CredentialCard({ credential }: { credential: Credential }) {
  const { mutate: validate, isPending: isValidating } = useValidateCredential();
  const { mutate: deleteCredential, isPending: isDeleting } = useDeleteCredential();

  // Backward compatibility: default can_edit to true if not present
  const canEdit = credential.can_edit ?? true;
  // Backward compatibility: use last_validated_at or validated_at
  const validatedAt = credential.last_validated_at ?? credential.validated_at;

  const handleValidate = () => {
    validate(credential.id, {
      onSuccess: (result) => {
        if (result.valid) {
          toast.success("Credential is valid");
        } else {
          toast.error(result.message || "Credential validation failed");
        }
      },
      onError: (error) => {
        toast.error(error.message || "Failed to validate credential");
      },
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this credential?")) {
      deleteCredential(credential.id, {
        onSuccess: () => {
          toast.success("Credential deleted");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to delete credential");
        },
      });
    }
  };

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Key className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{credential.name}</p>
            {credential.is_validated ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : credential.validation_error ? (
              <Tooltip>
                <TooltipTrigger>
                  <XCircle className="h-4 w-4 text-destructive" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{credential.validation_error}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{CREDENTIAL_TYPE_LABELS[credential.credential_type]}</span>
            {credential.platform && (
              <>
                <span>·</span>
                <span>{CREDENTIAL_PLATFORM_LABELS[credential.platform]}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={SCOPE_COLORS[credential.scope]}>
          {credential.scope === "USER"
            ? "Personal"
            : credential.scope === "ORGANIZATION"
              ? "Org"
              : "Platform"}
        </Badge>
        {credential.scope === "ORGANIZATION" && credential.organization_id && (
          <Tooltip>
            <TooltipTrigger>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Shared with organization</p>
            </TooltipContent>
          </Tooltip>
        )}
        {validatedAt && (
          <span className="text-xs text-muted-foreground">
            Validated {formatDate(validatedAt, "MMM d")}
          </span>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!canEdit}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleValidate} disabled={isValidating}>
              <Shield className="mr-2 h-4 w-4" />
              {isValidating ? "Validating..." : "Validate"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isDeleting || !canEdit}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function CreateCredentialDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [credentialType, setCredentialType] = useState<CredentialType>("GEMINI_API_KEY");
  const [scope, setScope] = useState<CredentialScope>("USER");
  const [platform, setPlatform] = useState<CredentialPlatform>("GOOGLE_ADS");

  const { mutate: create, isPending } = useCreateCredential();
  const { data: organizationsData } = useOrganizations();

  // Check if user has any organizations (with defensive check for items)
  const hasOrganization = organizationsData?.items && organizationsData.items.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create(
      {
        name,
        value,
        credential_type: credentialType,
        scope,
        platform,
      },
      {
        onSuccess: () => {
          toast.success("Credential created");
          setOpen(false);
          resetForm();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create credential");
        },
      },
    );
  };

  const resetForm = () => {
    setName("");
    setValue("");
    setCredentialType("GEMINI_API_KEY");
    setScope("USER");
    setPlatform("GOOGLE_ADS");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Credential
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add API Credential</DialogTitle>
            <DialogDescription>
              Add your own API keys for Google Ads or Gemini AI.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Credential Type</Label>
              <Select
                value={credentialType}
                onValueChange={(v) => setCredentialType(v as CredentialType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CREDENTIAL_TYPE_LABELS) as CredentialType[]).map((type) => (
                    <SelectItem key={type} value={type}>
                      {CREDENTIAL_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {CREDENTIAL_TYPE_DESCRIPTIONS[credentialType]}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={platform} onValueChange={(v) => setPlatform(v as CredentialPlatform)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CREDENTIAL_PLATFORM_LABELS) as CredentialPlatform[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {CREDENTIAL_PLATFORM_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="scope">Scope</Label>
              <Select value={scope} onValueChange={(v) => setScope(v as CredentialScope)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Personal (only you)</SelectItem>
                  <SelectItem value="ORGANIZATION" disabled={!hasOrganization}>
                    Organization (shared with team)
                    {!hasOrganization && " - Join an org first"}
                  </SelectItem>
                </SelectContent>
              </Select>
              {!hasOrganization && scope === "USER" && (
                <p className="text-xs text-muted-foreground">
                  Join an organization to share credentials with your team.
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My API Key"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="value">API Key / Secret</Label>
              <Input
                id="value"
                type="password"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter your API key"
                required
              />
              <p className="text-xs text-muted-foreground">
                Your credential is encrypted and stored securely.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name || !value}>
              {isPending ? "Creating..." : "Add Credential"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CredentialsSection() {
  const { data: credentials, isLoading } = useCredentials();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Credentials
          </CardTitle>
          <CardDescription>Manage your API keys for Google Ads and AI services</CardDescription>
        </div>
        <CreateCredentialDialog />
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-[72px] w-full" />
            <Skeleton className="h-[72px] w-full" />
          </>
        ) : !credentials || credentials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Key className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">No credentials configured</p>
            <p className="text-xs text-muted-foreground">
              Add your own API keys to use with the platform
            </p>
          </div>
        ) : (
          credentials.map((credential) => (
            <CredentialCard key={credential.id} credential={credential} />
          ))
        )}
      </CardContent>
    </Card>
  );
}
