"use client";

import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminUser, UserRole, UserStatus } from "../types";

interface UsersTableProps {
  users: AdminUser[];
  isLoading?: boolean;
}

function getRoleBadgeVariant(role: UserRole) {
  return role === "admin" ? "default" : "secondary";
}

function getStatusBadgeVariant(status: UserStatus) {
  switch (status) {
    case "active":
      return "default";
    case "inactive":
      return "secondary";
    case "suspended":
      return "destructive";
    default:
      return "outline";
  }
}

function formatRole(role: UserRole): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function formatStatus(status: UserStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "Never";
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return "Invalid date";
  }
}

const SKELETON_ROWS = ["row-1", "row-2", "row-3", "row-4", "row-5"] as const;

function UsersTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Activated</TableHead>
          <TableHead>Last Login</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {SKELETON_ROWS.map((id) => (
          <TableRow key={id}>
            <TableCell>
              <Skeleton className="h-4 w-40" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-16" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-16" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-12" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-24" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function UsersTable({ users, isLoading }: UsersTableProps) {
  if (isLoading) {
    return <UsersTableSkeleton />;
  }

  if (users.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No users found</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Activated</TableHead>
          <TableHead>Last Login</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.email}</TableCell>
            <TableCell>{user.full_name ?? "-"}</TableCell>
            <TableCell>
              <Badge variant={getRoleBadgeVariant(user.role)}>{formatRole(user.role)}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(user.status)}>{formatStatus(user.status)}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={user.is_activated ? "default" : "destructive"}>
                {user.is_activated ? "Yes" : "No"}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(user.last_login_at)}
            </TableCell>
            <TableCell className="text-muted-foreground">{formatDate(user.created_at)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
