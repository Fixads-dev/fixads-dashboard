import { apiMethods } from "@/shared/api";
import type {
  CreateOrganizationRequest,
  InviteMemberRequest,
  MemberListResponse,
  Organization,
  OrganizationListResponse,
  OrganizationMember,
  Subscription,
  SubscriptionTier,
  SubscriptionTierListResponse,
  SubscriptionUsage,
  UpdateMemberRoleRequest,
  UpdateOrganizationRequest,
} from "../types";

const AUTH_PATH = "auth/v1";

export const organizationsApi = {
  // ==================== Organizations ====================

  /**
   * Create a new organization
   * POST /auth/v1/organizations
   */
  create: (data: CreateOrganizationRequest) =>
    apiMethods.post<Organization>(`${AUTH_PATH}/organizations`, data),

  /**
   * List user's organizations
   * GET /auth/v1/organizations
   */
  list: () => apiMethods.get<OrganizationListResponse>(`${AUTH_PATH}/organizations`),

  /**
   * Get organization by ID
   * GET /auth/v1/organizations/{orgId}
   */
  get: (orgId: string) => apiMethods.get<Organization>(`${AUTH_PATH}/organizations/${orgId}`),

  /**
   * Update organization
   * PATCH /auth/v1/organizations/{orgId}
   */
  update: (orgId: string, data: UpdateOrganizationRequest) =>
    apiMethods.patch<Organization>(`${AUTH_PATH}/organizations/${orgId}`, data),

  /**
   * Delete organization
   * DELETE /auth/v1/organizations/{orgId}
   */
  delete: (orgId: string) => apiMethods.delete<void>(`${AUTH_PATH}/organizations/${orgId}`),

  // ==================== Members ====================

  /**
   * List organization members
   * GET /auth/v1/organizations/{orgId}/members
   */
  listMembers: (orgId: string) =>
    apiMethods.get<MemberListResponse>(`${AUTH_PATH}/organizations/${orgId}/members`),

  /**
   * Invite member to organization
   * POST /auth/v1/organizations/{orgId}/members
   */
  inviteMember: (orgId: string, data: InviteMemberRequest) =>
    apiMethods.post<OrganizationMember>(`${AUTH_PATH}/organizations/${orgId}/members`, data),

  /**
   * Update member role
   * PATCH /auth/v1/organizations/{orgId}/members/{userId}
   */
  updateMemberRole: (orgId: string, userId: string, data: UpdateMemberRoleRequest) =>
    apiMethods.patch<OrganizationMember>(
      `${AUTH_PATH}/organizations/${orgId}/members/${userId}`,
      data,
    ),

  /**
   * Remove member from organization
   * DELETE /auth/v1/organizations/{orgId}/members/{userId}
   */
  removeMember: (orgId: string, userId: string) =>
    apiMethods.delete<void>(`${AUTH_PATH}/organizations/${orgId}/members/${userId}`),

  /**
   * Leave organization
   * POST /auth/v1/organizations/{orgId}/leave
   */
  leave: (orgId: string) => apiMethods.post<void>(`${AUTH_PATH}/organizations/${orgId}/leave`),

  /**
   * Transfer ownership
   * POST /auth/v1/organizations/{orgId}/transfer-ownership
   */
  transferOwnership: (orgId: string, newOwnerId: string) =>
    apiMethods.post<Organization>(`${AUTH_PATH}/organizations/${orgId}/transfer-ownership`, {
      new_owner_id: newOwnerId,
    }),

  // ==================== Subscriptions ====================

  /**
   * List available subscription tiers
   * GET /auth/v1/subscriptions/tiers
   */
  listTiers: () => apiMethods.get<SubscriptionTierListResponse>(`${AUTH_PATH}/subscriptions/tiers`),

  /**
   * Get subscription tier by name
   * GET /auth/v1/subscriptions/tiers/{tierName}
   */
  getTier: (tierName: string) =>
    apiMethods.get<SubscriptionTier>(`${AUTH_PATH}/subscriptions/tiers/${tierName}`),

  /**
   * Get organization subscription
   * GET /auth/v1/organizations/{orgId}/subscription
   */
  getSubscription: (orgId: string) =>
    apiMethods.get<Subscription>(`${AUTH_PATH}/organizations/${orgId}/subscription`),

  /**
   * Get subscription usage
   * GET /auth/v1/organizations/{orgId}/subscription/usage
   */
  getUsage: (orgId: string) =>
    apiMethods.get<SubscriptionUsage[]>(`${AUTH_PATH}/organizations/${orgId}/subscription/usage`),
};
