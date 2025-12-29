import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { organizationsApi } from "../api/organizations-api";
import type {
  CreateOrganizationRequest,
  InviteMemberRequest,
  UpdateMemberRoleRequest,
  UpdateOrganizationRequest,
} from "../types";

// Query keys
export const ORGANIZATION_KEYS = {
  all: ["organizations"] as const,
  list: () => [...ORGANIZATION_KEYS.all, "list"] as const,
  detail: (id: string) => [...ORGANIZATION_KEYS.all, id] as const,
  members: (id: string) => [...ORGANIZATION_KEYS.all, id, "members"] as const,
  subscription: (id: string) => [...ORGANIZATION_KEYS.all, id, "subscription"] as const,
  usage: (id: string) => [...ORGANIZATION_KEYS.all, id, "usage"] as const,
  tiers: ["subscription-tiers"] as const,
};

// ==================== Organizations ====================

export function useOrganizations() {
  return useQuery({
    queryKey: ORGANIZATION_KEYS.list(),
    queryFn: organizationsApi.list,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useOrganization(orgId: string) {
  return useQuery({
    queryKey: ORGANIZATION_KEYS.detail(orgId),
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
      queryClient.invalidateQueries({ queryKey: ORGANIZATION_KEYS.list() });
    },
  });
}

export function useUpdateOrganization(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateOrganizationRequest) => organizationsApi.update(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORGANIZATION_KEYS.detail(orgId) });
      queryClient.invalidateQueries({ queryKey: ORGANIZATION_KEYS.list() });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orgId: string) => organizationsApi.delete(orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORGANIZATION_KEYS.list() });
    },
  });
}

// ==================== Members ====================

export function useOrganizationMembers(orgId: string) {
  return useQuery({
    queryKey: ORGANIZATION_KEYS.members(orgId),
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
      queryClient.invalidateQueries({ queryKey: ORGANIZATION_KEYS.members(orgId) });
    },
  });
}

export function useUpdateMemberRole(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateMemberRoleRequest }) =>
      organizationsApi.updateMemberRole(orgId, userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORGANIZATION_KEYS.members(orgId) });
    },
  });
}

export function useRemoveMember(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => organizationsApi.removeMember(orgId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORGANIZATION_KEYS.members(orgId) });
    },
  });
}

export function useLeaveOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orgId: string) => organizationsApi.leave(orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORGANIZATION_KEYS.list() });
    },
  });
}

// ==================== Subscriptions ====================

export function useSubscriptionTiers() {
  return useQuery({
    queryKey: ORGANIZATION_KEYS.tiers,
    queryFn: organizationsApi.listTiers,
    staleTime: 10 * 60 * 1000, // 10 minutes (tiers rarely change)
  });
}

export function useOrganizationSubscription(orgId: string) {
  return useQuery({
    queryKey: ORGANIZATION_KEYS.subscription(orgId),
    queryFn: () => organizationsApi.getSubscription(orgId),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubscriptionUsage(orgId: string) {
  return useQuery({
    queryKey: ORGANIZATION_KEYS.usage(orgId),
    queryFn: () => organizationsApi.getUsage(orgId),
    enabled: !!orgId,
    staleTime: 60 * 1000, // 1 minute (usage changes frequently)
  });
}
