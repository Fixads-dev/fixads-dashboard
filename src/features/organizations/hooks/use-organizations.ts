import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/lib/constants";
import { organizationsApi } from "../api/organizations-api";
import type {
  CreateInvitationRequest,
  CreateOrganizationRequest,
  InviteMemberRequest,
  UpdateMemberRoleRequest,
  UpdateOrganizationRequest,
} from "../types";

/**
 * @deprecated Use QUERY_KEYS.ORGANIZATIONS from @/shared/lib/constants instead
 */
export const ORGANIZATION_KEYS = QUERY_KEYS.ORGANIZATIONS;

// ==================== Organizations ====================

export function useOrganizations() {
  return useQuery({
    queryKey: QUERY_KEYS.ORGANIZATIONS.list(),
    queryFn: organizationsApi.list,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useOrganization(orgId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ORGANIZATIONS.detail(orgId),
    queryFn: () => organizationsApi.get(orgId),
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrganizationRequest) => organizationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORGANIZATIONS.list() });
    },
  });
}

export function useUpdateOrganization(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateOrganizationRequest) => organizationsApi.update(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORGANIZATIONS.detail(orgId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORGANIZATIONS.list() });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orgId: string) => organizationsApi.delete(orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORGANIZATIONS.list() });
    },
  });
}

// ==================== Members ====================

export function useOrganizationMembers(orgId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ORGANIZATIONS.members(orgId),
    queryFn: () => organizationsApi.listMembers(orgId),
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useInviteMember(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteMemberRequest) => organizationsApi.inviteMember(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORGANIZATIONS.members(orgId) });
    },
  });
}

export function useUpdateMemberRole(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateMemberRoleRequest }) =>
      organizationsApi.updateMemberRole(orgId, userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORGANIZATIONS.members(orgId) });
    },
  });
}

export function useRemoveMember(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => organizationsApi.removeMember(orgId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORGANIZATIONS.members(orgId) });
    },
  });
}

export function useLeaveOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orgId: string) => organizationsApi.leave(orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORGANIZATIONS.list() });
    },
  });
}

// ==================== Invitations ====================

export function useOrganizationInvitations(orgId: string, includeExpired = false) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ORGANIZATIONS.invitations(orgId), { includeExpired }],
    queryFn: () => organizationsApi.listInvitations(orgId, includeExpired),
    enabled: !!orgId,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useInvitationByToken(token: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ORGANIZATIONS.invitation(token),
    queryFn: () => organizationsApi.getInvitationByToken(token),
    enabled: !!token,
    staleTime: 30 * 1000, // 30 seconds
    retry: false, // Don't retry on 404/410 errors
  });
}

export function useCreateInvitation(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvitationRequest) => organizationsApi.createInvitation(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORGANIZATIONS.invitations(orgId) });
    },
  });
}

export function useRevokeInvitation(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) => organizationsApi.revokeInvitation(orgId, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORGANIZATIONS.invitations(orgId) });
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => organizationsApi.acceptInvitation(token),
    onSuccess: () => {
      // Invalidate organizations list to show the new org
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORGANIZATIONS.list() });
    },
  });
}

// ==================== Subscriptions ====================

export function useSubscriptionTiers() {
  return useQuery({
    queryKey: QUERY_KEYS.ORGANIZATIONS.tiers,
    queryFn: organizationsApi.listTiers,
    staleTime: 10 * 60 * 1000, // 10 minutes (tiers rarely change)
  });
}

export function useOrganizationSubscription(orgId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ORGANIZATIONS.subscription(orgId),
    queryFn: () => organizationsApi.getSubscription(orgId),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubscriptionUsage(orgId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ORGANIZATIONS.usage(orgId),
    queryFn: () => organizationsApi.getUsage(orgId),
    enabled: !!orgId,
    staleTime: 60 * 1000, // 1 minute (usage changes frequently)
  });
}
