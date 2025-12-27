"use client";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  DollarSign,
  Loader2,
  Minus,
  RefreshCw,
  Save,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import {
  useBudgetSpend,
  useCampaignBudget,
  useUpdateBudget,
} from "@/features/campaigns/hooks";
import type { BudgetDeliveryMethod, BudgetPacingStatus } from "@/features/campaigns/types";
import { formatCurrency } from "@/shared/lib/format";

interface BudgetTabProps {
  accountId: string;
  campaignId: string;
  campaignName: string;
}

const pacingStatusColors: Record<BudgetPacingStatus, string> = {
  ON_TRACK: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  UNDERSPENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  OVERSPENDING: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  LIMITED: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

const pacingStatusLabels: Record<BudgetPacingStatus, string> = {
  ON_TRACK: "On Track",
  UNDERSPENDING: "Underspending",
  OVERSPENDING: "Overspending",
  LIMITED: "Limited",
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

  return (
    <div className="space-y-6">
      {/* Budget Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Budget Details</CardTitle>
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
          <CardDescription>Current budget configuration and spending</CardDescription>
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
                      Budget will change from{" "}
                      <strong>{formatCurrency(dailyBudget)}</strong> to{" "}
                      <strong>{formatCurrency(parseFloat(newBudgetDollars))}</strong>
                      {" "}(
                      {(
                        ((parseFloat(newBudgetDollars) - dailyBudget) / dailyBudget) *
                        100
                      ).toFixed(1)}
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
            <div className="grid gap-6 md:grid-cols-2">
              {/* Budget Info */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Daily Budget</span>
                  <span className="text-2xl font-bold">{formatCurrency(dailyBudget)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Delivery Method</span>
                  <span className="font-medium capitalize">
                    {budget.delivery_method.toLowerCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Period</span>
                  <span className="font-medium capitalize">{budget.period.toLowerCase()}</span>
                </div>
                {budget.is_shared && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Shared Budget</span>
                    <Badge variant="outline">{budget.shared_campaign_count} campaigns</Badge>
                  </div>
                )}
              </div>

              {/* Pacing Info */}
              {spend && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Pacing Status</span>
                    <Badge className={pacingStatusColors[spend.pacing_status]}>
                      {pacingStatusLabels[spend.pacing_status]}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pacing</span>
                      <span>{pacingPct.toFixed(0)}%</span>
                    </div>
                    <Progress value={Math.min(pacingPct, 100)} className="h-2" />
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spending Summary Card */}
      {spend && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Spending Summary</CardTitle>
            </div>
            <CardDescription>Recent spending across different periods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Today</div>
                <div className="text-2xl font-bold">{formatCurrency(spendToday)}</div>
                <div className="text-xs text-muted-foreground">
                  {dailyBudget > 0
                    ? `${((spendToday / dailyBudget) * 100).toFixed(0)}% of budget`
                    : "—"}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Yesterday</div>
                <div className="text-2xl font-bold">{formatCurrency(spendYesterday)}</div>
                <div className="flex items-center text-xs">
                  {spendYesterday > spendToday ? (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  ) : spendYesterday < spendToday ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <Minus className="h-3 w-3 text-muted-foreground mr-1" />
                  )}
                  <span className="text-muted-foreground">vs today</span>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Avg. Daily (30d)</div>
                <div className="text-2xl font-bold">{formatCurrency(avgDailySpend)}</div>
                <div className="text-xs text-muted-foreground">
                  {dailyBudget > 0
                    ? `${((avgDailySpend / dailyBudget) * 100).toFixed(0)}% utilization`
                    : "—"}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Last 30 Days</div>
                <div className="text-2xl font-bold">{formatCurrency(last30DaysSpend)}</div>
                <div className="text-xs text-muted-foreground">
                  {spend.days_remaining} days remaining
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projections Card */}
      {spend && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Projections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Projected Monthly Spend</div>
                <div className="text-xl font-semibold">
                  {formatCurrency(microsToDollars(spend.projected_monthly_spend_micros))}
                </div>
                <div className="text-xs text-muted-foreground">Based on current pace</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Monthly Budget</div>
                <div className="text-xl font-semibold">
                  {formatCurrency(dailyBudget * 30)}
                </div>
                <div className="text-xs text-muted-foreground">Daily budget x 30</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Projected Variance</div>
                <div className="text-xl font-semibold">
                  {(() => {
                    const monthlyBudget = dailyBudget * 30;
                    const projectedMonthly = microsToDollars(spend.projected_monthly_spend_micros);
                    const variance = projectedMonthly - monthlyBudget;
                    return (
                      <span className={variance > 0 ? "text-red-600" : "text-green-600"}>
                        {variance > 0 ? "+" : ""}
                        {formatCurrency(variance)}
                      </span>
                    );
                  })()}
                </div>
                <div className="text-xs text-muted-foreground">Difference from budget</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
