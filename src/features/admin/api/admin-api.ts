import { apiMethods } from "@/shared/api";
import type { UsersListParams, UsersListResponse } from "../types";

const AUTH_PATH = "auth/v1";

export const adminApi = {
  /**
   * Get all users with pagination (admin only)
   * GET /auth/v1/users?skip=0&limit=50
   */
  getUsers: (params?: UsersListParams) => {
    const searchParams = new URLSearchParams();
    if (params?.skip !== undefined) searchParams.set("skip", String(params.skip));
    if (params?.limit !== undefined) searchParams.set("limit", String(params.limit));
    const queryString = searchParams.toString();
    return apiMethods.get<UsersListResponse>(
      `${AUTH_PATH}/users${queryString ? `?${queryString}` : ""}`,
    );
  },
};
