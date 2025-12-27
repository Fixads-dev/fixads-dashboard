import type { Metadata } from "next";
import { AlertsContent } from "./_components/alerts-content";

export const metadata: Metadata = {
  title: "Alerts | Fixads",
  description: "Manage your alert rules and notification preferences",
};

export default function AlertsPage() {
  return <AlertsContent />;
}
