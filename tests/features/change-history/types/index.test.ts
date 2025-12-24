import { describe, expect, it } from "vitest";
import {
  getClientTypeLabel,
  getOperationLabel,
  getOperationVariant,
  getResourceTypeLabel,
} from "@/features/change-history/types";

describe("Change History Type Helpers", () => {
  describe("getResourceTypeLabel", () => {
    it("returns correct label for CAMPAIGN", () => {
      expect(getResourceTypeLabel("CAMPAIGN")).toBe("Campaign");
    });

    it("returns correct label for AD_GROUP", () => {
      expect(getResourceTypeLabel("AD_GROUP")).toBe("Ad Group");
    });

    it("returns correct label for AD", () => {
      expect(getResourceTypeLabel("AD")).toBe("Ad");
    });

    it("returns correct label for CRITERION", () => {
      expect(getResourceTypeLabel("CRITERION")).toBe("Keyword/Targeting");
    });

    it("returns correct label for FEED", () => {
      expect(getResourceTypeLabel("FEED")).toBe("Feed");
    });

    it("returns correct label for FEED_ITEM", () => {
      expect(getResourceTypeLabel("FEED_ITEM")).toBe("Feed Item");
    });

    it("returns correct label for CAMPAIGN_BUDGET", () => {
      expect(getResourceTypeLabel("CAMPAIGN_BUDGET")).toBe("Budget");
    });

    it("returns correct label for ASSET", () => {
      expect(getResourceTypeLabel("ASSET")).toBe("Asset");
    });

    it("returns correct label for ASSET_GROUP", () => {
      expect(getResourceTypeLabel("ASSET_GROUP")).toBe("Asset Group");
    });

    it("returns correct label for ASSET_GROUP_ASSET", () => {
      expect(getResourceTypeLabel("ASSET_GROUP_ASSET")).toBe("Asset Group Asset");
    });

    it("returns Unknown for UNSPECIFIED", () => {
      expect(getResourceTypeLabel("UNSPECIFIED")).toBe("Unknown");
    });

    it("returns Unknown for UNKNOWN", () => {
      expect(getResourceTypeLabel("UNKNOWN")).toBe("Unknown");
    });
  });

  describe("getOperationLabel", () => {
    it("returns Created for CREATE", () => {
      expect(getOperationLabel("CREATE")).toBe("Created");
    });

    it("returns Updated for UPDATE", () => {
      expect(getOperationLabel("UPDATE")).toBe("Updated");
    });

    it("returns Removed for REMOVE", () => {
      expect(getOperationLabel("REMOVE")).toBe("Removed");
    });

    it("returns Unknown for UNSPECIFIED", () => {
      expect(getOperationLabel("UNSPECIFIED")).toBe("Unknown");
    });

    it("returns Unknown for UNKNOWN", () => {
      expect(getOperationLabel("UNKNOWN")).toBe("Unknown");
    });
  });

  describe("getClientTypeLabel", () => {
    it("returns Google Ads UI for GOOGLE_ADS_WEB_CLIENT", () => {
      expect(getClientTypeLabel("GOOGLE_ADS_WEB_CLIENT")).toBe("Google Ads UI");
    });

    it("returns API for GOOGLE_ADS_API", () => {
      expect(getClientTypeLabel("GOOGLE_ADS_API")).toBe("API");
    });

    it("returns Automated Rule for GOOGLE_ADS_AUTOMATED_RULE", () => {
      expect(getClientTypeLabel("GOOGLE_ADS_AUTOMATED_RULE")).toBe("Automated Rule");
    });

    it("returns Scripts for GOOGLE_ADS_SCRIPTS", () => {
      expect(getClientTypeLabel("GOOGLE_ADS_SCRIPTS")).toBe("Scripts");
    });

    it("returns Bulk Upload for GOOGLE_ADS_BULK_UPLOAD", () => {
      expect(getClientTypeLabel("GOOGLE_ADS_BULK_UPLOAD")).toBe("Bulk Upload");
    });

    it("returns Other for OTHER", () => {
      expect(getClientTypeLabel("OTHER")).toBe("Other");
    });

    it("returns Unknown for UNSPECIFIED", () => {
      expect(getClientTypeLabel("UNSPECIFIED")).toBe("Unknown");
    });

    it("returns Unknown for UNKNOWN", () => {
      expect(getClientTypeLabel("UNKNOWN")).toBe("Unknown");
    });
  });

  describe("getOperationVariant", () => {
    it("returns default for CREATE", () => {
      expect(getOperationVariant("CREATE")).toBe("default");
    });

    it("returns secondary for UPDATE", () => {
      expect(getOperationVariant("UPDATE")).toBe("secondary");
    });

    it("returns destructive for REMOVE", () => {
      expect(getOperationVariant("REMOVE")).toBe("destructive");
    });

    it("returns secondary for UNSPECIFIED", () => {
      expect(getOperationVariant("UNSPECIFIED")).toBe("secondary");
    });

    it("returns secondary for UNKNOWN", () => {
      expect(getOperationVariant("UNKNOWN")).toBe("secondary");
    });
  });
});
