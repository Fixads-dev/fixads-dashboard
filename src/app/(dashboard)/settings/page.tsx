import type { Metadata } from "next";
import { SettingsContent } from "./_components/settings-content";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings",
};

export default function SettingsPage() {
  return <SettingsContent />;
}
