// Types

// API
export { recommendationsApi } from "./api/recommendations-api";
// Components
export {
  ApplyRecommendationDialog,
  CampaignRecommendationsWidget,
  RecommendationCard,
  RecommendationCategoryBadge,
  RecommendationDetailPanel,
  RecommendationList,
  RecommendationTypeBadge,
} from "./components";

// Hooks
export {
  useApplyRecommendation,
  useApplyRecommendationsBatch,
  useCampaignRecommendations,
  useCampaignRecommendationsSummary,
  useDismissRecommendation,
  useDismissRecommendationsBatch,
  useRecommendation,
  useRecommendations,
} from "./hooks";
export * from "./types";
