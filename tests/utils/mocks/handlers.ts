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
    return HttpResponse.json([
      {
        campaign_id: "22871798636",
        campaign_name: "Test Campaign",
        status: "ENABLED",
        impressions: 125000,
        clicks: 4500,
        cost_micros: 85000000,
        conversions: 125,
        ctr: 0.036,
        average_cpc: 18889,
        conversions_value: 12500,
      },
      {
        campaign_id: "22871798637",
        campaign_name: "Summer Sale PMax",
        status: "ENABLED",
        impressions: 85000,
        clicks: 2800,
        cost_micros: 52000000,
        conversions: 78,
        ctr: 0.033,
        average_cpc: 18571,
        conversions_value: 7800,
      },
      {
        campaign_id: "22871798638",
        campaign_name: "Brand Awareness",
        status: "PAUSED",
        impressions: 45000,
        clicks: 1200,
        cost_micros: 22000000,
        conversions: 32,
        ctr: 0.027,
        average_cpc: 18333,
        conversions_value: 3200,
      },
    ]);
  }),

  // Campaign Detail (GAQL query)
  http.post(`${API_URL}/google-ads/query`, () => {
    return HttpResponse.json({
      rows: [
        {
          "campaign.id": "22871798636",
          "campaign.name": "Test Campaign",
          "campaign.status": "ENABLED",
          "campaign.bidding_strategy_type": "MAXIMIZE_CONVERSIONS",
          "campaign.optimization_score": 0.85,
          "campaign.start_date": "2024-01-15",
          "campaign.end_date": null,
          "campaign_budget.amount_micros": 5000000,
          "metrics.impressions": 125000,
          "metrics.clicks": 4500,
          "metrics.cost_micros": 85000000,
          "metrics.ctr": 0.036,
          "metrics.average_cpc": 18889,
          "metrics.average_cpm": 680000,
          "metrics.conversions": 125,
          "metrics.conversions_value": 12500,
          "metrics.cost_per_conversion": 680000,
          "metrics.all_conversions": 142,
          "metrics.all_conversions_value": 14200,
          "metrics.view_through_conversions": 17,
          "metrics.search_impression_share": 0.72,
          "metrics.search_budget_lost_impression_share": 0.08,
          "metrics.search_rank_lost_impression_share": 0.12,
          "metrics.search_absolute_top_impression_share": 0.45,
          "metrics.search_top_impression_share": 0.65,
          "metrics.content_impression_share": 0.68,
          "metrics.interactions": 4500,
          "metrics.interaction_rate": 0.036,
          "metrics.engagements": 320,
          "metrics.engagement_rate": 0.0026,
          "metrics.invalid_clicks": 12,
          "metrics.invalid_click_rate": 0.0027,
          "segments.date": "2024-01-15",
        },
      ],
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
          asset_type: "LONG_HEADLINE",
          text: "AI Generated Long Headline - Quality Products at Great Prices",
          char_count: 61,
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
