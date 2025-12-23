import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/lib/constants";
import { adminApi } from "../api/admin-api";
import type { UsersListParams } from "../types";

export function useAdminUsers(params?: UsersListParams) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN.users(params),
    queryFn: () => adminApi.getUsers(params),
    staleTime: 30_000, // 30 seconds
  });
}
