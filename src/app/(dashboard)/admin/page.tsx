import type { Metadata } from "next";
import { AdminContent } from "./_components/admin-content";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Manage users and system settings",
};

export default function AdminPage() {
  return <AdminContent />;
}
