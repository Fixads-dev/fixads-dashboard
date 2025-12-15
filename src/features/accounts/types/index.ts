import type { PaginatedResponse, WithId, WithTimestamps } from "@/shared/types";

export interface GoogleAdsAccount extends WithId, WithTimestamps {
  customerId: string;
  descriptiveName: string;
  currencyCode: string;
  timeZone: string;
  isConnected: boolean;
  isManager: boolean;
  canManageClients: boolean;
}

export interface AccountMetrics {
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  ctr: number;
  cpc: number;
  conversionRate: number;
}

export interface AccountWithMetrics extends GoogleAdsAccount {
  metrics?: AccountMetrics;
}

export type AccountsResponse = PaginatedResponse<GoogleAdsAccount>;

export interface ConnectAccountResponse {
  auth_url: string;
  state: string;
}

export interface GoogleAdsOAuthCallbackParams {
  code: string;
  state: string;
}
