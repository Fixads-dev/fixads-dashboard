"use client";

import { ArrowRight, Building2, Megaphone, Sparkles, Type } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUser } from "@/features/auth";
import { ROUTES } from "@/shared/lib/constants";

const quickActions = [
  {
    title: "Connect Account",
    description: "Link your Google Ads account",
    href: ROUTES.ACCOUNTS,
    icon: Building2,
  },
  {
    title: "View Campaigns",
    description: "See all your PMax campaigns",
    href: ROUTES.CAMPAIGNS,
    icon: Megaphone,
  },
  {
    title: "Text Optimizer",
    description: "Improve your ad copy with AI",
    href: ROUTES.OPTIMIZER_TEXT,
    icon: Type,
  },
  {
    title: "Smart Optimizer",
    description: "Auto-detect and fix bad assets",
    href: ROUTES.OPTIMIZER_SMART,
    icon: Sparkles,
  },
];

export function DashboardContent() {
  const { data: user } = useCurrentUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your Google Ads optimization dashboard.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{action.title}</CardTitle>
                <action.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="flex items-center gap-1">
                  {action.description}
                  <ArrowRight className="h-3 w-3" />
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Follow these steps to optimize your campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
              <li>Connect your Google Ads account</li>
              <li>Select a Performance Max campaign</li>
              <li>Run the Text Optimizer to improve ad copy</li>
              <li>Use Smart Optimizer to find and fix underperforming assets</li>
              <li>Apply AI-suggested improvements</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest optimization runs</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No recent activity. Start by connecting an account and running your first
              optimization.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
