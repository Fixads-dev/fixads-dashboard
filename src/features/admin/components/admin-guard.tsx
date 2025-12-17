"use client";

import { Loader2, ShieldX } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { ROUTES } from "@/shared/lib/constants";
import { ADMIN_EMAIL_DOMAIN, isAdminUser } from "../types";

interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Client-side admin guard that validates:
 * - User is authenticated
 * - User has ADMIN role
 * - User has ACTIVE status
 * - User is activated
 * - User email is from @fixads.xyz domain
 */
export function AdminGuard({ children, fallback }: AdminGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [hasChecked, setHasChecked] = useState(false);

  const hasAdminAccess = user && isAdminUser(user);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace(ROUTES.LOGIN);
      } else if (!hasAdminAccess) {
        setHasChecked(true);
      }
    }
  }, [isAuthenticated, isLoading, hasAdminAccess, router]);

  if (isLoading) {
    return (
      fallback ?? (
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!hasAdminAccess && hasChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <ShieldX className="h-16 w-16 mx-auto text-destructive" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground max-w-md">
            You don&apos;t have permission to access the admin panel.
          </p>
          <p className="text-sm text-muted-foreground">Admin access requires:</p>
          <ul className="text-sm text-muted-foreground list-disc list-inside">
            <li>ADMIN role</li>
            <li>ACTIVE status</li>
            <li>Activated account</li>
            <li>Email from {ADMIN_EMAIL_DOMAIN} domain</li>
          </ul>
        </div>
      </div>
    );
  }

  if (!hasAdminAccess) {
    return (
      fallback ?? (
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    );
  }

  return <>{children}</>;
}
