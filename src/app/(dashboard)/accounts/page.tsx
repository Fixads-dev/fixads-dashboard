import type { Metadata } from "next";
import { AccountsContent } from "./_components/accounts-content";

export const metadata: Metadata = {
  title: "Accounts",
  description: "Manage your connected Google Ads accounts",
};

export default function AccountsPage() {
  return <AccountsContent />;
}
