import { describe, expect, it } from "vitest";
import { validateAssetGroupId } from "@/features/campaigns/api/insights-api";
import { insightsApi } from "@/features/campaigns/api/insights-api";

describe("validateAssetGroupId", () => {
  it("accepts valid numeric asset group IDs", () => {
    expect(() => validateAssetGroupId("12345678")).not.toThrow();
    expect(() => validateAssetGroupId("0")).not.toThrow();
    expect(() => validateAssetGroupId("999999999999")).not.toThrow();
  });

  it("rejects non-numeric asset group IDs", () => {
    expect(() => validateAssetGroupId("abc")).toThrow("Invalid asset group ID");
    expect(() => validateAssetGroupId("123abc")).toThrow("Invalid asset group ID");
    expect(() => validateAssetGroupId("12.34")).toThrow("Invalid asset group ID");
    expect(() => validateAssetGroupId("-1")).toThrow("Invalid asset group ID");
    expect(() => validateAssetGroupId("")).toThrow("Invalid asset group ID");
  });

  it("rejects injection attempts", () => {
    expect(() => validateAssetGroupId("1 OR 1=1")).toThrow("Invalid asset group ID");
    expect(() => validateAssetGroupId("1; DROP TABLE")).toThrow("Invalid asset group ID");
  });
});

describe("insightsApi validates IDs before making requests", () => {
  const INVALID_CAMPAIGN_ID = "abc; DROP TABLE";
  const INVALID_ASSET_GROUP_ID = "abc; DROP TABLE";
  const ACCOUNT_ID = "test-account";

  // Functions that use campaignId
  it("getPlacements rejects invalid campaignId", () => {
    expect(() => insightsApi.getPlacements(ACCOUNT_ID, INVALID_CAMPAIGN_ID)).toThrow(
      "Invalid campaign ID",
    );
  });

  it("getSegmentedPerformance rejects invalid campaignId", () => {
    expect(() => insightsApi.getSegmentedPerformance(ACCOUNT_ID, INVALID_CAMPAIGN_ID)).toThrow(
      "Invalid campaign ID",
    );
  });

  it("getProducts rejects invalid campaignId", () => {
    expect(() => insightsApi.getProducts(ACCOUNT_ID, INVALID_CAMPAIGN_ID)).toThrow(
      "Invalid campaign ID",
    );
  });

  it("getProductGroups rejects invalid campaignId", () => {
    expect(() => insightsApi.getProductGroups(ACCOUNT_ID, INVALID_CAMPAIGN_ID)).toThrow(
      "Invalid campaign ID",
    );
  });

  it("getSimulations rejects invalid campaignId", () => {
    expect(() => insightsApi.getSimulations(ACCOUNT_ID, INVALID_CAMPAIGN_ID)).toThrow(
      "Invalid campaign ID",
    );
  });

  it("getDemographics rejects invalid campaignId", () => {
    expect(() => insightsApi.getDemographics(ACCOUNT_ID, INVALID_CAMPAIGN_ID)).toThrow(
      "Invalid campaign ID",
    );
  });

  it("getTimePerformance rejects invalid campaignId", () => {
    expect(() => insightsApi.getTimePerformance(ACCOUNT_ID, INVALID_CAMPAIGN_ID)).toThrow(
      "Invalid campaign ID",
    );
  });

  it("getAuctionInsights rejects invalid campaignId", () => {
    expect(() => insightsApi.getAuctionInsights(ACCOUNT_ID, INVALID_CAMPAIGN_ID)).toThrow(
      "Invalid campaign ID",
    );
  });

  it("getGeographicPerformance rejects invalid campaignId", () => {
    expect(() => insightsApi.getGeographicPerformance(ACCOUNT_ID, INVALID_CAMPAIGN_ID)).toThrow(
      "Invalid campaign ID",
    );
  });

  // Functions that use assetGroupId
  it("getTopCombinations rejects invalid assetGroupId", () => {
    expect(() => insightsApi.getTopCombinations(ACCOUNT_ID, INVALID_ASSET_GROUP_ID)).toThrow(
      "Invalid asset group ID",
    );
  });

  it("getSignals rejects invalid assetGroupId", () => {
    expect(() => insightsApi.getSignals(ACCOUNT_ID, INVALID_ASSET_GROUP_ID)).toThrow(
      "Invalid asset group ID",
    );
  });

  it("addSearchThemeSignal rejects invalid assetGroupId", () => {
    expect(() =>
      insightsApi.addSearchThemeSignal(ACCOUNT_ID, INVALID_ASSET_GROUP_ID, "test"),
    ).toThrow("Invalid asset group ID");
  });

  it("addAudienceSignal rejects invalid assetGroupId", () => {
    expect(() =>
      insightsApi.addAudienceSignal(ACCOUNT_ID, INVALID_ASSET_GROUP_ID, "aud-123"),
    ).toThrow("Invalid asset group ID");
  });

  it("removeSignal rejects invalid assetGroupId", () => {
    expect(() =>
      insightsApi.removeSignal(ACCOUNT_ID, INVALID_ASSET_GROUP_ID, "signal-123"),
    ).toThrow("Invalid asset group ID");
  });
});
