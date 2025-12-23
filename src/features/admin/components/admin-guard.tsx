"use client";

import { Loader2, ShieldX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { Button } from "@/components/ui/button";
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

  const hasAdminAccess = user && isAdminUser(user);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      fallback ?? (
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    );
  }

  // Unauthenticated - will redirect, show nothing
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated but no admin access - show access denied with navigation
  if (!hasAdminAccess) {
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
          <Button asChild className="mt-4">
            <Link href={ROUTES.HOME}>Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
