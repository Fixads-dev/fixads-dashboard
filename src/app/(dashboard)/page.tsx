import type { Metadata } from "next";
import { DashboardContent } from "./_components/dashboard-content";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of your Google Ads performance",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
