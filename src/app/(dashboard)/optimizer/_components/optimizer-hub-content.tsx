"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Globe,
  History,
  Link as LinkIcon,
  Loader2,
  Skull,
  Sparkles,
  TrendingDown,
  Type,
  Wand2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccounts } from "@/features/accounts";
import { type BadAssetClassification, useBadAssetHistory } from "@/features/optimizer";
import { ROUTES } from "@/shared/lib/constants";
import { formatDate } from "@/shared/lib/format";

const CLASSIFICATION_CONFIG: Record<
  BadAssetClassification,
  { label: string; icon: typeof Skull; color: string; description: string }
> = {
  ZOMBIE: {
    label: "Zombie",
    icon: Skull,
    color: "text-gray-500",
    description: "Low impressions over time",
  },
  MONEY_WASTER: {
    label: "Money Waster",
    icon: AlertTriangle,
    color: "text-red-500",
    description: "High cost, no conversions",
  },
  CLICKBAIT: {
    label: "Clickbait",
    icon: Zap,
    color: "text-yellow-500",
    description: "Clicks but poor conversion",
  },
  TREND_DROPPER: {
    label: "Trend Dropper",
    icon: TrendingDown,
    color: "text-orange-500",
    description: "Declining performance",
  },
};

const OPTIMIZER_FEATURES = {
  text: [
    "Detect underperforming assets (ZOMBIE, MONEY_WASTER, CLICKBAIT, TREND_DROPPER)",
    "Generate AI replacements with Gemini 2.0",
    "Multi-language support (EN, DE, HE, RU)",
    "Google Ads compliance checking",
    "Bad asset memory to prevent regenerating failures",
  ],
  smart: [
    "Generate assets from landing page URL",
    "AI crawls page content automatically",
    "Headlines, descriptions, and long headlines",
    "Custom instructions and keywords",
    "Simultaneous bad asset detection",
  ],
};

export function OptimizerHubContent() {
  const { data: accounts, isPending: isLoadingAccounts } = useAccounts();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  // Auto-select first account
  const accountId = selectedAccountId || accounts?.[0]?.id || "";

  const {
    data: badAssetHistory,
    isPending: isLoadingHistory,
    isError: isHistoryError,
  } = useBadAssetHistory(accountId);

  const hasAccounts = accounts && accounts.length > 0;
  const recentBadAssets = badAssetHistory?.items?.slice(0, 5) ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Optimizer Hub</h1>
          <p className="text-muted-foreground">
            AI-powered tools to detect and fix underperforming ad assets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={ROUTES.OPTIMIZER_HISTORY}>
              <History className="mr-2 h-4 w-4" />
              Run History
            </Link>
          </Button>
          {isLoadingAccounts ? (
            <Skeleton className="h-10 w-48" />
          ) : hasAccounts ? (
            <Select value={accountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.descriptive_name || account.customer_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>
      </div>

      {/* Optimizer Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Text Optimizer Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
          <CardHeader className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <Type className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <CardTitle>Text Optimizer</CardTitle>
                <CardDescription>Detect bad assets + AI replacements</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <p className="text-sm text-muted-foreground">
              Analyze your PMax text assets to find underperformers and generate AI-powered
              replacements using Google Gemini 2.0.
            </p>
            <ul className="space-y-2 text-sm">
              {OPTIMIZER_FEATURES.text.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1">
                <Globe className="h-3 w-3" />
                Multi-language
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Sparkles className="h-3 w-3" />
                Gemini 2.0
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="relative">
            <Button asChild className="w-full">
              <Link href={ROUTES.OPTIMIZER_TEXT}>
                <Type className="mr-2 h-4 w-4" />
                Open Text Optimizer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Smart Optimizer Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
          <CardHeader className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                <Wand2 className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <CardTitle>Smart Optimizer</CardTitle>
                <CardDescription>Generate from landing page URL</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter your landing page URL and let Google Ads AI generate optimized headlines and
              descriptions automatically.
            </p>
            <ul className="space-y-2 text-sm">
              {OPTIMIZER_FEATURES.smart.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-purple-500 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1">
                <LinkIcon className="h-3 w-3" />
                URL Crawling
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Wand2 className="h-3 w-3" />
                Google Ads AI
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="relative">
            <Button asChild variant="secondary" className="w-full">
              <Link href={ROUTES.OPTIMIZER_SMART}>
                <Wand2 className="mr-2 h-4 w-4" />
                Open Smart Optimizer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Classification Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bad Asset Classifications</CardTitle>
          <CardDescription>
            Learn how our AI identifies underperforming assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(CLASSIFICATION_CONFIG) as BadAssetClassification[]).map((key) => {
              const config = CLASSIFICATION_CONFIG[key];
              const Icon = config.icon;
              return (
                <div key={key} className="flex items-start gap-3 rounded-lg border p-3">
                  <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${config.color}`} />
                  <div>
                    <p className="font-medium text-sm">{config.label}</p>
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Bad Asset History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">Recent Bad Assets</CardTitle>
            <CardDescription>Assets flagged and removed from your campaigns</CardDescription>
          </div>
          {hasAccounts && (
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              Last 10
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {!hasAccounts ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground/30" />
              <p className="mt-2 text-sm text-muted-foreground">
                Connect a Google Ads account to see bad asset history
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link href={ROUTES.ACCOUNTS}>Connect Account</Link>
              </Button>
            </div>
          ) : isLoadingHistory ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : isHistoryError ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                Failed to load bad asset history
              </p>
            </div>
          ) : recentBadAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500/50" />
              <p className="mt-2 text-sm font-medium">No bad assets detected yet</p>
              <p className="text-xs text-muted-foreground">
                Run an optimization to start detecting underperforming assets
              </p>
              <div className="mt-4 flex gap-2">
                <Button asChild size="sm">
                  <Link href={ROUTES.OPTIMIZER_TEXT}>
                    <Type className="mr-2 h-4 w-4" />
                    Text Optimizer
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={ROUTES.OPTIMIZER_SMART}>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Smart Optimizer
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBadAssets.map((item) => {
                const config = CLASSIFICATION_CONFIG[item.failure_reason_code];
                const Icon = config?.icon ?? AlertTriangle;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${config?.color ?? "text-gray-500"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {item.asset_type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {config?.label ?? item.failure_reason_code}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(item.created_at, "MMM d, yyyy")}
                        </span>
                      </div>
                      <p className="mt-1 text-sm truncate" title={item.asset_text}>
                        {item.asset_text}
                      </p>
                      {(item.snapshot_impressions !== undefined ||
                        item.snapshot_clicks !== undefined) && (
                        <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                          {item.snapshot_impressions !== undefined && (
                            <span>{item.snapshot_impressions.toLocaleString()} impr</span>
                          )}
                          {item.snapshot_clicks !== undefined && (
                            <span>{item.snapshot_clicks.toLocaleString()} clicks</span>
                          )}
                          {item.snapshot_ctr !== undefined && (
                            <span>{(item.snapshot_ctr * 100).toFixed(2)}% CTR</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Optimization Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">1.</span>
              <span>Run Text Optimizer weekly to catch underperforming assets early</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              <span>Use Smart Optimizer when launching new landing pages</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">3.</span>
              <span>Review compliance issues before applying changes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">4.</span>
              <span>Set target CPA to improve bad asset detection accuracy</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
