/**
 * Organization role within an organization
 */
export type OrganizationRole = "owner" | "manager" | "user" | "viewer";

/**
 * Subscription status
 */
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing";

/**
 * Organization from API
 */
export interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Organization with user's role
 */
export interface OrganizationWithRole extends Organization {
  role: OrganizationRole;
}

/**
 * Organization member
 */
export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  joined_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
    picture?: string;
  };
}

/**
 * Subscription tier
 */
export interface SubscriptionTier {
  id: string;
  name: string;
  display_name: string;
  permissions: string[];
  features: Record<string, boolean>;
  limits: {
    connected_accounts: number;
    ai_runs_per_month: number;
    requests_per_day: number;
  };
  is_active: boolean;
}

/**
 * Organization subscription
 */
export interface Subscription {
  id: string;
  organization_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
}

/**
 * Subscription usage
 */
export interface SubscriptionUsage {
  metric_name: string;
  current_value: number;
  limit_value: number;
  period_start: string;
}

// Request/Response types

export interface CreateOrganizationRequest {
  name: string;
  slug?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  slug?: string;
}

export interface InviteMemberRequest {
  email: string;
  role: OrganizationRole;
}

export interface UpdateMemberRoleRequest {
  role: OrganizationRole;
}

export interface OrganizationListResponse {
  items: OrganizationWithRole[];
  total: number;
}

export interface MemberListResponse {
  items: OrganizationMember[];
  total: number;
}

export interface SubscriptionTierListResponse {
  items: SubscriptionTier[];
}
