import type { Metadata } from "next";
import { ConversionsContent } from "./_components/conversions-content";

export const metadata: Metadata = {
  title: "Conversions | FixAds",
  description: "View conversion tracking configuration for your Google Ads account",
};

export default function ConversionsPage() {
  return <ConversionsContent />;
}
