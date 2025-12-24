import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useAdminUsers } from "@/features/admin/hooks/use-admin-users";
import { server } from "../../../utils/mocks/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const mockUsersResponse = {
  users: [
    {
      id: "user-1",
      email: "admin@fixads.xyz",
      full_name: "Admin User",
      role: "admin",
      status: "active",
      is_activated: true,
      last_login_at: "2024-01-15T10:30:00Z",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    },
    {
      id: "user-2",
      email: "user@example.com",
      full_name: "Regular User",
      role: "user",
      status: "active",
      is_activated: true,
      last_login_at: "2024-01-14T08:00:00Z",
      created_at: "2024-01-02T00:00:00Z",
      updated_at: "2024-01-14T08:00:00Z",
    },
    {
      id: "user-3",
      email: "pending@example.com",
      full_name: null,
      role: "user",
      status: "pending",
      is_activated: false,
      last_login_at: null,
      created_at: "2024-01-10T00:00:00Z",
      updated_at: "2024-01-10T00:00:00Z",
    },
  ],
  total: 3,
  skip: 0,
  limit: 50,
};

describe("useAdminUsers hook", () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
  });

  afterEach(() => {
    server.resetHandlers();
    queryClient.clear();
  });

  it("fetches users list without params", async () => {
    server.use(
      http.get(`${API_URL}/auth/v1/users`, () => {
        return HttpResponse.json(mockUsersResponse);
      }),
    );

    const { result } = renderHook(() => useAdminUsers(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.users).toHaveLength(3);
    expect(result.current.data?.total).toBe(3);
    expect(result.current.data?.skip).toBe(0);
    expect(result.current.data?.limit).toBe(50);
  });

  it("fetches users with skip parameter", async () => {
    const paginatedResponse = {
      users: [mockUsersResponse.users[2]],
      total: 3,
      skip: 2,
      limit: 50,
    };

    server.use(
      http.get(`${API_URL}/auth/v1/users`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("skip") === "2") {
          return HttpResponse.json(paginatedResponse);
        }
        return HttpResponse.json(mockUsersResponse);
      }),
    );

    const { result } = renderHook(() => useAdminUsers({ skip: 2 }), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.users).toHaveLength(1);
    expect(result.current.data?.skip).toBe(2);
  });

  it("fetches users with limit parameter", async () => {
    const limitedResponse = {
      users: [mockUsersResponse.users[0]],
      total: 3,
      skip: 0,
      limit: 1,
    };

    server.use(
      http.get(`${API_URL}/auth/v1/users`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("limit") === "1") {
          return HttpResponse.json(limitedResponse);
        }
        return HttpResponse.json(mockUsersResponse);
      }),
    );

    const { result } = renderHook(() => useAdminUsers({ limit: 1 }), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.users).toHaveLength(1);
    expect(result.current.data?.limit).toBe(1);
  });

  it("fetches users with both skip and limit", async () => {
    const paginatedResponse = {
      users: [mockUsersResponse.users[1]],
      total: 3,
      skip: 1,
      limit: 1,
    };

    server.use(
      http.get(`${API_URL}/auth/v1/users`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("skip") === "1" && url.searchParams.get("limit") === "1") {
          return HttpResponse.json(paginatedResponse);
        }
        return HttpResponse.json(mockUsersResponse);
      }),
    );

    const { result } = renderHook(() => useAdminUsers({ skip: 1, limit: 1 }), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.users).toHaveLength(1);
    expect(result.current.data?.skip).toBe(1);
    expect(result.current.data?.limit).toBe(1);
  });

  it("returns user details correctly", async () => {
    server.use(
      http.get(`${API_URL}/auth/v1/users`, () => {
        return HttpResponse.json(mockUsersResponse);
      }),
    );

    const { result } = renderHook(() => useAdminUsers(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const adminUser = result.current.data?.users[0];
    expect(adminUser?.id).toBe("user-1");
    expect(adminUser?.email).toBe("admin@fixads.xyz");
    expect(adminUser?.full_name).toBe("Admin User");
    expect(adminUser?.role).toBe("admin");
    expect(adminUser?.status).toBe("active");
    expect(adminUser?.is_activated).toBe(true);
    expect(adminUser?.last_login_at).toBe("2024-01-15T10:30:00Z");

    const pendingUser = result.current.data?.users[2];
    expect(pendingUser?.full_name).toBeNull();
    expect(pendingUser?.last_login_at).toBeNull();
    expect(pendingUser?.is_activated).toBe(false);
  });

  it("handles error response", async () => {
    server.use(
      http.get(`${API_URL}/auth/v1/users`, () => {
        return HttpResponse.json({ detail: "Unauthorized" }, { status: 501 });
      }),
    );

    const { result } = renderHook(() => useAdminUsers(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it("handles empty users list", async () => {
    server.use(
      http.get(`${API_URL}/auth/v1/users`, () => {
        return HttpResponse.json({ users: [], total: 0, skip: 0, limit: 50 });
      }),
    );

    const { result } = renderHook(() => useAdminUsers(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.users).toHaveLength(0);
    expect(result.current.data?.total).toBe(0);
  });
});
