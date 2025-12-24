import { describe, expect, it } from "vitest";
import {
  formatCost,
  formatNumber,
  getCampaignTypeLabel,
} from "@/features/account-overview/types";

describe("Account Overview Type Helpers", () => {
  describe("formatCost", () => {
    it("converts micros to dollars with default USD", () => {
      expect(formatCost(1000000)).toBe("$1.00");
    });

    it("formats zero correctly", () => {
      expect(formatCost(0)).toBe("$0.00");
    });

    it("formats small amounts correctly", () => {
      expect(formatCost(500000)).toBe("$0.50");
    });

    it("formats large amounts with commas", () => {
      expect(formatCost(1000000000)).toBe("$1,000.00");
    });

    it("formats very large amounts", () => {
      expect(formatCost(123456789000)).toBe("$123,456.79");
    });

    it("uses provided currency code EUR", () => {
      const result = formatCost(1000000, "EUR");
      expect(result).toContain("1.00");
    });

    it("uses provided currency code GBP", () => {
      const result = formatCost(1000000, "GBP");
      expect(result).toContain("1.00");
    });

    it("handles fractional micros", () => {
      expect(formatCost(1234567)).toBe("$1.23");
    });

    it("rounds to 2 decimal places", () => {
      expect(formatCost(1999999)).toBe("$2.00");
    });
  });

  describe("formatNumber", () => {
    it("formats millions with M suffix", () => {
      expect(formatNumber(1000000)).toBe("1.0M");
    });

    it("formats multi-millions correctly", () => {
      expect(formatNumber(5500000)).toBe("5.5M");
    });

    it("formats thousands with K suffix", () => {
      expect(formatNumber(1000)).toBe("1.0K");
    });

    it("formats multi-thousands correctly", () => {
      expect(formatNumber(25000)).toBe("25.0K");
    });

    it("formats hundreds with locale string", () => {
      expect(formatNumber(500)).toBe("500");
    });

    it("formats zero", () => {
      expect(formatNumber(0)).toBe("0");
    });

    it("formats small numbers without suffix", () => {
      expect(formatNumber(999)).toBe("999");
    });

    it("formats exactly 1000 as K", () => {
      expect(formatNumber(1000)).toBe("1.0K");
    });

    it("formats exactly 1 million as M", () => {
      expect(formatNumber(1000000)).toBe("1.0M");
    });

    it("formats large numbers in millions", () => {
      expect(formatNumber(150000000)).toBe("150.0M");
    });
  });

  describe("getCampaignTypeLabel", () => {
    it("returns Performance Max for PERFORMANCE_MAX", () => {
      expect(getCampaignTypeLabel("PERFORMANCE_MAX")).toBe("Performance Max");
    });

    it("returns Search for SEARCH", () => {
      expect(getCampaignTypeLabel("SEARCH")).toBe("Search");
    });

    it("returns Display for DISPLAY", () => {
      expect(getCampaignTypeLabel("DISPLAY")).toBe("Display");
    });

    it("returns Shopping for SHOPPING", () => {
      expect(getCampaignTypeLabel("SHOPPING")).toBe("Shopping");
    });

    it("returns Video for VIDEO", () => {
      expect(getCampaignTypeLabel("VIDEO")).toBe("Video");
    });

    it("returns Smart for SMART", () => {
      expect(getCampaignTypeLabel("SMART")).toBe("Smart");
    });

    it("returns Discovery for DISCOVERY", () => {
      expect(getCampaignTypeLabel("DISCOVERY")).toBe("Discovery");
    });

    it("returns Demand Gen for DEMAND_GEN", () => {
      expect(getCampaignTypeLabel("DEMAND_GEN")).toBe("Demand Gen");
    });

    it("returns App for APP", () => {
      expect(getCampaignTypeLabel("APP")).toBe("App");
    });

    it("returns Hotel for HOTEL", () => {
      expect(getCampaignTypeLabel("HOTEL")).toBe("Hotel");
    });

    it("returns Local for LOCAL", () => {
      expect(getCampaignTypeLabel("LOCAL")).toBe("Local");
    });

    it("returns Local Services for LOCAL_SERVICES", () => {
      expect(getCampaignTypeLabel("LOCAL_SERVICES")).toBe("Local Services");
    });

    it("returns Unknown for UNSPECIFIED", () => {
      expect(getCampaignTypeLabel("UNSPECIFIED")).toBe("Unknown");
    });

    it("returns Unknown for UNKNOWN", () => {
      expect(getCampaignTypeLabel("UNKNOWN")).toBe("Unknown");
    });

    it("returns raw type for unmapped types", () => {
      expect(getCampaignTypeLabel("NEW_CAMPAIGN_TYPE")).toBe("NEW_CAMPAIGN_TYPE");
    });

    it("returns raw type for empty string", () => {
      expect(getCampaignTypeLabel("")).toBe("");
    });
  });
});
