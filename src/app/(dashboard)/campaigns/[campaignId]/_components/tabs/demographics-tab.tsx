"use client";

import { Baby, DollarSign, User, Users } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangeSelect } from "@/components/ui/date-range-select";
import { EmptyState } from "@/shared/components";
import { LoadingState } from "@/components/ui/loading-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TabPageHeader } from "@/components/ui/tab-page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartCard } from "@/components/charts";
import { useDemographics } from "@/features/campaigns";
import type {
  AgeRangePerformance,
  GenderPerformance,
  IncomeRangePerformance,
  ParentalStatusPerformance,
} from "@/features/campaigns/types";
import { createPieLabelFormatter, createTooltipFormatter, microsToDollars } from "@/shared/lib/chart-utils";
import { formatCompact, formatCurrency, formatPercent } from "@/shared/lib/format";

interface DemographicsTabProps {
  accountId: string;
  campaignId: string;
}

// Color palette for charts
const COLORS = {
  age: ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00C49F", "#FFBB28", "#FF8042"],
  gender: { MALE: "#3b82f6", FEMALE: "#ec4899", UNDETERMINED: "#9ca3af", UNKNOWN: "#d1d5db" },
  income: ["#10b981", "#059669", "#047857", "#065f46", "#064e3b", "#022c22", "#9ca3af"],
  parental: { PARENT: "#8b5cf6", NOT_A_PARENT: "#06b6d4", UNDETERMINED: "#9ca3af" },
};

// Age Range labels
const AGE_RANGE_LABELS: Record<string, string> = {
  AGE_RANGE_18_24: "18-24",
  AGE_RANGE_25_34: "25-34",
  AGE_RANGE_35_44: "35-44",
  AGE_RANGE_45_54: "45-54",
  AGE_RANGE_55_64: "55-64",
  AGE_RANGE_65_UP: "65+",
  AGE_RANGE_UNDETERMINED: "Unknown",
  AGE_RANGE_UNSPECIFIED: "Unspecified",
};

// Income Range labels
const INCOME_RANGE_LABELS: Record<string, string> = {
  INCOME_RANGE_TOP_10_PERCENT: "Top 10%",
  INCOME_RANGE_11_TO_20_PERCENT: "11-20%",
  INCOME_RANGE_21_TO_30_PERCENT: "21-30%",
  INCOME_RANGE_31_TO_40_PERCENT: "31-40%",
  INCOME_RANGE_41_TO_50_PERCENT: "41-50%",
  INCOME_RANGE_LOWER_50_PERCENT: "Lower 50%",
  INCOME_RANGE_UNDETERMINED: "Unknown",
  INCOME_RANGE_UNSPECIFIED: "Unspecified",
};

// Reusable Demographics Table
function DemographicsTable({
  data,
  labelColumn,
}: {
  data: Array<{ name: string; impressions?: number; value?: number; clicks: number; ctr: number; conversions: number; cost: number }>;
  labelColumn: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{labelColumn} Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{labelColumn}</TableHead>
              <TableHead className="text-right">Impressions</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="text-right">CTR</TableHead>
              <TableHead className="text-right">Conversions</TableHead>
              <TableHead className="text-right">Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.name}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="text-right">{formatCompact(row.impressions ?? row.value ?? 0)}</TableCell>
                <TableCell className="text-right">{formatCompact(row.clicks)}</TableCell>
                <TableCell className="text-right">{formatPercent(row.ctr / 100)}</TableCell>
                <TableCell className="text-right">{formatCompact(row.conversions)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.cost)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Age Range Section
function AgeRangeSection({ data }: { data: AgeRangePerformance[] }) {
  const chartData = data
    .filter((d) => d.impressions > 0)
    .map((d) => ({
      name: AGE_RANGE_LABELS[d.age_range] || d.age_range_label,
      impressions: d.impressions,
      clicks: d.clicks,
      conversions: d.conversions,
      cost: microsToDollars(d.cost_micros),
      ctr: d.ctr * 100,
    }))
    .sort((a, b) => b.impressions - a.impressions);

  if (chartData.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No Age Range Data"
        description="Age range data is not available for this campaign."
      />
    );
  }

  return (
    <div className="space-y-4">
      <ChartCard title="Age Distribution" description="Performance breakdown by age range">
        <BarChart data={chartData} layout="vertical">
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={80} />
          <Tooltip formatter={createTooltipFormatter("compact")} />
          <Legend />
          <Bar dataKey="impressions" fill="#8884d8" name="Impressions" />
          <Bar dataKey="clicks" fill="#82ca9d" name="Clicks" />
          <Bar dataKey="conversions" fill="#ffc658" name="Conversions" />
        </BarChart>
      </ChartCard>
      <DemographicsTable data={chartData} labelColumn="Age Range" />
    </div>
  );
}

