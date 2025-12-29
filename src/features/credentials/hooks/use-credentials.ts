import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { credentialsApi } from "../api/credentials-api";
import type {
  CreateCredentialRequest,
  RotateCredentialRequest,
  UpdateCredentialRequest,
} from "../types";

// Query keys
export const CREDENTIAL_KEYS = {
  all: ["credentials"] as const,
  list: () => [...CREDENTIAL_KEYS.all, "list"] as const,
  detail: (id: string) => [...CREDENTIAL_KEYS.all, id] as const,
  audit: (id: string) => [...CREDENTIAL_KEYS.all, id, "audit"] as const,
  resolved: () => [...CREDENTIAL_KEYS.all, "resolved"] as const,
};

// ==================== Credentials ====================

export function useCredentials() {
  return useQuery({
    queryKey: CREDENTIAL_KEYS.list(),
    queryFn: async () => {
      const response = await credentialsApi.list();
      return response.items;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCredential(id: string) {
  return useQuery({
    queryKey: CREDENTIAL_KEYS.detail(id),
    queryFn: () => credentialsApi.get(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useResolvedCredentials() {
  return useQuery({
    queryKey: CREDENTIAL_KEYS.resolved(),
    queryFn: credentialsApi.getResolved,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useCredentialAuditLog(id: string) {
  return useQuery({
    queryKey: CREDENTIAL_KEYS.audit(id),
    queryFn: () => credentialsApi.getAuditLog(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// ==================== Mutations ====================

export function useCreateCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCredentialRequest) => credentialsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CREDENTIAL_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: CREDENTIAL_KEYS.resolved() });
    },
  });
}

export function useUpdateCredential(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCredentialRequest) => credentialsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CREDENTIAL_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: CREDENTIAL_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: CREDENTIAL_KEYS.resolved() });
    },
  });
}

export function useDeleteCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => credentialsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CREDENTIAL_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: CREDENTIAL_KEYS.resolved() });
    },
  });
}

export function useValidateCredential() {
  return useMutation({
    mutationFn: (id: string) => credentialsApi.validate(id),
  });
}

export function useRotateCredential(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RotateCredentialRequest) => credentialsApi.rotate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CREDENTIAL_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: CREDENTIAL_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: CREDENTIAL_KEYS.audit(id) });
    },
  });
}
