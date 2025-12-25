"use client";

import { Calculator, Loader2, TrendingUp, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSimulations } from "@/features/campaigns";
import type { CampaignSimulation, SimulationPoint, SimulationType } from "@/features/campaigns/types";
import { formatCompact, formatCurrency } from "@/shared/lib/format";

interface SimulationsTabProps {
  accountId: string;
  campaignId: string;
}

const microsToDollars = (micros: number) => micros / 1_000_000;

const simulationTypeLabels: Record<SimulationType, string> = {
  BUDGET: "Budget",
  TARGET_CPA: "Target CPA",
  TARGET_ROAS: "Target ROAS",
};

const simulationTypeIcons: Record<SimulationType, React.ReactNode> = {
  BUDGET: <Wallet className="h-4 w-4 text-blue-500" />,
  TARGET_CPA: <Calculator className="h-4 w-4 text-green-500" />,
  TARGET_ROAS: <TrendingUp className="h-4 w-4 text-purple-500" />,
};

function SimulationPointsTable({
  points,
  simulationType,
}: {
  points: SimulationPoint[];
  simulationType: SimulationType;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            {simulationType === "BUDGET"
              ? "Daily Budget"
              : simulationType === "TARGET_CPA"
                ? "Target CPA"
                : "Target ROAS"}
          </TableHead>
          <TableHead className="text-right">Impressions</TableHead>
          <TableHead className="text-right">Clicks</TableHead>
          <TableHead className="text-right">Cost</TableHead>
          <TableHead className="text-right">Conversions</TableHead>
          <TableHead className="text-right">Change</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {points.map((point, idx) => {
          const prevConversions = idx > 0 ? points[idx - 1].conversions : point.conversions;
          const change = idx > 0 ? ((point.conversions - prevConversions) / prevConversions) * 100 : 0;

          return (
            <TableRow key={idx}>
              <TableCell className="font-medium">
                {simulationType === "TARGET_ROAS"
                  ? `${(point.value * 100).toFixed(0)}%`
                  : formatCurrency(microsToDollars(point.value))}
              </TableCell>
              <TableCell className="text-right">{formatCompact(point.impressions)}</TableCell>
              <TableCell className="text-right">{formatCompact(point.clicks)}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(microsToDollars(point.cost_micros))}
              </TableCell>
              <TableCell className="text-right">{point.conversions.toFixed(1)}</TableCell>
              <TableCell className="text-right">
                {idx > 0 && (
                  <span className={change >= 0 ? "text-green-600" : "text-red-600"}>
                    {change >= 0 ? "+" : ""}
                    {change.toFixed(1)}%
                  </span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function SimulationCard({ simulation }: { simulation: CampaignSimulation }) {
  const points = simulation.points ?? [];

  // Find the "sweet spot" - best conversions per cost ratio
  const bestPoint =
    points.length > 0
      ? points.reduce((best, current) => {
          const currentRatio = current.conversions / (current.cost_micros || 1);
          const bestRatio = best.conversions / (best.cost_micros || 1);
          return currentRatio > bestRatio ? current : best;
        })
      : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {simulationTypeIcons[simulation.simulation_type]}
            <CardTitle className="text-base">
              {simulationTypeLabels[simulation.simulation_type]} Simulation
            </CardTitle>
          </div>
          <Badge variant="outline">
            {simulation.start_date} - {simulation.end_date}
          </Badge>
        </div>
        <CardDescription>
          See how changes to your{" "}
          {simulation.simulation_type === "BUDGET"
            ? "daily budget"
            : simulation.simulation_type === "TARGET_CPA"
              ? "target CPA"
              : "target ROAS"}{" "}
          could affect performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        {bestPoint && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Recommended Setting
              </span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-300">
              At{" "}
              <strong>
                {simulation.simulation_type === "TARGET_ROAS"
                  ? `${(bestPoint.value * 100).toFixed(0)}% ROAS`
                  : formatCurrency(microsToDollars(bestPoint.value))}
              </strong>
              , you could get <strong>{bestPoint.conversions.toFixed(1)}</strong> conversions for{" "}
              <strong>{formatCurrency(microsToDollars(bestPoint.cost_micros))}</strong>
            </p>
          </div>
        )}

        {points.length > 0 ? (
          <SimulationPointsTable points={points} simulationType={simulation.simulation_type} />
        ) : (
          <p className="text-center text-muted-foreground py-4">
            No simulation points available
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function SimulationsTab({ accountId, campaignId }: SimulationsTabProps) {
  const { data, isLoading } = useSimulations(accountId, campaignId);

  const simulations = data?.simulations ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (simulations.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Calculator className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg mb-2">No Simulations Available</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Google Ads generates simulations based on your campaign's historical data. Simulations
            will appear once your campaign has enough data to make predictions.
          </p>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Simulations typically require:</p>
            <ul className="mt-2 space-y-1">
              <li>At least 7 days of campaign activity</li>
              <li>Consistent conversion tracking</li>
              <li>Sufficient impression volume</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Calculator className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Performance Forecasting
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                These simulations show how adjusting your budget or bidding settings could impact
                your campaign performance. Predictions are based on historical data and may vary.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simulation Cards */}
      {simulations.map((simulation, idx) => (
        <SimulationCard key={`${simulation.simulation_type}-${idx}`} simulation={simulation} />
      ))}
    </div>
  );
}
