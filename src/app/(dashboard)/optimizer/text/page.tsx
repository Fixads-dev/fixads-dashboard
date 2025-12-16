import type { Metadata } from "next";
import { TextOptimizerContent } from "./_components/text-optimizer-content";

export const metadata: Metadata = {
  title: "Text Optimizer",
  description: "Detect and fix underperforming assets with AI-powered suggestions",
};

export default function TextOptimizerPage() {
  return <TextOptimizerContent />;
}
