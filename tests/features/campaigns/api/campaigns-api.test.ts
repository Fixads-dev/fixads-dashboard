import { describe, expect, it } from "vitest";
import { validateCampaignId } from "@/features/campaigns/api/campaigns-api";

describe("validateCampaignId", () => {
  it("accepts valid numeric campaign IDs", () => {
    expect(() => validateCampaignId("12345678")).not.toThrow();
    expect(() => validateCampaignId("0")).not.toThrow();
    expect(() => validateCampaignId("999999999999")).not.toThrow();
  });

  it("rejects non-numeric campaign IDs", () => {
    expect(() => validateCampaignId("abc")).toThrow("Invalid campaign ID");
    expect(() => validateCampaignId("123abc")).toThrow("Invalid campaign ID");
    expect(() => validateCampaignId("12.34")).toThrow("Invalid campaign ID");
    expect(() => validateCampaignId("-1")).toThrow("Invalid campaign ID");
    expect(() => validateCampaignId("")).toThrow("Invalid campaign ID");
  });

  it("rejects SQL/GAQL injection attempts", () => {
    expect(() => validateCampaignId("1 OR 1=1")).toThrow("Invalid campaign ID");
    expect(() => validateCampaignId("1; DROP TABLE")).toThrow("Invalid campaign ID");
    expect(() => validateCampaignId("1/**/OR/**/1=1")).toThrow("Invalid campaign ID");
  });
});
