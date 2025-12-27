"use client";

import {
  Building2,
  ChevronRight,
  Globe2,
  Map,
  MapPin,
  TrendingUp,
} from "lucide-react";
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangeSelect } from "@/components/ui/date-range-select";
import { EmptyState } from "@/components/ui/empty-state";
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
import { ChartCard, KPICard } from "@/components/charts";
import { useGeographicPerformance } from "@/features/campaigns";
import type { GeographicLevel, GeographicPerformance } from "@/features/campaigns/types";
import {
  CHART_COLOR_SEQUENCE,
  createPieLabelFormatter,
  createTooltipFormatter,
  microsToDollars,
} from "@/shared/lib/chart-utils";
import { formatCompact, formatCurrency, formatPercent } from "@/shared/lib/format";

interface GeographicTabProps {
  accountId: string;
  campaignId: string;
}

const LEVEL_LABELS: Record<GeographicLevel, string> = {
  country: "Countries",
  region: "Regions/States",
  city: "Cities",
  postal: "Postal Codes",
};

const LEVEL_ICONS: Record<GeographicLevel, React.ReactNode> = {
  country: <Globe2 className="h-4 w-4" />,
  region: <Map className="h-4 w-4" />,
  city: <Building2 className="h-4 w-4" />,
  postal: <MapPin className="h-4 w-4" />,
};

interface BreadcrumbItemType {
  level: GeographicLevel;
  id: string | null;
  name: string;
}

// Geographic Distribution Chart
function DistributionChart({ data }: { data: GeographicPerformance[] }) {
  const chartData = data.slice(0, 10).map((loc, i) => ({
    name: loc.location_name,
    impressions: loc.impressions,
    fill: CHART_COLOR_SEQUENCE[i % CHART_COLOR_SEQUENCE.length],
  }));

  if (chartData.length === 0) return null;

  return (
    <ChartCard title="Impression Distribution" description="Top locations by impressions">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={createPieLabelFormatter()}
          outerRadius={100}
          dataKey="impressions"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip formatter={createTooltipFormatter("compact")} />
        <Legend />
      </PieChart>
    </ChartCard>
  );
}

// Performance Bar Chart
function PerformanceChart({ data }: { data: GeographicPerformance[] }) {
  const chartData = data.slice(0, 10).map((loc) => ({
    name: loc.location_name.length > 15 ? loc.location_name.slice(0, 15) + "..." : loc.location_name,
    clicks: loc.clicks,
    conversions: loc.conversions,
    cost: microsToDollars(loc.cost_micros),
  }));

  if (chartData.length === 0) return null;

  return (
    <ChartCard title="Performance by Location" description="Clicks and conversions comparison">
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
        <Tooltip formatter={createTooltipFormatter("compact")} />
        <Legend />
        <Bar dataKey="clicks" fill="#3b82f6" name="Clicks" />
        <Bar dataKey="conversions" fill="#10b981" name="Conversions" />
      </BarChart>
    </ChartCard>
  );
}

