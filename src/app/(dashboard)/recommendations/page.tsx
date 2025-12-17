import type { Metadata } from "next";
import { RecommendationsContent } from "./_components/recommendations-content";

export const metadata: Metadata = {
  title: "Recommendations",
  description: "View and apply Google's AI-powered recommendations to improve your campaigns",
};

export default function RecommendationsPage() {
  return <RecommendationsContent />;
}
