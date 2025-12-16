import type { Metadata } from "next";
import { SmartOptimizerContent } from "./_components/smart-optimizer-content";

export const metadata: Metadata = {
  title: "Smart Optimizer",
  description: "Generate optimized assets using Google Ads AI from your landing page",
};

export default function SmartOptimizerPage() {
  return <SmartOptimizerContent />;
}
