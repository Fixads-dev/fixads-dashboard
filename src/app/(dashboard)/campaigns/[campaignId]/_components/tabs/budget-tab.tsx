"use client";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Calendar,
  CircleDollarSign,
  Clock,
  DollarSign,
  Loader2,
  PiggyBank,
  RefreshCw,
  Save,
  Target,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { KPICard } from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { InfoBox } from "@/components/ui/info-box";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/ui/loading-state";
import { MetricLabel } from "@/components/ui/metric-label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Info } from "lucide-react";
import {
  useBudgetSpend,
  useCampaignBudget,
  useUpdateBudget,
} from "@/features/campaigns/hooks";
import type { BudgetDeliveryMethod, BudgetPacingStatus } from "@/features/campaigns/types";
import { formatCurrency } from "@/shared/lib/format";
import { toast } from "sonner";

interface BudgetTabProps {
  accountId: string;
  campaignId: string;
  campaignName: string;
}

// Pacing status configuration with descriptions for tooltips
const pacingStatusConfig: Record<
  BudgetPacingStatus,
  { label: string; status: "on_track" | "underspending" | "overspending" | "limited"; description: string }
> = {
  ON_TRACK: {
    label: "On Track",
    status: "on_track",
    description: "Your campaign is spending at a healthy pace to meet your daily budget.",
  },
  UNDERSPENDING: {
    label: "Underspending",
    status: "underspending",
    description:
      "Your campaign is spending less than expected. Consider expanding targeting or increasing bids.",
  },
  OVERSPENDING: {
    label: "Overspending",
    status: "overspending",
    description:
      "Your campaign is spending faster than planned. Google may spend up to 2x daily budget on high-traffic days.",
  },
  LIMITED: {
    label: "Limited",
    status: "limited",
    description:
      "Your budget is limiting campaign performance. Consider increasing budget to capture more opportunities.",
  },
};

function microsToDollars(micros: number): number {
  return micros / 1_000_000;
}

function dollarsToMicros(dollars: number): number {
  return Math.round(dollars * 1_000_000);
}

