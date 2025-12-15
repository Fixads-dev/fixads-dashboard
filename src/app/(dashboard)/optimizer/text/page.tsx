import type { Metadata } from "next";
import { TextOptimizerContent } from "./_components/text-optimizer-content";

export const metadata: Metadata = {
  title: "Text Optimizer",
  description: "Improve your ad copy with AI-powered suggestions",
};

export default function TextOptimizerPage() {
  return <TextOptimizerContent />;
}
