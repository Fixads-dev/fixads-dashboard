import type { PaginatedResponse, WithId } from "@/shared/types";

export type CampaignStatus = "ENABLED" | "PAUSED" | "REMOVED";

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  ctr: number;
  cpc: number;
  conversionRate: number;
}

export interface Campaign extends WithId {
  name: string;
  status: CampaignStatus;
  budget: number;
  budgetType: "DAILY" | "TOTAL";
  accountId: string;
  metrics?: CampaignMetrics;
  assetGroupCount: number;
  lastSyncedAt?: string;
}

export interface AssetGroup extends WithId {
  name: string;
  status: CampaignStatus;
  campaignId: string;
  finalUrl: string;
  headlines: Asset[];
  descriptions: Asset[];
  longHeadlines: Asset[];
}

export type AssetType = "HEADLINE" | "DESCRIPTION" | "LONG_HEADLINE";
export type AssetPerformance = "BEST" | "GOOD" | "LOW" | "LEARNING" | "PENDING" | "UNSPECIFIED";

export interface Asset extends WithId {
  text: string;
  type: AssetType;
  performance: AssetPerformance;
  assetGroupId: string;
}

export type CampaignsResponse = PaginatedResponse<Campaign>;
export type AssetGroupsResponse = PaginatedResponse<AssetGroup>;

export interface CampaignFilters {
  accountId?: string;
  status?: CampaignStatus;
  search?: string;
}
