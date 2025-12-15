import { apiMethods } from "@/shared/api";
import type {
  ApplyChangesRequest,
  ApplyChangesResponse,
  ComplianceCheckRequest,
  ComplianceCheckResponse,
  TextOptimizerRequest,
  TextOptimizerResponse,
} from "../types";

const GOOGLE_ADS_PATH = "google-ads";

export const textOptimizerApi = {
  /**
   * Analyze campaign assets and get AI suggestions
   */
  analyze: (request: TextOptimizerRequest) =>
    apiMethods.post<TextOptimizerResponse>(
      `${GOOGLE_ADS_PATH}/pmax/text-optimizer/analyze`,
      request,
    ),

  /**
   * Get status of an ongoing analysis
   */
  getStatus: (runId: string) =>
    apiMethods.get<TextOptimizerResponse>(`${GOOGLE_ADS_PATH}/pmax/text-optimizer/status/${runId}`),

  /**
   * Apply selected text changes to assets
   */
  applyChanges: (request: ApplyChangesRequest) =>
    apiMethods.post<ApplyChangesResponse>(`${GOOGLE_ADS_PATH}/pmax/text-optimizer/apply`, request),

  /**
   * Check text compliance with Google Ads policies
   */
  checkCompliance: (request: ComplianceCheckRequest) =>
    apiMethods.post<ComplianceCheckResponse>(`${GOOGLE_ADS_PATH}/compliance/check`, request),
};
