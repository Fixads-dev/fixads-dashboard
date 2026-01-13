"use client";

import { formatDistanceToNow } from "date-fns";
import { Clock, Mail, MoreVertical, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type Invitation,
  type InvitationStatus,
  useOrganizationInvitations,
  useRevokeInvitation,
} from "@/features/organizations";
import { InviteMemberDialog } from "./invite-member-dialog";

const STATUS_COLORS: Record<InvitationStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  accepted: "bg-green-500/10 text-green-600 dark:text-green-400",
  expired: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  revoked: "bg-red-500/10 text-red-600 dark:text-red-400",
};

function InvitationRow({ invitation, orgId }: { invitation: Invitation; orgId: string }) {
  const { mutate: revoke, isPending: isRevoking } = useRevokeInvitation(orgId);

  const handleRevoke = () => {
    if (confirm("Are you sure you want to revoke this invitation?")) {
      revoke(invitation.id, {
        onSuccess: () => {
          toast.success("Invitation revoked");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to revoke invitation");
        },
      });
    }
  };

  const expiresAt = new Date(invitation.expires_at);
  const isExpired = expiresAt < new Date();

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          <Mail className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">{invitation.email}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="capitalize">{invitation.role}</span>
            <span>·</span>
            <Clock className="h-3 w-3" />
            <span>
              {isExpired
                ? `Expired ${formatDistanceToNow(expiresAt)} ago`
                : `Expires in ${formatDistanceToNow(expiresAt)}`}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={STATUS_COLORS[invitation.status]}>{invitation.status}</Badge>
        {invitation.status === "pending" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleRevoke}
                disabled={isRevoking}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isRevoking ? "Revoking..." : "Revoke"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

interface PendingInvitationsProps {
  orgId: string;
  orgName: string;
}

export function PendingInvitations({ orgId, orgName }: PendingInvitationsProps) {
  const { data, isLoading } = useOrganizationInvitations(orgId);
  const invitations = data?.invitations ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="h-4 w-4" />
            Pending Invitations
          </CardTitle>
          <CardDescription>Manage invitations to {orgName}</CardDescription>
        </div>
        <InviteMemberDialog orgId={orgId} orgName={orgName} />
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-[72px] w-full" />
            <Skeleton className="h-[72px] w-full" />
          </>
        ) : invitations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Mail className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">No pending invitations</p>
            <p className="text-xs text-muted-foreground">Invite team members to collaborate</p>
          </div>
        ) : (
          invitations.map((invitation) => (
            <InvitationRow key={invitation.id} invitation={invitation} orgId={orgId} />
          ))
        )}
      </CardContent>
    </Card>
  );
}
