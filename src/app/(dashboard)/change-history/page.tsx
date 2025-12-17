import type { Metadata } from "next";
import { ChangeHistoryContent } from "./_components/change-history-content";

export const metadata: Metadata = {
  title: "Change History | FixAds",
  description: "View audit log of changes to your Google Ads account",
};

export default function ChangeHistoryPage() {
  return <ChangeHistoryContent />;
}
