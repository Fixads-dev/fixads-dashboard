import { describe, expect, it } from "vitest";
import {
  AssetFieldTypeSchema,
  AssetMetricsSchema,
  AssetToAddSchema,
  AssetToRemoveSchema,
  BadAssetClassificationSchema,
  BadAssetHistoryItemSchema,
  BadAssetHistoryResponseSchema,
  GeneratedTextAssetSchema,
  parseOptimizerResponse,
  SmartOptimizerApplyResponseSchema,
  SmartOptimizerResponseSchema,
  TargetCpaResponseSchema,
  TextOptimizerApplyResponseSchema,
  TextOptimizerResponseSchema,
} from "@/features/optimizer/schemas/optimizer-schemas";

describe("Optimizer Schemas", () => {
  describe("AssetFieldTypeSchema", () => {
    it("accepts valid asset field types", () => {
      expect(AssetFieldTypeSchema.parse("HEADLINE")).toBe("HEADLINE");
      expect(AssetFieldTypeSchema.parse("LONG_HEADLINE")).toBe("LONG_HEADLINE");
      expect(AssetFieldTypeSchema.parse("DESCRIPTION")).toBe("DESCRIPTION");
    });

    it("rejects invalid asset field types", () => {
      expect(() => AssetFieldTypeSchema.parse("INVALID")).toThrow();
      expect(() => AssetFieldTypeSchema.parse("headline")).toThrow();
    });
  });

  describe("BadAssetClassificationSchema", () => {
    it("accepts valid classifications", () => {
      expect(BadAssetClassificationSchema.parse("ZOMBIE")).toBe("ZOMBIE");
      expect(BadAssetClassificationSchema.parse("MONEY_WASTER")).toBe("MONEY_WASTER");
      expect(BadAssetClassificationSchema.parse("CLICKBAIT")).toBe("CLICKBAIT");
      expect(BadAssetClassificationSchema.parse("TREND_DROPPER")).toBe("TREND_DROPPER");
    });

    it("rejects invalid classifications", () => {
      expect(() => BadAssetClassificationSchema.parse("BAD")).toThrow();
    });
  });

  describe("AssetMetricsSchema", () => {
    it("accepts valid metrics with all fields", () => {
      const metrics = {
        impressions: 1000,
        clicks: 50,
        cost_micros: 5000000,
        conversions: 10,
        ctr: 0.05,
        cvr: 0.2,
        age_days: 30,
      };
      expect(AssetMetricsSchema.parse(metrics)).toEqual(metrics);
    });

    it("accepts partial metrics", () => {
      const metrics = { impressions: 1000, clicks: 50 };
      expect(AssetMetricsSchema.parse(metrics)).toEqual(metrics);
    });

    it("accepts undefined (optional)", () => {
      expect(AssetMetricsSchema.parse(undefined)).toBeUndefined();
    });
  });

  describe("AssetToRemoveSchema", () => {
    const validAsset = {
      asset_id: "asset-123",
      asset_type: "HEADLINE",
      text: "Buy Now!",
      reason_code: "ZOMBIE",
      severity_score: 0.8,
    };

    it("accepts valid asset to remove", () => {
      const result = AssetToRemoveSchema.parse(validAsset);
      expect(result.asset_id).toBe("asset-123");
      expect(result.asset_type).toBe("HEADLINE");
      expect(result.reason_code).toBe("ZOMBIE");
    });

    it("accepts asset with optional fields", () => {
      const assetWithOptionals = {
        ...validAsset,
        asset_group_asset_resource_name: "customers/123/assetGroupAssets/456",
        reason_label: "No conversions in 30 days",
        details: "Asset has 0 conversions",
        metrics: { impressions: 1000, clicks: 0 },
      };
      const result = AssetToRemoveSchema.parse(assetWithOptionals);
      expect(result.asset_group_asset_resource_name).toBe("customers/123/assetGroupAssets/456");
      expect(result.reason_label).toBe("No conversions in 30 days");
    });

    it("rejects missing required fields", () => {
      expect(() => AssetToRemoveSchema.parse({ asset_id: "123" })).toThrow();
    });

    it("rejects invalid asset_type", () => {
      expect(() => AssetToRemoveSchema.parse({ ...validAsset, asset_type: "INVALID" })).toThrow();
    });
  });

  describe("AssetToAddSchema", () => {
    const validAsset = {
      asset_type: "HEADLINE",
      text: "Great Deals Today",
      category: "promotional",
      char_count: 17,
      compliance_passed: true,
    };

    it("accepts valid asset to add", () => {
      const result = AssetToAddSchema.parse(validAsset);
      expect(result.text).toBe("Great Deals Today");
      expect(result.compliance_passed).toBe(true);
    });

    it("accepts asset with compliance issues", () => {
      const assetWithIssues = {
        ...validAsset,
        compliance_passed: false,
        compliance_issues: ["Excessive punctuation", "All caps"],
        language: "en",
      };
      const result = AssetToAddSchema.parse(assetWithIssues);
      expect(result.compliance_issues).toHaveLength(2);
    });
  });

  describe("GeneratedTextAssetSchema", () => {
    it("accepts valid generated asset", () => {
      const asset = {
        asset_type: "HEADLINE",
        text: "Shop Now",
        char_count: 8,
        compliance_passed: true,
      };
      expect(GeneratedTextAssetSchema.parse(asset)).toEqual(asset);
    });

    it("accepts LONG_HEADLINE type", () => {
      const asset = {
        asset_type: "LONG_HEADLINE",
        text: "Discover Amazing Products",
        char_count: 25,
        compliance_passed: true,
      };
      expect(GeneratedTextAssetSchema.parse(asset).asset_type).toBe("LONG_HEADLINE");
    });
  });

  describe("TextOptimizerResponseSchema", () => {
    const validResponse = {
      optimization_run_id: "run-123",
      campaign_id: "camp-456",
      campaign_name: "Test Campaign",
      asset_group_id: "ag-789",
      asset_group_name: "Test Asset Group",
      assets_to_remove: [
        {
          asset_id: "asset-1",
          asset_type: "HEADLINE",
          text: "Bad Headline",
          reason_code: "ZOMBIE",
          severity_score: 0.9,
        },
      ],
      assets_to_add: [
        {
          asset_type: "HEADLINE",
          text: "Good Headline",
          category: "brand",
          char_count: 13,
          compliance_passed: true,
        },
      ],
      summary: {
        total_assets_analyzed: 10,
        bad_assets_found: 1,
        assets_to_remove: 1,
        assets_to_add: 1,
        compliance_passed: 1,
        compliance_failed: 0,
        bad_history_used: 5,
        target_cpa_micros: 5000000,
      },
    };

    it("accepts valid text optimizer response", () => {
      const result = TextOptimizerResponseSchema.parse(validResponse);
      expect(result.optimization_run_id).toBe("run-123");
      expect(result.assets_to_remove).toHaveLength(1);
      expect(result.assets_to_add).toHaveLength(1);
    });

    it("accepts null target_cpa_micros", () => {
      const responseWithNullCpa = {
        ...validResponse,
        summary: { ...validResponse.summary, target_cpa_micros: null },
      };
      const result = TextOptimizerResponseSchema.parse(responseWithNullCpa);
      expect(result.summary.target_cpa_micros).toBeNull();
    });

    it("rejects invalid nested asset", () => {
      const invalidResponse = {
        ...validResponse,
        assets_to_remove: [{ asset_id: "123" }], // Missing required fields
      };
      expect(() => TextOptimizerResponseSchema.parse(invalidResponse)).toThrow();
    });
  });

  describe("TextOptimizerApplyResponseSchema", () => {
    it("accepts valid apply response", () => {
      const response = {
        optimization_run_id: "run-123",
        assets_removed: 2,
        assets_created: 3,
        bad_assets_logged: 2,
        errors: [],
      };
      const result = TextOptimizerApplyResponseSchema.parse(response);
      expect(result.assets_removed).toBe(2);
      expect(result.errors).toHaveLength(0);
    });

    it("accepts response with errors", () => {
      const response = {
        optimization_run_id: "run-123",
        assets_removed: 1,
        assets_created: 2,
        bad_assets_logged: 1,
        errors: ["Failed to create asset: duplicate text"],
      };
      const result = TextOptimizerApplyResponseSchema.parse(response);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe("SmartOptimizerResponseSchema", () => {
    const validResponse = {
      optimization_run_id: "run-smart-123",
      campaign_id: "camp-456",
      campaign_name: "Smart Campaign",
      asset_group_id: "ag-789",
      asset_group_name: "Smart Asset Group",
      generated_assets: [
        {
          asset_type: "HEADLINE",
          text: "AI Generated Headline",
          char_count: 21,
          compliance_passed: true,
        },
      ],
      assets_to_remove: [],
      summary: {
        total_assets_analyzed: 15,
        generated_headlines: 5,
        generated_descriptions: 3,
        bad_assets_found: 0,
        compliance_passed: 8,
        compliance_failed: 0,
      },
    };

    it("accepts valid smart optimizer response", () => {
      const result = SmartOptimizerResponseSchema.parse(validResponse);
      expect(result.generated_assets).toHaveLength(1);
      expect(result.summary.generated_headlines).toBe(5);
    });
  });

  describe("SmartOptimizerApplyResponseSchema", () => {
    it("accepts valid apply response", () => {
      const response = {
        optimization_run_id: "run-smart-123",
        assets_removed: 0,
        assets_created: 5,
        bad_assets_logged: 0,
        errors: [],
      };
      expect(SmartOptimizerApplyResponseSchema.parse(response)).toEqual(response);
    });
  });

  describe("TargetCpaResponseSchema", () => {
    it("accepts valid target CPA response", () => {
      const response = {
        id: "cpa-123",
        account_id: "acc-456",
        campaign_id: "camp-789",
        target_cpa_micros: 5000000,
        currency_code: "USD",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-15T12:00:00Z",
      };
      const result = TargetCpaResponseSchema.parse(response);
      expect(result.target_cpa_micros).toBe(5000000);
      expect(result.currency_code).toBe("USD");
    });
  });

  describe("BadAssetHistoryItemSchema", () => {
    it("accepts valid history item", () => {
      const item = {
        id: "hist-123",
        asset_id: "asset-456",
        asset_type: "HEADLINE",
        asset_text: "Old Bad Headline",
        failure_reason_code: "MONEY_WASTER",
        created_at: "2024-01-01T00:00:00Z",
      };
      const result = BadAssetHistoryItemSchema.parse(item);
      expect(result.failure_reason_code).toBe("MONEY_WASTER");
    });

    it("accepts history item with metrics snapshot", () => {
      const item = {
        id: "hist-123",
        asset_id: "asset-456",
        asset_type: "DESCRIPTION",
        asset_text: "Bad description text",
        failure_reason_code: "CLICKBAIT",
        snapshot_impressions: 10000,
        snapshot_clicks: 500,
        snapshot_cost: 100000000,
        snapshot_conversions: 0,
        snapshot_ctr: 0.05,
        created_at: "2024-01-01T00:00:00Z",
      };
      const result = BadAssetHistoryItemSchema.parse(item);
      expect(result.snapshot_impressions).toBe(10000);
      expect(result.snapshot_conversions).toBe(0);
    });
  });

  describe("BadAssetHistoryResponseSchema", () => {
    it("accepts valid history response", () => {
      const response = {
        items: [
          {
            id: "hist-1",
            asset_id: "asset-1",
            asset_type: "HEADLINE",
            asset_text: "Bad 1",
            failure_reason_code: "ZOMBIE",
            created_at: "2024-01-01T00:00:00Z",
          },
          {
            id: "hist-2",
            asset_id: "asset-2",
            asset_type: "DESCRIPTION",
            asset_text: "Bad 2",
            failure_reason_code: "TREND_DROPPER",
            created_at: "2024-01-02T00:00:00Z",
          },
        ],
        total: 2,
      };
      const result = BadAssetHistoryResponseSchema.parse(response);
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it("accepts empty history", () => {
      const response = { items: [], total: 0 };
      const result = BadAssetHistoryResponseSchema.parse(response);
      expect(result.items).toHaveLength(0);
    });
  });

  describe("parseOptimizerResponse", () => {
    it("returns parsed data for valid input", () => {
      const validResponse = {
        id: "cpa-123",
        account_id: "acc-456",
        campaign_id: "camp-789",
        target_cpa_micros: 5000000,
        currency_code: "USD",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-15T12:00:00Z",
      };
      const result = parseOptimizerResponse(TargetCpaResponseSchema, validResponse, "getTargetCpa");
      expect(result.id).toBe("cpa-123");
    });

    it("throws with context for invalid input", () => {
      const invalidResponse = { invalid: "data" };
      expect(() =>
        parseOptimizerResponse(TargetCpaResponseSchema, invalidResponse, "getTargetCpa"),
      ).toThrow("Invalid optimizer response for getTargetCpa");
    });

    it("provides detailed error for missing fields", () => {
      const partialResponse = {
        id: "cpa-123",
        account_id: "acc-456",
        // Missing required fields
      };
      expect(() =>
        parseOptimizerResponse(TargetCpaResponseSchema, partialResponse, "getTargetCpa"),
      ).toThrow();
    });
  });
});