export function BudgetTab({ accountId, campaignId, campaignName }: BudgetTabProps) {
  const { data: budget, isLoading: isLoadingBudget, refetch: refetchBudget } = useCampaignBudget(
    accountId,
    campaignId,
  );
  const { data: spend, isLoading: isLoadingSpend, refetch: refetchSpend } = useBudgetSpend(
    accountId,
    campaignId,
  );
  const updateBudget = useUpdateBudget(accountId, campaignId);

  const [isEditing, setIsEditing] = useState(false);
  const [newBudgetDollars, setNewBudgetDollars] = useState("");
  const [newDeliveryMethod, setNewDeliveryMethod] = useState<BudgetDeliveryMethod | "">("");

  const isLoading = isLoadingBudget || isLoadingSpend;

  const handleEditClick = () => {
    if (budget) {
      setNewBudgetDollars(microsToDollars(budget.amount_micros).toFixed(2));
      setNewDeliveryMethod(budget.delivery_method);
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    const amountMicros = dollarsToMicros(parseFloat(newBudgetDollars) || 0);
    if (amountMicros > 0) {
      updateBudget.mutate(
        {
          amount_micros: amountMicros,
          delivery_method: newDeliveryMethod || undefined,
        },
        {
          onSuccess: () => {
            setIsEditing(false);
            refetchBudget();
            refetchSpend();
          },
          onError: () => toast.error("Failed to update budget"),
        },
      );
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewBudgetDollars("");
    setNewDeliveryMethod("");
  };

  if (isLoading) {
    return <LoadingState message="Loading budget information..." />;
  }

  if (!budget) {
    return (
      <EmptyState
        icon={DollarSign}
        title="No budget data"
        description="Budget information is not available for this campaign."
      />
    );
  }

  const spendToday = spend ? microsToDollars(spend.today_cost_micros) : 0;
  const spendYesterday = spend ? microsToDollars(spend.yesterday_cost_micros) : 0;
  const avgDailySpend = spend ? microsToDollars(spend.avg_daily_cost_micros) : 0;
  const last30DaysSpend = spend ? microsToDollars(spend.last_30_days_cost_micros) : 0;
  const dailyBudget = microsToDollars(budget.amount_micros);
  const pacingPct = spend ? spend.pacing_percentage * 100 : 0;

  // Calculate trend for yesterday comparison
  const spendTrend =
    spendYesterday > 0 ? ((spendToday - spendYesterday) / spendYesterday) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Budget Configuration Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Budget Configuration
              </CardTitle>
              <CardDescription>
                Daily budget settings and delivery preferences for this campaign
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  refetchBudget();
                  refetchSpend();
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              {!isEditing && (
                <Button size="sm" onClick={handleEditClick}>
                  Edit Budget
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="budget-amount">Daily Budget ($)</Label>
                  <Input
                    id="budget-amount"
                    type="number"
                    step="0.01"
                    min="0.10"
                    value={newBudgetDollars}
                    onChange={(e) => setNewBudgetDollars(e.target.value)}
                    placeholder="Enter daily budget"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery-method">Delivery Method</Label>
                  <Select
                    value={newDeliveryMethod}
                    onValueChange={(v) => setNewDeliveryMethod(v as BudgetDeliveryMethod)}
                  >
                    <SelectTrigger id="delivery-method">
                      <SelectValue placeholder="Select delivery method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STANDARD">Standard (Spread evenly)</SelectItem>
                      <SelectItem value="ACCELERATED">Accelerated (Spend quickly)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Preview changes */}
              {newBudgetDollars && parseFloat(newBudgetDollars) !== dailyBudget && (
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <div className="flex items-center gap-2">
                    {parseFloat(newBudgetDollars) > dailyBudget ? (
                      <ArrowUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-500" />
                    )}
                    <span>
                      Budget will change from <strong>{formatCurrency(dailyBudget)}</strong> to{" "}
                      <strong>{formatCurrency(parseFloat(newBudgetDollars))}</strong> (
                      {(((parseFloat(newBudgetDollars) - dailyBudget) / dailyBudget) * 100).toFixed(
                        1,
                      )}
                      %)
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={updateBudget.isPending}>
                  {updateBudget.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={updateBudget.isPending}>
                  Cancel
                </Button>
              </div>

              {updateBudget.isError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {updateBudget.error instanceof Error
                    ? updateBudget.error.message
                    : "Failed to update budget"}
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Daily Budget */}
              <InfoBox variant="muted" padding="lg">
                <MetricLabel
                  label="Daily Budget"
                  tooltip="The maximum amount Google Ads can spend per day on this campaign. Google may exceed this by up to 2x on high-traffic days, but monthly spend won't exceed 30.4x daily budget."
                  tip="Review budget regularly based on campaign performance and goals."
                  size="md"
                />
                <div className="text-2xl font-bold mt-1">{formatCurrency(dailyBudget)}</div>
              </InfoBox>

              {/* Delivery Method */}
              <InfoBox variant="muted" padding="lg">
                <MetricLabel
                  label="Delivery Method"
                  tooltip="Standard delivery spreads your budget evenly throughout the day. Accelerated delivery spends budget as quickly as possible (may deplete early)."
                  tip="Standard delivery is recommended for most campaigns."
                  size="md"
                />
                <div className="flex items-center gap-2 mt-1">
                  {budget.delivery_method === "STANDARD" ? (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Zap className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-lg font-semibold capitalize">
                    {budget.delivery_method.toLowerCase()}
                  </span>
                </div>
              </InfoBox>

              {/* Budget Period */}
              <InfoBox variant="muted" padding="lg">
                <MetricLabel
                  label="Budget Period"
                  tooltip="How your budget is measured. Daily budgets reset each day, while monthly budgets track spend across the entire month."
                  size="md"
                />
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-semibold capitalize">
                    {budget.period.toLowerCase()}
                  </span>
                </div>
              </InfoBox>

              {/* Shared Budget Info */}
              <InfoBox variant="muted" padding="lg">
                <MetricLabel
                  label="Budget Type"
                  tooltip="Shared budgets distribute spend across multiple campaigns. Individual budgets are dedicated to a single campaign."
                  tip="Use shared budgets when campaigns have similar goals and audiences."
                  size="md"
                />
                <div className="flex items-center gap-2 mt-1">
                  {budget.is_shared ? (
                    <>
                      <Badge variant="secondary" className="text-sm">
                        Shared
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {budget.shared_campaign_count} campaigns
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-semibold">Individual</span>
                  )}
                </div>
              </InfoBox>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pacing Status Card */}
      {spend && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Budget Pacing
            </CardTitle>
            <CardDescription>
              How your campaign is tracking against the daily budget target
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <MetricLabel
                  label="Pacing Status"
                  tooltip="Indicates whether your campaign is on track to spend its daily budget. Google Ads optimizes delivery to maximize results within your budget."
                  tip="Check pacing daily during new campaign launches."
                  size="md"
                />
                <HoverCard openDelay={200} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <StatusBadge
                      status={pacingStatusConfig[spend.pacing_status].status}
                      className="cursor-help"
                    >
                      {pacingStatusConfig[spend.pacing_status].label}
                    </StatusBadge>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80" side="left" align="start">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-500" />
                        {pacingStatusConfig[spend.pacing_status].label}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {pacingStatusConfig[spend.pacing_status].description}
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <MetricLabel
                    label="Budget Utilization"
                    tooltip="The percentage of your daily budget that has been spent or is projected to be spent today based on current pacing."
                    size="md"
                  />
                  <span className="font-medium">{pacingPct.toFixed(0)}%</span>
                </div>
                <Progress value={Math.min(pacingPct, 100)} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  {pacingPct < 50
                    ? "Spending is below target pace"
                    : pacingPct < 90
                      ? "Spending is on track"
                      : pacingPct <= 100
                        ? "Near or at budget target"
                        : "Exceeding daily budget pace"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Spending Summary - Using KPICards like Overview tab */}
      {spend && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Spending Summary</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KPICard
              title="Today's Spend"
              value={formatCurrency(spendToday)}
              subtitle={
                dailyBudget > 0
                  ? `${((spendToday / dailyBudget) * 100).toFixed(0)}% of daily budget`
                  : undefined
              }
              icon={CircleDollarSign}
              trend={
                spendYesterday > 0
                  ? { value: spendTrend, label: "vs yesterday" }
                  : undefined
              }
              size="sm"
            />
            <KPICard
              title="Yesterday"
              value={formatCurrency(spendYesterday)}
              subtitle={
                dailyBudget > 0
                  ? `${((spendYesterday / dailyBudget) * 100).toFixed(0)}% of daily budget`
                  : undefined
              }
              icon={Clock}
              size="sm"
            />
            <KPICard
              title="Avg. Daily (30d)"
              value={formatCurrency(avgDailySpend)}
              subtitle={
                dailyBudget > 0
                  ? `${((avgDailySpend / dailyBudget) * 100).toFixed(0)}% avg utilization`
                  : undefined
              }
              icon={TrendingUp}
              size="sm"
            />
            <KPICard
              title="Last 30 Days"
              value={formatCurrency(last30DaysSpend)}
              subtitle={`${spend.days_remaining} days remaining in period`}
              icon={PiggyBank}
              size="sm"
            />
          </div>
        </div>
      )}

      {/* Monthly Projections Card */}
      {spend && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Monthly Projections
            </CardTitle>
            <CardDescription>
              Estimated monthly spend based on current campaign performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <MetricLabel
                  label="Projected Monthly Spend"
                  tooltip="Estimated total spend for the month based on your current daily spending pace. This projection updates as your campaign accumulates data."
                  tip="Projections become more accurate after 7+ days of data."
                  size="md"
                />
                <div className="text-2xl font-bold">
                  {formatCurrency(microsToDollars(spend.projected_monthly_spend_micros))}
                </div>
                <p className="text-xs text-muted-foreground">Based on current spending pace</p>
              </div>
              <div className="space-y-2">
                <MetricLabel
                  label="Monthly Budget Cap"
                  tooltip="The maximum amount Google Ads will spend in a month (daily budget × 30.4). Actual daily spend may vary, but monthly total won't exceed this."
                  size="md"
                />
                <div className="text-2xl font-bold">{formatCurrency(dailyBudget * 30.4)}</div>
                <p className="text-xs text-muted-foreground">Daily budget × 30.4 days</p>
              </div>
              <div className="space-y-2">
                <MetricLabel
                  label="Projected Variance"
                  tooltip="The difference between your projected spend and monthly budget cap. Negative values indicate underspending, positive values indicate you're on track to hit your budget."
                  tip="Large negative variance may indicate targeting or bid issues."
                  size="md"
                />
                <div className="text-2xl font-bold">
                  {(() => {
                    const monthlyBudget = dailyBudget * 30.4;
                    const projectedMonthly = microsToDollars(spend.projected_monthly_spend_micros);
                    const variance = projectedMonthly - monthlyBudget;
                    const variancePercent = monthlyBudget > 0 ? (variance / monthlyBudget) * 100 : 0;
                    return (
                      <span className={variance > 0 ? "text-green-600" : "text-amber-600"}>
                        {variance > 0 ? "+" : ""}
                        {formatCurrency(variance)}
                      </span>
                    );
                  })()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(() => {
                    const monthlyBudget = dailyBudget * 30.4;
                    const projectedMonthly = microsToDollars(spend.projected_monthly_spend_micros);
                    const variance = projectedMonthly - monthlyBudget;
                    return variance > 0
                      ? "On track to use full budget"
                      : "May underspend this month";
                  })()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
