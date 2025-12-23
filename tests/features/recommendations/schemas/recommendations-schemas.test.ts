import { describe, expect, it } from "vitest";
import {
  ApplyRecommendationResponseSchema,
  ApplyRecommendationsBatchResponseSchema,
  DismissRecommendationResponseSchema,
  DismissRecommendationsBatchResponseSchema,
  parseRecommendationResponse,
  RecommendationImpactMetricsSchema,
  RecommendationImpactSchema,
  RecommendationSchema,
  RecommendationsResponseSchema,
  RecommendationTypeSchema,
} from "@/features/recommendations/schemas/recommendations-schemas";

describe("Recommendations Schemas", () => {
  describe("RecommendationTypeSchema", () => {
    it("accepts common recommendation types", () => {
      expect(RecommendationTypeSchema.parse("CAMPAIGN_BUDGET")).toBe("CAMPAIGN_BUDGET");
      expect(RecommendationTypeSchema.parse("KEYWORD")).toBe("KEYWORD");
      expect(RecommendationTypeSchema.parse("TARGET_CPA_OPT_IN")).toBe("TARGET_CPA_OPT_IN");
      expect(RecommendationTypeSchema.parse("RESPONSIVE_SEARCH_AD")).toBe("RESPONSIVE_SEARCH_AD");
    });

    it("accepts Performance Max types", () => {
      expect(RecommendationTypeSchema.parse("PERFORMANCE_MAX_OPT_IN")).toBe(
        "PERFORMANCE_MAX_OPT_IN",
      );
      expect(RecommendationTypeSchema.parse("IMPROVE_PERFORMANCE_MAX_AD_STRENGTH")).toBe(
        "IMPROVE_PERFORMANCE_MAX_AD_STRENGTH",
      );
      expect(
        RecommendationTypeSchema.parse("UPGRADE_SMART_SHOPPING_CAMPAIGN_TO_PERFORMANCE_MAX"),
      ).toBe("UPGRADE_SMART_SHOPPING_CAMPAIGN_TO_PERFORMANCE_MAX");
    });

    it("accepts shopping types", () => {
      expect(RecommendationTypeSchema.parse("SHOPPING_ADD_AGE_GROUP")).toBe(
        "SHOPPING_ADD_AGE_GROUP",
      );
      expect(RecommendationTypeSchema.parse("SHOPPING_ADD_GTIN")).toBe("SHOPPING_ADD_GTIN");
      expect(RecommendationTypeSchema.parse("SHOPPING_FIX_DISAPPROVED_PRODUCTS")).toBe(
        "SHOPPING_FIX_DISAPPROVED_PRODUCTS",
      );
    });

    it("accepts unknown types for forward compatibility", () => {
      expect(RecommendationTypeSchema.parse("UNKNOWN")).toBe("UNKNOWN");
      expect(RecommendationTypeSchema.parse("UNSPECIFIED")).toBe("UNSPECIFIED");
    });

    it("rejects invalid types", () => {
      expect(() => RecommendationTypeSchema.parse("NOT_A_TYPE")).toThrow();
      expect(() => RecommendationTypeSchema.parse("campaign_budget")).toThrow();
    });
  });

  describe("RecommendationImpactMetricsSchema", () => {
    it("accepts valid metrics", () => {
      const metrics = {
        impressions: 10000,
        clicks: 500,
        cost_micros: 50000000,
        conversions: 25,
      };
      const result = RecommendationImpactMetricsSchema.parse(metrics);
      expect(result.impressions).toBe(10000);
      expect(result.conversions).toBe(25);
    });

    it("accepts zero values", () => {
      const metrics = {
        impressions: 0,
        clicks: 0,
        cost_micros: 0,
        conversions: 0,
      };
      expect(RecommendationImpactMetricsSchema.parse(metrics)).toEqual(metrics);
    });

    it("rejects missing fields", () => {
      expect(() =>
        RecommendationImpactMetricsSchema.parse({
          impressions: 1000,
          clicks: 50,
        }),
      ).toThrow();
    });
  });

  describe("RecommendationImpactSchema", () => {
    const validImpact = {
      base_metrics: {
        impressions: 10000,
        clicks: 500,
        cost_micros: 50000000,
        conversions: 25,
      },
      potential_metrics: {
        impressions: 15000,
        clicks: 750,
        cost_micros: 55000000,
        conversions: 40,
      },
    };

    it("accepts valid impact data", () => {
      const result = RecommendationImpactSchema.parse(validImpact);
      expect(result.base_metrics.impressions).toBe(10000);
      expect(result.potential_metrics.impressions).toBe(15000);
    });

    it("calculates potential uplift correctly", () => {
      const result = RecommendationImpactSchema.parse(validImpact);
      const conversionUplift =
        result.potential_metrics.conversions - result.base_metrics.conversions;
      expect(conversionUplift).toBe(15);
    });
  });

  describe("RecommendationSchema", () => {
    const validRecommendation = {
      recommendation_id: "rec-123",
      resource_name: "customers/123/recommendations/456",
      type: "CAMPAIGN_BUDGET",
      campaign_id: "camp-789",
      campaign_name: "Test Campaign",
      ad_group_id: null,
      dismissed: false,
      impact: {
        base_metrics: {
          impressions: 10000,
          clicks: 500,
          cost_micros: 50000000,
          conversions: 25,
        },
        potential_metrics: {
          impressions: 15000,
          clicks: 750,
          cost_micros: 55000000,
          conversions: 40,
        },
      },
      details: {
        recommended_budget_micros: 100000000,
        current_budget_micros: 50000000,
      },
    };

    it("accepts valid recommendation", () => {
      const result = RecommendationSchema.parse(validRecommendation);
      expect(result.recommendation_id).toBe("rec-123");
      expect(result.type).toBe("CAMPAIGN_BUDGET");
      expect(result.dismissed).toBe(false);
    });

    it("accepts recommendation with null campaign info", () => {
      const recWithNulls = {
        ...validRecommendation,
        campaign_id: null,
        campaign_name: null,
      };
      const result = RecommendationSchema.parse(recWithNulls);
      expect(result.campaign_id).toBeNull();
      expect(result.campaign_name).toBeNull();
    });

    it("accepts recommendation with null impact", () => {
      const recWithoutImpact = {
        ...validRecommendation,
        impact: null,
      };
      const result = RecommendationSchema.parse(recWithoutImpact);
      expect(result.impact).toBeNull();
    });

    it("accepts various detail structures", () => {
      const keywordRec = {
        ...validRecommendation,
        type: "KEYWORD",
        details: {
          keyword: "test keyword",
          match_type: "BROAD",
          recommended_cpc_micros: 1500000,
        },
      };
      const result = RecommendationSchema.parse(keywordRec);
      expect(result.details.keyword).toBe("test keyword");
    });

    it("accepts dismissed recommendation", () => {
      const dismissedRec = {
        ...validRecommendation,
        dismissed: true,
      };
      const result = RecommendationSchema.parse(dismissedRec);
      expect(result.dismissed).toBe(true);
    });
  });

  describe("RecommendationsResponseSchema", () => {
    it("accepts valid response with recommendations", () => {
      const response = {
        recommendations: [
          {
            recommendation_id: "rec-1",
            resource_name: "customers/123/recommendations/1",
            type: "CAMPAIGN_BUDGET",
            campaign_id: "camp-1",
            campaign_name: "Campaign 1",
            ad_group_id: null,
            dismissed: false,
            impact: null,
            details: {},
          },
          {
            recommendation_id: "rec-2",
            resource_name: "customers/123/recommendations/2",
            type: "KEYWORD",
            campaign_id: "camp-2",
            campaign_name: "Campaign 2",
            ad_group_id: "ag-1",
            dismissed: false,
            impact: null,
            details: { keyword: "test" },
          },
        ],
        total_count: 2,
      };
      const result = RecommendationsResponseSchema.parse(response);
      expect(result.recommendations).toHaveLength(2);
      expect(result.total_count).toBe(2);
    });

    it("accepts empty recommendations list", () => {
      const response = {
        recommendations: [],
        total_count: 0,
      };
      const result = RecommendationsResponseSchema.parse(response);
      expect(result.recommendations).toHaveLength(0);
    });

    it("rejects invalid recommendation in list", () => {
      const response = {
        recommendations: [{ invalid: "rec" }],
        total_count: 1,
      };
      expect(() => RecommendationsResponseSchema.parse(response)).toThrow();
    });
  });

  describe("ApplyRecommendationResponseSchema", () => {
    it("accepts successful apply response", () => {
      const response = {
        recommendation_id: "rec-123",
        success: true,
        resource_name: "customers/123/campaigns/456",
        error_message: null,
      };
      const result = ApplyRecommendationResponseSchema.parse(response);
      expect(result.success).toBe(true);
      expect(result.error_message).toBeNull();
    });

    it("accepts failed apply response", () => {
      const response = {
        recommendation_id: "rec-123",
        success: false,
        resource_name: null,
        error_message: "Insufficient budget to apply recommendation",
      };
      const result = ApplyRecommendationResponseSchema.parse(response);
      expect(result.success).toBe(false);
      expect(result.error_message).toBe("Insufficient budget to apply recommendation");
    });
  });

  describe("ApplyRecommendationsBatchResponseSchema", () => {
    it("accepts successful batch response", () => {
      const response = {
        results: [
          {
            recommendation_id: "rec-1",
            success: true,
            resource_name: "customers/123/campaigns/1",
            error_message: null,
          },
          {
            recommendation_id: "rec-2",
            success: true,
            resource_name: "customers/123/campaigns/2",
            error_message: null,
          },
        ],
        total_applied: 2,
        total_failed: 0,
      };
      const result = ApplyRecommendationsBatchResponseSchema.parse(response);
      expect(result.total_applied).toBe(2);
      expect(result.total_failed).toBe(0);
    });

    it("accepts partial success batch response", () => {
      const response = {
        results: [
          {
            recommendation_id: "rec-1",
            success: true,
            resource_name: "customers/123/campaigns/1",
            error_message: null,
          },
          {
            recommendation_id: "rec-2",
            success: false,
            resource_name: null,
            error_message: "Failed to apply",
          },
        ],
        total_applied: 1,
        total_failed: 1,
      };
      const result = ApplyRecommendationsBatchResponseSchema.parse(response);
      expect(result.total_applied).toBe(1);
      expect(result.total_failed).toBe(1);
    });
  });

  describe("DismissRecommendationResponseSchema", () => {
    it("accepts successful dismiss response", () => {
      const response = {
        recommendation_id: "rec-123",
        success: true,
        error_message: null,
      };
      const result = DismissRecommendationResponseSchema.parse(response);
      expect(result.success).toBe(true);
    });

    it("accepts failed dismiss response", () => {
      const response = {
        recommendation_id: "rec-123",
        success: false,
        error_message: "Recommendation already applied",
      };
      const result = DismissRecommendationResponseSchema.parse(response);
      expect(result.success).toBe(false);
      expect(result.error_message).toBe("Recommendation already applied");
    });
  });

  describe("DismissRecommendationsBatchResponseSchema", () => {
    it("accepts successful batch dismiss response", () => {
      const response = {
        results: [
          {
            recommendation_id: "rec-1",
            success: true,
            error_message: null,
          },
          {
            recommendation_id: "rec-2",
            success: true,
            error_message: null,
          },
        ],
        total_dismissed: 2,
        total_failed: 0,
      };
      const result = DismissRecommendationsBatchResponseSchema.parse(response);
      expect(result.total_dismissed).toBe(2);
      expect(result.total_failed).toBe(0);
    });

    it("accepts empty batch response", () => {
      const response = {
        results: [],
        total_dismissed: 0,
        total_failed: 0,
      };
      const result = DismissRecommendationsBatchResponseSchema.parse(response);
      expect(result.results).toHaveLength(0);
    });
  });

  describe("parseRecommendationResponse", () => {
    it("returns parsed data for valid input", () => {
      const validResponse = {
        recommendations: [],
        total_count: 0,
      };
      const result = parseRecommendationResponse(
        RecommendationsResponseSchema,
        validResponse,
        "listRecommendations",
      );
      expect(result.total_count).toBe(0);
    });

    it("throws with context for invalid input", () => {
      const invalidResponse = { invalid: "data" };
      expect(() =>
        parseRecommendationResponse(
          RecommendationsResponseSchema,
          invalidResponse,
          "listRecommendations",
        ),
      ).toThrow("Invalid recommendation response for listRecommendations");
    });

    it("works with apply response schema", () => {
      const response = {
        recommendation_id: "rec-123",
        success: true,
        resource_name: "test",
        error_message: null,
      };
      const result = parseRecommendationResponse(
        ApplyRecommendationResponseSchema,
        response,
        "applyRecommendation",
      );
      expect(result.recommendation_id).toBe("rec-123");
    });

    it("throws for type mismatches", () => {
      const response = {
        recommendation_id: 123, // Should be string
        success: "yes", // Should be boolean
        resource_name: null,
        error_message: null,
      };
      expect(() =>
        parseRecommendationResponse(
          ApplyRecommendationResponseSchema,
          response,
          "applyRecommendation",
        ),
      ).toThrow();
    });
  });
});
