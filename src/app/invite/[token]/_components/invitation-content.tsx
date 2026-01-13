"use client";

import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Loader2,
  Mail,
  Shield,
  UserPlus,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/features/auth";
import {
  type Invitation,
  useAcceptInvitation,
  useInvitationByToken,
} from "@/features/organizations";

interface InvitationContentProps {
  token: string;
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">{children}</div>
  );
}

function LoadingState() {
  return (
    <PageWrapper>
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Loading invitation...</p>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

function ErrorState({ error }: { error: Error | null }) {
  const is404 = error?.message?.includes("404") || error?.message?.includes("not found");
  const is410 = error?.message?.includes("410") || error?.message?.includes("expired");

  let title = "Invalid Invitation";
  let description = "There was an error loading this invitation.";

  if (is410) {
    title = "Invitation Expired";
    description = "This invitation has expired and is no longer valid.";
  } else if (is404) {
    title = "Invitation Not Found";
    description = "The invitation you're looking for doesn't exist.";
  }

  return (
    <PageWrapper>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/login">Go to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </PageWrapper>
  );
}

function AcceptedState() {
  return (
    <PageWrapper>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Invitation Already Accepted</CardTitle>
          <CardDescription>This invitation has already been accepted.</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/accounts">Go to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </PageWrapper>
  );
}

function ExpiredOrRevokedState({ isRevoked }: { isRevoked: boolean }) {
  return (
    <PageWrapper>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>{isRevoked ? "Invitation Revoked" : "Invitation Expired"}</CardTitle>
          <CardDescription>
            {isRevoked
              ? "This invitation has been revoked by the organization admin."
              : "This invitation has expired and is no longer valid."}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button asChild variant="outline">
            <Link href="/login">Go to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </PageWrapper>
  );
}

function InvitationDetails({ invitation }: { invitation: Invitation }) {
  return (
    <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Building2 className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-xs text-muted-foreground">Organization</p>
          <p className="font-medium">{invitation.organization_name ?? "Organization"}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Shield className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-xs text-muted-foreground">Role</p>
          <p className="font-medium capitalize">{invitation.role}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Mail className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-xs text-muted-foreground">Invited Email</p>
          <p className="font-medium">{invitation.email}</p>
        </div>
      </div>
      {invitation.invited_by_name && (
        <div className="flex items-center gap-3">
          <UserPlus className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Invited By</p>
            <p className="font-medium">{invitation.invited_by_name}</p>
          </div>
        </div>
      )}
      <div className="flex items-center gap-3">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-xs text-muted-foreground">Expires</p>
          <p className="font-medium">
            {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}

interface PendingInvitationStateProps {
  invitation: Invitation;
  token: string;
}

function PendingInvitationState({ invitation, token }: PendingInvitationStateProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { mutate: acceptInvitation, isPending: isAccepting } = useAcceptInvitation();

  const emailMatches = user?.email?.toLowerCase() === invitation.email.toLowerCase();

  const handleAccept = () => {
    acceptInvitation(token, {
      onSuccess: (data) => {
        router.push(`/accounts?org=${data.organization_id}`);
      },
    });
  };

  const handleLogin = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("invite_redirect", window.location.pathname);
    }
    router.push("/login");
  };

  const handleLogout = () => {
    useAuthStore.getState().logout();
  };

  return (
    <PageWrapper>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>You're Invited!</CardTitle>
          <CardDescription>You've been invited to join an organization on Fixads</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <InvitationDetails invitation={invitation} />
          {isAuthenticated && !emailMatches && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Email Mismatch</AlertTitle>
              <AlertDescription>
                You're signed in as <strong>{user?.email}</strong>, but this invitation was sent to{" "}
                <strong>{invitation.email}</strong>. Please sign in with the correct account.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {isAuthenticated ? (
            emailMatches ? (
              <Button className="w-full" onClick={handleAccept} disabled={isAccepting}>
                {isAccepting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Accept Invitation
                  </>
                )}
              </Button>
            ) : (
              <Button className="w-full" variant="outline" onClick={handleLogout}>
                Sign Out & Use Correct Account
              </Button>
            )
          ) : (
            <Button className="w-full" onClick={handleLogin}>
              Sign In to Accept
            </Button>
          )}
        </CardFooter>
      </Card>
    </PageWrapper>
  );
}

export function InvitationContent({ token }: InvitationContentProps) {
  const { isLoading: isAuthLoading } = useAuthStore();
  const { data: invitation, isLoading, error } = useInvitationByToken(token);

  if (isLoading || isAuthLoading) {
    return <LoadingState />;
  }

  if (error || !invitation) {
    return <ErrorState error={error} />;
  }

  const isExpired = invitation.status === "expired" || new Date(invitation.expires_at) < new Date();
  const isRevoked = invitation.status === "revoked";
  const isAccepted = invitation.status === "accepted";

  if (isAccepted) {
    return <AcceptedState />;
  }

  if (isExpired || isRevoked) {
    return <ExpiredOrRevokedState isRevoked={isRevoked} />;
  }

  return <PendingInvitationState invitation={invitation} token={token} />;
}