// Gender Section
function GenderSection({ data }: { data: GenderPerformance[] }) {
  const chartData = data
    .filter((d) => d.impressions > 0)
    .map((d) => ({
      name: d.gender_label,
      value: d.impressions,
      clicks: d.clicks,
      conversions: d.conversions,
      cost: microsToDollars(d.cost_micros),
      ctr: d.ctr * 100,
      gender: d.gender,
    }));

  if (chartData.length === 0) {
    return (
      <EmptyState
        icon={User}
        title="No Gender Data"
        description="Gender data is not available for this campaign."
      />
    );
  }

  return (
    <div className="space-y-4">
      <ChartCard title="Gender Distribution" description="Impression share by gender">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={createPieLabelFormatter()}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS.gender[entry.gender as keyof typeof COLORS.gender] || "#9ca3af"}
              />
            ))}
          </Pie>
          <Tooltip formatter={createTooltipFormatter("compact")} labelFormatter={(label) => `${label} Impressions`} />
        </PieChart>
      </ChartCard>
      <DemographicsTable data={chartData} labelColumn="Gender" />
    </div>
  );
}

// Income Section
function IncomeSection({ data }: { data: IncomeRangePerformance[] }) {
  const chartData = data
    .filter((d) => d.impressions > 0)
    .map((d) => ({
      name: INCOME_RANGE_LABELS[d.income_range] || d.income_range_label,
      impressions: d.impressions,
      clicks: d.clicks,
      conversions: d.conversions,
      cost: microsToDollars(d.cost_micros),
      ctr: d.ctr * 100,
    }))
    .sort((a, b) => b.impressions - a.impressions);

  if (chartData.length === 0) {
    return (
      <EmptyState
        icon={DollarSign}
        title="No Income Data"
        description="Income data is not available for this campaign."
      />
    );
  }

  return (
    <div className="space-y-4">
      <ChartCard title="Household Income Distribution" description="Performance by income tier">
        <BarChart data={chartData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={createTooltipFormatter("compact")} />
          <Legend />
          <Bar dataKey="impressions" fill="#10b981" name="Impressions" />
          <Bar dataKey="conversions" fill="#059669" name="Conversions" />
        </BarChart>
      </ChartCard>
      <DemographicsTable data={chartData} labelColumn="Income Range" />
    </div>
  );
}

// Parental Status Section
function ParentalStatusSection({ data }: { data: ParentalStatusPerformance[] }) {
  const chartData = data
    .filter((d) => d.impressions > 0)
    .map((d) => ({
      name: d.parental_status_label,
      value: d.impressions,
      clicks: d.clicks,
      conversions: d.conversions,
      cost: microsToDollars(d.cost_micros),
      ctr: d.ctr * 100,
      status: d.parental_status,
    }));

  if (chartData.length === 0) {
    return (
      <EmptyState
        icon={Baby}
        title="No Parental Status Data"
        description="Parental status data is not available for this campaign."
      />
    );
  }

  return (
    <div className="space-y-4">
      <ChartCard title="Parental Status Distribution" description="Impression share by parental status">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={createPieLabelFormatter()}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS.parental[entry.status as keyof typeof COLORS.parental] || "#9ca3af"}
              />
            ))}
          </Pie>
          <Tooltip formatter={createTooltipFormatter("compact")} labelFormatter={(label) => `${label} Impressions`} />
        </PieChart>
      </ChartCard>
      <DemographicsTable data={chartData} labelColumn="Parental Status" />
    </div>
  );
}

export function DemographicsTab({ accountId, campaignId }: DemographicsTabProps) {
  const [dateRange, setDateRange] = useState("LAST_30_DAYS");
  const { data, isLoading } = useDemographics(accountId, campaignId, dateRange);

  if (isLoading) {
    return <LoadingState message="Loading demographics data..." />;
  }

  if (!data) {
    return (
      <EmptyState
        icon={Users}
        title="No Demographics Data"
        description="Demographics data is not yet available for this campaign."
      />
    );
  }

  return (
    <div className="space-y-6">
      <TabPageHeader
        title="Demographics"
        description="Audience breakdown by age, gender, income, and parental status"
        actions={<DateRangeSelect value={dateRange} onValueChange={setDateRange} />}
      />

      <Tabs defaultValue="age" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="age" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Age
          </TabsTrigger>
          <TabsTrigger value="gender" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Gender
          </TabsTrigger>
          <TabsTrigger value="income" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Income
          </TabsTrigger>
          <TabsTrigger value="parental" className="flex items-center gap-2">
            <Baby className="h-4 w-4" />
            Parental
          </TabsTrigger>
        </TabsList>

        <TabsContent value="age">
          <AgeRangeSection data={data.age_ranges} />
        </TabsContent>

        <TabsContent value="gender">
          <GenderSection data={data.genders} />
        </TabsContent>

        <TabsContent value="income">
          <IncomeSection data={data.income_ranges} />
        </TabsContent>

        <TabsContent value="parental">
          <ParentalStatusSection data={data.parental_statuses} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
