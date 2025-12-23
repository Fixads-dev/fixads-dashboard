import { describe, expect, it } from "vitest";
import { getUserDisplayName, getUserPhotoUrl, type User } from "@/features/auth/types";

describe("Auth Types Helpers", () => {
  describe("getUserDisplayName", () => {
    it("returns full_name when available", () => {
      const user: User = {
        id: "user-1",
        email: "john.doe@example.com",
        full_name: "John Doe",
        role: "user",
        status: "active",
      };

      expect(getUserDisplayName(user)).toBe("John Doe");
    });

    it("returns email username when full_name is undefined", () => {
      const user: User = {
        id: "user-1",
        email: "john.doe@example.com",
        role: "user",
        status: "active",
      };

      expect(getUserDisplayName(user)).toBe("john.doe");
    });

    it("returns empty string when full_name is empty string", () => {
      const user: User = {
        id: "user-1",
        email: "jane@company.org",
        full_name: "",
        role: "user",
        status: "active",
      };

      // The ?? operator only falls back for null/undefined, not empty string
      expect(getUserDisplayName(user)).toBe("");
    });

    it("handles email with no @ symbol gracefully", () => {
      const user: User = {
        id: "user-1",
        email: "invalidemailformat",
        role: "user",
        status: "active",
      };

      expect(getUserDisplayName(user)).toBe("invalidemailformat");
    });

    it("handles email with multiple @ symbols", () => {
      const user: User = {
        id: "user-1",
        email: "weird@email@format.com",
        role: "user",
        status: "active",
      };

      // split("@")[0] returns the part before the first @
      expect(getUserDisplayName(user)).toBe("weird");
    });
  });

  describe("getUserPhotoUrl", () => {
    it("returns picture when available", () => {
      const user: User = {
        id: "user-1",
        email: "test@example.com",
        picture: "https://example.com/photo.jpg",
        role: "user",
        status: "active",
      };

      expect(getUserPhotoUrl(user)).toBe("https://example.com/photo.jpg");
    });

    it("returns undefined when picture is not set", () => {
      const user: User = {
        id: "user-1",
        email: "test@example.com",
        role: "user",
        status: "active",
      };

      expect(getUserPhotoUrl(user)).toBeUndefined();
    });

    it("returns empty string when picture is empty", () => {
      const user: User = {
        id: "user-1",
        email: "test@example.com",
        picture: "",
        role: "user",
        status: "active",
      };

      expect(getUserPhotoUrl(user)).toBe("");
    });
  });

  describe("User type", () => {
    it("accepts valid admin user", () => {
      const adminUser: User = {
        id: "admin-1",
        email: "admin@example.com",
        full_name: "Admin User",
        role: "admin",
        status: "active",
        is_activated: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-15T12:00:00Z",
      };

      expect(adminUser.role).toBe("admin");
      expect(adminUser.status).toBe("active");
    });

    it("accepts valid viewer user", () => {
      const viewerUser: User = {
        id: "viewer-1",
        email: "viewer@example.com",
        role: "viewer",
        status: "active",
      };

      expect(viewerUser.role).toBe("viewer");
    });

    it("accepts inactive user", () => {
      const inactiveUser: User = {
        id: "user-1",
        email: "inactive@example.com",
        role: "user",
        status: "inactive",
      };

      expect(inactiveUser.status).toBe("inactive");
    });

    it("accepts suspended user", () => {
      const suspendedUser: User = {
        id: "user-1",
        email: "suspended@example.com",
        role: "user",
        status: "suspended",
      };

      expect(suspendedUser.status).toBe("suspended");
    });
  });
});
