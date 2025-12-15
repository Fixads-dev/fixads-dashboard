import type { Metadata } from "next";
import { CampaignsContent } from "./_components/campaigns-content";

export const metadata: Metadata = {
  title: "Campaigns",
  description: "View and manage your Performance Max campaigns",
};

export default function CampaignsPage() {
  return <CampaignsContent />;
}
