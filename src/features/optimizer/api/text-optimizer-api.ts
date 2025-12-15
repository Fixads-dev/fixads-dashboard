import { apiMethods } from "@/shared/api";
import type {
  ComplianceCheckRequest,
  ComplianceCheckResponse,
  TextOptimizerApplyRequest,
  TextOptimizerApplyResponse,
  TextOptimizerRequest,
  TextOptimizerResponse,
} from "../types";

const GOOGLE_ADS_PATH = "google-ads";

export const textOptimizerApi = {
  /**
   * Analyze campaign assets and get AI suggestions
   * POST /google-ads/pmax/text-optimizer/analyze?account_id=UUID
   */
  analyze: (accountId: string, request: TextOptimizerRequest) =>
    apiMethods.post<TextOptimizerResponse>(
      `${GOOGLE_ADS_PATH}/pmax/text-optimizer/analyze?account_id=${accountId}`,
      request,
    ),

  /**
   * Apply selected text changes to assets
   * POST /google-ads/pmax/text-optimizer/apply?account_id=UUID
   */
  applyChanges: (accountId: string, request: TextOptimizerApplyRequest) =>
    apiMethods.post<TextOptimizerApplyResponse>(
      `${GOOGLE_ADS_PATH}/pmax/text-optimizer/apply?account_id=${accountId}`,
      request,
    ),

  /**
   * Check text compliance with Google Ads policies
   * POST /google-ads/compliance/check
   */
  checkCompliance: (request: ComplianceCheckRequest) =>
    apiMethods.post<ComplianceCheckResponse>(`${GOOGLE_ADS_PATH}/compliance/check`, request),
};
