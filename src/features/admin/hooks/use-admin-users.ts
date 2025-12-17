import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../api/admin-api";
import type { UsersListParams } from "../types";

export const ADMIN_USERS_QUERY_KEY = "admin-users";

export function useAdminUsers(params?: UsersListParams) {
  return useQuery({
    queryKey: [ADMIN_USERS_QUERY_KEY, params?.skip ?? 0, params?.limit ?? 50],
    queryFn: () => adminApi.getUsers(params),
    staleTime: 30_000, // 30 seconds
  });
}
