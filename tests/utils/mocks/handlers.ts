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

  // Optimizer handlers
  http.post(`${API_URL}/google-ads/pmax/text-optimizer/analyze`, () => {
    return HttpResponse.json({
      runId: "run-1",
      status: "completed",
      suggestions: [
        {
          id: "suggestion-1",
          assetId: "asset-1",
          originalText: "Original text",
          suggestedText: "Improved text",
          improvementType: "clarity",
          confidenceScore: 0.95,
        },
      ],
    });
  }),

  http.post(`${API_URL}/google-ads/pmax/smart-optimizer/analyze`, () => {
    return HttpResponse.json({
      runId: "run-2",
      status: "completed",
      badAssets: [
        {
          id: "asset-1",
          classification: "ZOMBIE",
          reason: "Low impressions over 5 days",
          metrics: {
            impressions: 5,
            clicks: 0,
            age: 7,
          },
        },
      ],
    });
  }),

  http.post(`${API_URL}/google-ads/compliance/check`, () => {
    return HttpResponse.json({
      isCompliant: true,
      violations: [],
    });
  }),
];
