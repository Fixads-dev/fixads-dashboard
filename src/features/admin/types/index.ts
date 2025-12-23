import type { UserRole, UserStatus } from "@/features/auth/types";

// Re-export for convenience
export type { UserRole, UserStatus };

/**
 * Admin user from API response (snake_case)
 */
export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  status: UserStatus;
  is_activated: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * GET /auth/v1/users response
 */
export interface UsersListResponse {
  users: AdminUser[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Query params for listing users
 */
export interface UsersListParams {
  skip?: number;
  limit?: number;
}

/**
 * Admin access requirements
 */
export const ADMIN_EMAIL_DOMAIN = "@fixads.xyz";

export function isAdminUser(user: {
  role?: string;
  status?: string;
  is_activated?: boolean;
  email: string;
}): boolean {
  return (
    user.role === "admin" &&
    user.status === "active" &&
    user.is_activated === true &&
    user.email.endsWith(ADMIN_EMAIL_DOMAIN)
  );
}
