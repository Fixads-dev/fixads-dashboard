import type { Metadata } from "next";
import { SearchTermsContent } from "./_components/search-terms-content";

export const metadata: Metadata = {
  title: "Search Terms | FixAds",
  description: "View search queries that triggered your Google Ads",
};

export default function SearchTermsPage() {
  return <SearchTermsContent />;
}