// Location Table with drill-down
function LocationTable({
  data,
  level,
  onDrillDown,
}: {
  data: GeographicPerformance[];
  level: GeographicLevel;
  onDrillDown: (location: GeographicPerformance) => void;
}) {
  const canDrillDown = level !== "postal";
  const sortedData = [...data].sort((a, b) => b.impressions - a.impressions);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {LEVEL_ICONS[level]}
          {LEVEL_LABELS[level]}
        </CardTitle>
        <CardDescription>
          {data.length} locations found{canDrillDown && " - Click a row to drill down"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Impressions</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="text-right">CTR</TableHead>
              <TableHead className="text-right">Conversions</TableHead>
              <TableHead className="text-right">Conv. Value</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              {canDrillDown && <TableHead className="w-12"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((location) => (
              <TableRow
                key={location.location_id}
                className={canDrillDown ? "cursor-pointer hover:bg-muted/50" : ""}
                onClick={() => canDrillDown && onDrillDown(location)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {LEVEL_ICONS[level]}
                    <span>{location.location_name}</span>
                    {location.country_code && (
                      <Badge variant="outline" className="text-xs">
                        {location.country_code}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">{formatCompact(location.impressions)}</TableCell>
                <TableCell className="text-right">{formatCompact(location.clicks)}</TableCell>
                <TableCell className="text-right">{formatPercent(location.ctr)}</TableCell>
                <TableCell className="text-right">{formatCompact(location.conversions)}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(microsToDollars(location.conversions_value))}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(microsToDollars(location.cost_micros))}
                </TableCell>
                {canDrillDown && (
                  <TableCell>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function GeographicTab({ accountId, campaignId }: GeographicTabProps) {
  const [dateRange, setDateRange] = useState("LAST_30_DAYS");
  const [level, setLevel] = useState<GeographicLevel>("country");
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItemType[]>([
    { level: "country", id: null, name: "All Countries" },
  ]);

  const { data, isLoading } = useGeographicPerformance(accountId, campaignId, {
    level,
    parentId,
    dateRange,
  });

  const handleDrillDown = (location: GeographicPerformance) => {
    const nextLevel: GeographicLevel | null =
      level === "country" ? "region"
        : level === "region" ? "city"
          : level === "city" ? "postal"
            : null;

    if (nextLevel) {
      setLevel(nextLevel);
      setParentId(location.location_id);
      setBreadcrumbs((prev) => [
        ...prev,
        { level: nextLevel, id: location.location_id, name: location.location_name },
      ]);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    const item = breadcrumbs[index];
    setLevel(item.level);
    setParentId(item.id ?? undefined);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  if (isLoading) {
    return <LoadingState message="Loading geographic data..." />;
  }

  if (!data || data.items.length === 0) {
    return (
      <EmptyState
        icon={Globe2}
        title="No Geographic Data"
        description="Geographic performance data is not yet available for this campaign."
      />
    );
  }

  // Calculate summary stats
  const totalImpressions = data.items.reduce((sum, loc) => sum + loc.impressions, 0);
  const totalConversions = data.items.reduce((sum, loc) => sum + loc.conversions, 0);
  const topLocation = data.items.reduce(
    (max, loc) => (loc.impressions > max.impressions ? loc : max),
    data.items[0],
  );

  return (
    <div className="space-y-6">
      <TabPageHeader
        title="Geographic Performance"
        description="Performance breakdown by location with drill-down"
        actions={<DateRangeSelect value={dateRange} onValueChange={setDateRange} />}
      />

      {/* Breadcrumb Navigation */}
      <Card>
        <CardContent className="py-3">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((item, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {index === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage className="flex items-center gap-1">
                        {LEVEL_ICONS[item.level]}
                        {item.name}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        onClick={() => handleBreadcrumbClick(index)}
                        className="flex items-center gap-1 cursor-pointer"
                      >
                        {LEVEL_ICONS[item.level]}
                        {item.name}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Locations"
          value={data.total}
          subtitle={LEVEL_LABELS[level]}
          icon={MapPin}
        />
        <KPICard
          title="Total Impressions"
          value={formatCompact(totalImpressions)}
          subtitle="Across all locations"
          icon={TrendingUp}
        />
        <KPICard
          title="Total Conversions"
          value={formatCompact(totalConversions)}
          subtitle="Across all locations"
          icon={TrendingUp}
        />
        <KPICard
          title="Top Location"
          value={topLocation.location_name}
          subtitle={`${formatCompact(topLocation.impressions)} impressions`}
          icon={Globe2}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DistributionChart data={data.items} />
        <PerformanceChart data={data.items} />
      </div>

      {/* Location Table */}
      <LocationTable data={data.items} level={level} onDrillDown={handleDrillDown} />
    </div>
  );
}
