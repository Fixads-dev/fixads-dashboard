import { HttpResponse, http } from "msw";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const handlers = [
  // Auth handlers
  http.get(`${API_URL}/auth/v1/me`, () => {
    return HttpResponse.json({
      id: "user-1",
      email: "test@example.com",
      displayName: "Test User",
      photoUrl: null,
      isActive: true,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    });
  }),

  http.post(`${API_URL}/auth/v1/refresh`, () => {
    return HttpResponse.json({
      access_token: "new-access-token",
      refresh_token: "new-refresh-token",
      token_type: "bearer",
      expires_in: 3600,
    });
  }),

  http.post(`${API_URL}/auth/v1/logout`, () => {
    return HttpResponse.json({ message: "Logged out successfully" });
  }),

  // Google Ads OAuth handlers
  http.post(`${API_URL}/google-ads/oauth/start`, () => {
    return HttpResponse.json({
      auth_url: "https://accounts.google.com/oauth/authorize?...",
    });
  }),

  // Accounts handlers
  http.get(`${API_URL}/google-ads/accounts`, () => {
    return HttpResponse.json({
      items: [
        {
          id: "account-1",
          customerId: "123-456-7890",
          descriptiveName: "Test Account",
          currencyCode: "USD",
          timeZone: "America/New_York",
          isConnected: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });
  }),

  // Campaigns handlers
  http.get(`${API_URL}/google-ads/pmax/campaigns`, () => {
    return HttpResponse.json({
      items: [
        {
          id: "campaign-1",
          name: "Test Campaign",
          status: "ENABLED",
          budget: 100.0,
          metrics: {
            impressions: 10000,
            clicks: 500,
            cost: 50.0,
            conversions: 10,
          },
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });
  }),

  // Text Optimizer handlers (bad asset detection + AI replacement)
  http.post(`${API_URL}/google-ads/pmax/text-optimizer/analyze`, () => {
    return HttpResponse.json({
      optimization_run_id: "run-1",
      campaign_id: "campaign-1",
      campaign_name: "Test Campaign",
      asset_group_id: "ag-1",
      asset_group_name: "Asset Group 1",
      assets_to_remove: [
        {
          asset_id: "asset-1",
          asset_type: "HEADLINE",
          text: "Bad headline",
          reason_code: "ZOMBIE",
          severity_score: 0.8,
          metrics: {
            impressions: 5,
            clicks: 0,
            cost_micros: 0,
            conversions: 0,
            age_days: 7,
          },
        },
      ],
      assets_to_add: [
        {
          asset_type: "HEADLINE",
          text: "Better headline",
          category: "Scarcity",
          char_count: 15,
          compliance_passed: true,
          language: "en",
        },
      ],
      summary: {
        total_assets_analyzed: 10,
        bad_assets_found: 1,
        assets_to_remove: 1,
        assets_to_add: 3,
        compliance_passed: 3,
        compliance_failed: 0,
        bad_history_used: 0,
        target_cpa_micros: 5000000,
      },
    });
  }),

  http.post(`${API_URL}/google-ads/pmax/text-optimizer/apply`, () => {
    return HttpResponse.json({
      assets_removed: 1,
      assets_created: 3,
      bad_assets_logged: 1,
      errors: [],
    });
  }),

  // Smart Optimizer handlers (AssetGenerationService - URL based)
  http.post(`${API_URL}/google-ads/pmax/smart-optimizer/analyze`, () => {
    return HttpResponse.json({
      optimization_run_id: "run-2",
      campaign_id: "campaign-1",
      campaign_name: "Test Campaign",
      asset_group_id: "ag-1",
      asset_group_name: "Asset Group 1",
      generated_assets: [
        {
          asset_type: "HEADLINE",
          text: "AI Generated Headline from URL",
          char_count: 28,
          compliance_passed: true,
          compliance_issues: [],
        },
        {
          asset_type: "DESCRIPTION",
          text: "AI Generated Description from landing page analysis",
          char_count: 52,
          compliance_passed: true,
          compliance_issues: [],
        },
      ],
      assets_to_remove: [
        {
          asset_id: "asset-zombie-1",
          asset_group_asset_resource_name: "customers/123/assetGroupAssets/456~789",
          text: "Old zombie headline",
          asset_type: "HEADLINE",
          reason_code: "ZOMBIE",
          reason_label: "Dead on Arrival",
          severity_score: 0.85,
          details:
            "Asset is 10 days old with only 5 impressions. Threshold: >5 days AND <10 impressions.",
          metrics: {
            impressions: 5,
            clicks: 0,
            cost_micros: 0,
            conversions: 0,
            age_days: 10,
          },
        },
      ],
      summary: {
        total_assets_analyzed: 10,
        generated_headlines: 3,
        generated_descriptions: 2,
        bad_assets_found: 1,
        compliance_passed: 5,
        compliance_failed: 0,
      },
    });
  }),

  http.post(`${API_URL}/google-ads/pmax/smart-optimizer/apply`, () => {
    return HttpResponse.json({
      optimization_run_id: "run-2",
      assets_removed: 1,
      assets_created: 5,
      bad_assets_logged: 1,
      errors: [],
    });
  }),

  http.post(`${API_URL}/google-ads/compliance/check`, () => {
    return HttpResponse.json({
      isCompliant: true,
      violations: [],
    });
  }),
];
