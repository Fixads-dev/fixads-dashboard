"use client";

import { Check, Copy, Mail, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  type Invitation,
  type InvitationRole,
  useCreateInvitation,
} from "@/features/organizations";

const ROLE_OPTIONS: { value: InvitationRole; label: string; description: string }[] = [
  { value: "viewer", label: "Viewer", description: "Can view resources but not modify" },
  { value: "user", label: "User", description: "Can use features and view resources" },
  { value: "manager", label: "Manager", description: "Can manage members and settings" },
  { value: "admin", label: "Admin", description: "Full access except ownership transfer" },
];

interface InviteMemberDialogProps {
  orgId: string;
  orgName: string;
  trigger?: React.ReactNode;
}

export function InviteMemberDialog({ orgId, orgName, trigger }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InvitationRole>("user");
  const [createdInvitation, setCreatedInvitation] = useState<Invitation | null>(null);
  const [copied, setCopied] = useState(false);

  const { mutate: createInvitation, isPending } = useCreateInvitation(orgId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInvitation(
      { email, role },
      {
        onSuccess: (invitation) => {
          toast.success("Invitation sent");
          setCreatedInvitation(invitation);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to send invitation");
        },
      },
    );
  };

  const handleClose = () => {
    setOpen(false);
    // Reset form after dialog closes
    setTimeout(() => {
      setEmail("");
      setRole("user");
      setCreatedInvitation(null);
      setCopied(false);
    }, 200);
  };

  const inviteLink = createdInvitation
    ? `${window.location.origin}/invite/${createdInvitation.id}`
    : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => (isOpen ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        {createdInvitation ? (
          <>
            <DialogHeader>
              <DialogTitle>Invitation Sent</DialogTitle>
              <DialogDescription>
                An invitation has been sent to {createdInvitation.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Invitation sent to:</span>
                </div>
                <p className="mt-1 font-medium">{createdInvitation.email}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Role: <span className="capitalize">{createdInvitation.role}</span>
                </p>
              </div>
              <div className="space-y-2">
                <Label>Or share this invite link</Label>
                <div className="flex gap-2">
                  <Input value={inviteLink} readOnly className="font-mono text-sm" />
                  <Button variant="outline" size="icon" onClick={handleCopyLink}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span className="sr-only">Copy invite link</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">This link expires in 7 days</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setCreatedInvitation(null);
                  setEmail("");
                }}
              >
                Invite Another
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Invite Member</DialogTitle>
              <DialogDescription>
                Invite a new member to {orgName}. They will receive an email with instructions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as InvitationRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || !email}>
                {isPending ? "Sending..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
