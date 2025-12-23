import { api } from "@/shared/api";
import {
  parseOptimizerResponse,
  SmartOptimizerApplyResponseSchema,
  SmartOptimizerResponseSchema,
} from "../schemas/optimizer-schemas";
import type {
  SmartOptimizerApplyRequest,
  SmartOptimizerApplyResponse,
  SmartOptimizerRequest,
  SmartOptimizerResponse,
} from "../types";

const GOOGLE_ADS_PATH = "google-ads/v1";

// Extended timeout for AssetGenerationService operations
const EXTENDED_TIMEOUT = 120000; // 2 minutes

export const smartOptimizerApi = {
  /**
   * Generate text assets using Google Ads API v22 AssetGenerationService
   * POST /google-ads/pmax/smart-optimizer/analyze?account_id=UUID
   * Uses extended timeout due to AssetGenerationService + bad asset detection
   */
  analyze: async (
    accountId: string,
    request: SmartOptimizerRequest,
  ): Promise<SmartOptimizerResponse> => {
    const rawResponse = await api<unknown>(
      `${GOOGLE_ADS_PATH}/pmax/smart-optimizer/analyze?account_id=${accountId}`,
      { method: "post", json: request, timeout: EXTENDED_TIMEOUT },
    );
    return parseOptimizerResponse(
      SmartOptimizerResponseSchema,
      rawResponse,
      "smartOptimizer.analyze",
    );
  },

  /**
   * Apply smart optimizer changes (add generated assets, remove bad assets)
   * POST /google-ads/pmax/smart-optimizer/apply?account_id=UUID
   * Uses extended timeout due to multiple Google Ads API calls
   */
  applyChanges: async (
    accountId: string,
    request: SmartOptimizerApplyRequest,
  ): Promise<SmartOptimizerApplyResponse> => {
    const rawResponse = await api<unknown>(
      `${GOOGLE_ADS_PATH}/pmax/smart-optimizer/apply?account_id=${accountId}`,
      { method: "post", json: request, timeout: EXTENDED_TIMEOUT },
    );
    return parseOptimizerResponse(
      SmartOptimizerApplyResponseSchema,
      rawResponse,
      "smartOptimizer.applyChanges",
    );
  },
};
