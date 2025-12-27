"use client";

import { Award, BarChart2, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangeSelect } from "@/components/ui/date-range-select";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Progress } from "@/components/ui/progress";
import { TabPageHeader } from "@/components/ui/tab-page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartCard, KPICard } from "@/components/charts";
import { useAuctionInsights } from "@/features/campaigns";
import type { AuctionInsight } from "@/features/campaigns/types";
import {
  CHART_COLOR_SEQUENCE,
  createPieLabelFormatter,
  createTooltipFormatter,
} from "@/shared/lib/chart-utils";
import { formatPercent } from "@/shared/lib/format";

interface AuctionInsightsTabProps {
  accountId: string;
  campaignId: string;
}

// Impression Share Chart
function ImpressionShareChart({
  insights,
  yourShare,
}: {
  insights: AuctionInsight[];
  yourShare: number;
}) {
  const topCompetitors = insights.slice(0, 5);
  const othersShare = Math.max(
    0,
    100 - yourShare * 100 - topCompetitors.reduce((sum, c) => sum + c.impression_share * 100, 0),
  );

  const chartData = [
    { name: "You", value: yourShare * 100, fill: "#10b981" },
    ...topCompetitors.map((c, i) => ({
      name: c.display_name || c.domain,
      value: c.impression_share * 100,
      fill: CHART_COLOR_SEQUENCE[i % CHART_COLOR_SEQUENCE.length],
    })),
    ...(othersShare > 0 ? [{ name: "Others", value: othersShare, fill: "#9ca3af" }] : []),
  ];

  return (
    <ChartCard title="Impression Share Distribution" description="Your share vs competitors">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={createPieLabelFormatter()}
          outerRadius={100}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip formatter={createTooltipFormatter("percent")} />
        <Legend />
      </PieChart>
    </ChartCard>
  );
}

// Competitor Comparison Chart
function CompetitorComparisonChart({ insights }: { insights: AuctionInsight[] }) {
  const chartData = insights.slice(0, 8).map((c) => ({
    name: c.display_name || c.domain,
    impressionShare: c.impression_share * 100,
    overlapRate: c.overlap_rate * 100,
    positionAbove: c.position_above_rate * 100,
    outrankingShare: c.outranking_share * 100,
  }));

  return (
    <ChartCard
      title="Competitor Metrics Comparison"
      description="Key auction metrics across competitors"
      height={350}
    >
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
        <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
        <Tooltip formatter={createTooltipFormatter("percent")} />
        <Legend />
        <Bar dataKey="impressionShare" fill="#8884d8" name="Impression Share" />
        <Bar dataKey="overlapRate" fill="#82ca9d" name="Overlap Rate" />
        <Bar dataKey="outrankingShare" fill="#ffc658" name="Outranking Share" />
      </BarChart>
    </ChartCard>
  );
}

// Competitor Details Table
function CompetitorTable({ insights }: { insights: AuctionInsight[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Competitor Details</CardTitle>
        <CardDescription>Full auction insights for each competitor</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Competitor</TableHead>
              <TableHead className="text-right">Impression Share</TableHead>
              <TableHead className="text-right">Overlap Rate</TableHead>
              <TableHead className="text-right">Position Above</TableHead>
              <TableHead className="text-right">Top of Page</TableHead>
              <TableHead className="text-right">Abs. Top of Page</TableHead>
              <TableHead className="text-right">Outranking Share</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {insights.map((insight) => (
              <TableRow key={insight.domain}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{insight.display_name || insight.domain}</span>
                    {insight.impression_share > 0.2 && (
                      <Badge variant="secondary" className="text-xs">
                        Top Competitor
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Progress value={insight.impression_share * 100} className="w-16 h-2" />
                    <span className="w-12 text-right">
                      {formatPercent(insight.impression_share)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">{formatPercent(insight.overlap_rate)}</TableCell>
                <TableCell className="text-right">
                  {formatPercent(insight.position_above_rate)}
                </TableCell>
                <TableCell className="text-right">
                  {formatPercent(insight.top_of_page_rate)}
                </TableCell>
                <TableCell className="text-right">
                  {formatPercent(insight.abs_top_of_page_rate)}
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={
                      insight.outranking_share > 0.5 ? "text-red-500" : "text-green-500"
                    }
                  >
                    {formatPercent(insight.outranking_share)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function AuctionInsightsTab({ accountId, campaignId }: AuctionInsightsTabProps) {
  const [dateRange, setDateRange] = useState("LAST_30_DAYS");
  const { data, isLoading } = useAuctionInsights(accountId, campaignId, dateRange);

  if (isLoading) {
    return <LoadingState message="Loading auction insights..." />;
  }

  if (!data || data.items.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No Auction Insights Available"
        description="Auction insights data is not yet available for this campaign. This typically requires sufficient impression volume."
      />
    );
  }

  // Calculate stats
  const topCompetitor = data.items[0];
  const avgOutrankingShare =
    data.items.reduce((sum, c) => sum + c.outranking_share, 0) / data.items.length;

  return (
    <div className="space-y-6">
      <TabPageHeader
        title="Auction Insights"
        description="Competitor analysis and market position"
        actions={<DateRangeSelect value={dateRange} onValueChange={setDateRange} />}
      />

      {/* Summary Cards - using shared KPICard */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Your Impression Share"
          value={formatPercent(data.your_impression_share)}
          subtitle="Your share of auctions won"
          icon={BarChart2}
        />
        <KPICard
          title="Total Competitors"
          value={data.total}
          subtitle="Competitors in auctions"
          icon={Users}
        />
        <KPICard
          title="Top Competitor"
          value={topCompetitor?.display_name || topCompetitor?.domain || "N/A"}
          subtitle={`${formatPercent(topCompetitor?.impression_share ?? 0)} share`}
          icon={Award}
        />
        <KPICard
          title="Avg. Outranking Share"
          value={formatPercent(avgOutrankingShare)}
          subtitle="How often competitors outrank you"
          icon={TrendingUp}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ImpressionShareChart insights={data.items} yourShare={data.your_impression_share} />
        <CompetitorComparisonChart insights={data.items} />
      </div>

      {/* Competitor Details Table */}
      <CompetitorTable insights={data.items} />
    </div>
  );
}
