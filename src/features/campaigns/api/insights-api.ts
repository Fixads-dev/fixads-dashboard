import { apiMethods } from "@/shared/api";
import type {
  AddSignalRequest,
  AudiencesResponse,
  AuctionInsightsResponse,
  CombinedAudience,
  DemographicsResponse,
  GeographicLevel,
  GeographicPerformanceResponse,
  PlacementsResponse,
  ProductGroupsResponse,
  ProductsResponse,
  SegmentedPerformanceResponse,
  SegmentType,
  SignalsResponse,
  SimulationsResponse,
  TimePerformanceResponse,
  TopCombinationsResponse,
  UserListsResponse,
} from "../types";

const GOOGLE_ADS_PATH = "google-ads/v1";

export const insightsApi = {
  // ==================== Placements ====================

  /**
   * Get PMax ad placements (where ads are shown)
   * GET /google-ads/pmax/campaigns/{campaign_id}/placements?account_id=UUID
   */
  getPlacements: (accountId: string, campaignId: string, limit: number = 100) =>
    apiMethods.get<PlacementsResponse>(
      `${GOOGLE_ADS_PATH}/pmax/campaigns/${campaignId}/placements?account_id=${accountId}&limit=${limit}`,
    ),

  // ==================== Top Combinations ====================

  /**
   * Get top-performing asset combinations for an asset group
   * GET /google-ads/pmax/asset-groups/{asset_group_id}/top-combinations?account_id=UUID
   */
  getTopCombinations: (accountId: string, assetGroupId: string) =>
    apiMethods.get<TopCombinationsResponse>(
      `${GOOGLE_ADS_PATH}/pmax/asset-groups/${assetGroupId}/top-combinations?account_id=${accountId}`,
    ),

  // ==================== Segmented Performance ====================

  /**
   * Get campaign performance segmented by device or network
   * GET /google-ads/pmax/campaigns/{campaign_id}/performance?account_id=UUID&segment_by=device|network
   */
  getSegmentedPerformance: (
    accountId: string,
    campaignId: string,
    segmentBy: SegmentType = "device",
  ) =>
    apiMethods.get<SegmentedPerformanceResponse>(
      `${GOOGLE_ADS_PATH}/pmax/campaigns/${campaignId}/performance?account_id=${accountId}&segment_by=${segmentBy}`,
    ),

  // ==================== Asset Group Signals ====================

  /**
   * Get signals (audience/search themes) for an asset group
   * GET /google-ads/pmax/asset-groups/{asset_group_id}/signals?account_id=UUID
   */
  getSignals: (accountId: string, assetGroupId: string) =>
    apiMethods.get<SignalsResponse>(
      `${GOOGLE_ADS_PATH}/pmax/asset-groups/${assetGroupId}/signals?account_id=${accountId}`,
    ),

  /**
   * Add a search theme signal to an asset group
   * POST /google-ads/pmax/asset-groups/{asset_group_id}/signals/search-theme?account_id=UUID
   */
  addSearchThemeSignal: (accountId: string, assetGroupId: string, searchTheme: string) =>
    apiMethods.post<{ signal_id: string; success: boolean }>(
      `${GOOGLE_ADS_PATH}/pmax/asset-groups/${assetGroupId}/signals/search-theme?account_id=${accountId}`,
      { search_theme: searchTheme },
    ),

  /**
   * Add an audience signal to an asset group
   * POST /google-ads/pmax/asset-groups/{asset_group_id}/signals/audience?account_id=UUID
   */
  addAudienceSignal: (accountId: string, assetGroupId: string, audienceId: string) =>
    apiMethods.post<{ signal_id: string; success: boolean }>(
      `${GOOGLE_ADS_PATH}/pmax/asset-groups/${assetGroupId}/signals/audience?account_id=${accountId}`,
      { audience_id: audienceId },
    ),

  /**
   * Remove a signal from an asset group
   * DELETE /google-ads/pmax/asset-groups/{asset_group_id}/signals/{signal_id}?account_id=UUID
   */
  removeSignal: (accountId: string, assetGroupId: string, signalId: string) =>
    apiMethods.delete<{ success: boolean }>(
      `${GOOGLE_ADS_PATH}/pmax/asset-groups/${assetGroupId}/signals/${signalId}?account_id=${accountId}`,
    ),

  // ==================== Shopping/Products ====================

  /**
   * Get product-level performance for shopping campaigns
   * GET /google-ads/pmax/campaigns/{campaign_id}/products?account_id=UUID
   */
  getProducts: (accountId: string, campaignId: string, limit: number = 100) =>
    apiMethods.get<ProductsResponse>(
      `${GOOGLE_ADS_PATH}/pmax/campaigns/${campaignId}/products?account_id=${accountId}&limit=${limit}`,
    ),

  /**
   * Get product groups for a campaign
   * GET /google-ads/pmax/campaigns/{campaign_id}/product-groups?account_id=UUID
   */
  getProductGroups: (accountId: string, campaignId: string) =>
    apiMethods.get<ProductGroupsResponse>(
      `${GOOGLE_ADS_PATH}/pmax/campaigns/${campaignId}/product-groups?account_id=${accountId}`,
    ),

  // ==================== Campaign Simulations ====================

  /**
   * Get budget/bid simulations for forecasting
   * GET /google-ads/pmax/campaigns/{campaign_id}/simulations?account_id=UUID
   */
  getSimulations: (accountId: string, campaignId: string) =>
    apiMethods.get<SimulationsResponse>(
      `${GOOGLE_ADS_PATH}/pmax/campaigns/${campaignId}/simulations?account_id=${accountId}`,
    ),

  // ==================== Audiences ====================

  /**
   * Get all audiences for an account
   * GET /google-ads/accounts/{customer_id}/audiences?account_id=UUID
   */
  getAudiences: (accountId: string, customerId: string) =>
    apiMethods.get<AudiencesResponse>(
      `${GOOGLE_ADS_PATH}/accounts/${customerId}/audiences?account_id=${accountId}`,
    ),

  /**
   * Get user lists (remarketing lists)
   * GET /google-ads/accounts/{customer_id}/user-lists?account_id=UUID
   */
  getUserLists: (accountId: string, customerId: string) =>
    apiMethods.get<UserListsResponse>(
      `${GOOGLE_ADS_PATH}/accounts/${customerId}/user-lists?account_id=${accountId}`,
    ),

  /**
   * Get combined audiences
   * GET /google-ads/accounts/{customer_id}/combined-audiences?account_id=UUID
   */
  getCombinedAudiences: (accountId: string, customerId: string) =>
    apiMethods.get<{ combined_audiences: CombinedAudience[] }>(
      `${GOOGLE_ADS_PATH}/accounts/${customerId}/combined-audiences?account_id=${accountId}`,
    ),

  // ==================== Demographics ====================

  /**
   * Get demographic performance breakdown
   * GET /google-ads/pmax/campaigns/{campaign_id}/demographics?account_id=UUID
   */
  getDemographics: (
    accountId: string,
    campaignId: string,
    dateRange: string = "LAST_30_DAYS",
  ) =>
    apiMethods.get<DemographicsResponse>(
      `${GOOGLE_ADS_PATH}/pmax/campaigns/${campaignId}/demographics?account_id=${accountId}&date_range=${dateRange}`,
    ),

  // ==================== Time Performance (Day/Hour Heatmap) ====================

  /**
   * Get time-based performance for heatmap visualization
   * GET /google-ads/pmax/campaigns/{campaign_id}/time-performance?account_id=UUID
   */
  getTimePerformance: (
    accountId: string,
    campaignId: string,
    dateRange: string = "LAST_30_DAYS",
  ) =>
    apiMethods.get<TimePerformanceResponse>(
      `${GOOGLE_ADS_PATH}/pmax/campaigns/${campaignId}/time-performance?account_id=${accountId}&date_range=${dateRange}`,
    ),

  // ==================== Auction Insights ====================

  /**
   * Get auction insights for competitor analysis
   * GET /google-ads/pmax/campaigns/{campaign_id}/auction-insights?account_id=UUID
   */
  getAuctionInsights: (
    accountId: string,
    campaignId: string,
    dateRange: string = "LAST_30_DAYS",
  ) =>
    apiMethods.get<AuctionInsightsResponse>(
      `${GOOGLE_ADS_PATH}/pmax/campaigns/${campaignId}/auction-insights?account_id=${accountId}&date_range=${dateRange}`,
    ),

  // ==================== Geographic Performance ====================

  /**
   * Get geographic performance with drill-down support
   * GET /google-ads/pmax/campaigns/{campaign_id}/geographic-performance?account_id=UUID
   */
  getGeographicPerformance: (
    accountId: string,
    campaignId: string,
    options: {
      level?: GeographicLevel;
      parentId?: string;
      dateRange?: string;
    } = {},
  ) => {
    const params = new URLSearchParams();
    params.set("account_id", accountId);
    if (options.level) params.set("level", options.level);
    if (options.parentId) params.set("parent_id", options.parentId);
    if (options.dateRange) params.set("date_range", options.dateRange);

    return apiMethods.get<GeographicPerformanceResponse>(
      `${GOOGLE_ADS_PATH}/pmax/campaigns/${campaignId}/geographic-performance?${params.toString()}`,
    );
  },
};
