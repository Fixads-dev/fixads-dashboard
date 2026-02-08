import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/lib/constants";
import { credentialsApi } from "../api/credentials-api";
import type {
  CreateCredentialRequest,
  RotateCredentialRequest,
  UpdateCredentialRequest,
} from "../types";

/** @deprecated Use QUERY_KEYS.CREDENTIALS from shared/lib/constants instead */
export const CREDENTIAL_KEYS = QUERY_KEYS.CREDENTIALS;

// ==================== Credentials ====================

export function useCredentials() {
  return useQuery({
    queryKey: QUERY_KEYS.CREDENTIALS.list(),
    queryFn: async () => {
      const response = await credentialsApi.list();
      return response.items;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCredential(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.CREDENTIALS.detail(id),
    queryFn: () => credentialsApi.get(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useResolvedCredentials() {
  return useQuery({
    queryKey: QUERY_KEYS.CREDENTIALS.resolved(),
    queryFn: credentialsApi.getResolved,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useCredentialAuditLog(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.CREDENTIALS.audit(id),
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CREDENTIALS.list() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CREDENTIALS.resolved() });
    },
  });
}

export function useUpdateCredential(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCredentialRequest) => credentialsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CREDENTIALS.detail(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CREDENTIALS.list() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CREDENTIALS.resolved() });
    },
  });
}

export function useDeleteCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => credentialsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CREDENTIALS.list() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CREDENTIALS.resolved() });
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CREDENTIALS.detail(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CREDENTIALS.list() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CREDENTIALS.audit(id) });
    },
  });
}
