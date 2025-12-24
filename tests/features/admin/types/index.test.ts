import { describe, expect, it } from "vitest";
import { ADMIN_EMAIL_DOMAIN, isAdminUser } from "@/features/admin/types";

describe("Admin Type Helpers", () => {
  describe("ADMIN_EMAIL_DOMAIN", () => {
    it("is @fixads.xyz", () => {
      expect(ADMIN_EMAIL_DOMAIN).toBe("@fixads.xyz");
    });
  });

  describe("isAdminUser", () => {
    it("returns true for valid admin user", () => {
      const user = {
        role: "admin",
        status: "active",
        is_activated: true,
        email: "admin@fixads.xyz",
      };
      expect(isAdminUser(user)).toBe(true);
    });

    it("returns false when role is not admin", () => {
      const user = {
        role: "user",
        status: "active",
        is_activated: true,
        email: "user@fixads.xyz",
      };
      expect(isAdminUser(user)).toBe(false);
    });

    it("returns false when role is viewer", () => {
      const user = {
        role: "viewer",
        status: "active",
        is_activated: true,
        email: "viewer@fixads.xyz",
      };
      expect(isAdminUser(user)).toBe(false);
    });

    it("returns false when status is not active", () => {
      const user = {
        role: "admin",
        status: "inactive",
        is_activated: true,
        email: "admin@fixads.xyz",
      };
      expect(isAdminUser(user)).toBe(false);
    });

    it("returns false when status is pending", () => {
      const user = {
        role: "admin",
        status: "pending",
        is_activated: true,
        email: "admin@fixads.xyz",
      };
      expect(isAdminUser(user)).toBe(false);
    });

    it("returns false when not activated", () => {
      const user = {
        role: "admin",
        status: "active",
        is_activated: false,
        email: "admin@fixads.xyz",
      };
      expect(isAdminUser(user)).toBe(false);
    });

    it("returns false when email domain is not @fixads.xyz", () => {
      const user = {
        role: "admin",
        status: "active",
        is_activated: true,
        email: "admin@example.com",
      };
      expect(isAdminUser(user)).toBe(false);
    });

    it("returns false for Gmail domain", () => {
      const user = {
        role: "admin",
        status: "active",
        is_activated: true,
        email: "admin@gmail.com",
      };
      expect(isAdminUser(user)).toBe(false);
    });

    it("returns false when role is undefined", () => {
      const user = {
        status: "active",
        is_activated: true,
        email: "admin@fixads.xyz",
      };
      expect(isAdminUser(user)).toBe(false);
    });

    it("returns false when status is undefined", () => {
      const user = {
        role: "admin",
        is_activated: true,
        email: "admin@fixads.xyz",
      };
      expect(isAdminUser(user)).toBe(false);
    });

    it("returns false when is_activated is undefined", () => {
      const user = {
        role: "admin",
        status: "active",
        email: "admin@fixads.xyz",
      };
      expect(isAdminUser(user)).toBe(false);
    });

    it("returns false when multiple conditions fail", () => {
      const user = {
        role: "user",
        status: "inactive",
        is_activated: false,
        email: "user@example.com",
      };
      expect(isAdminUser(user)).toBe(false);
    });

    it("handles edge case with similar domain suffix", () => {
      const user = {
        role: "admin",
        status: "active",
        is_activated: true,
        email: "admin@notfixads.xyz",
      };
      expect(isAdminUser(user)).toBe(false);
    });

    it("validates exact domain match including @", () => {
      const user = {
        role: "admin",
        status: "active",
        is_activated: true,
        email: "fixads.xyz@example.com",
      };
      expect(isAdminUser(user)).toBe(false);
    });
  });
});
