import type { Metadata } from "next";
import { SmartOptimizerContent } from "./_components/smart-optimizer-content";

export const metadata: Metadata = {
  title: "Smart Optimizer",
  description: "Automatically detect and fix underperforming assets",
};

export default function SmartOptimizerPage() {
  return <SmartOptimizerContent />;
}
