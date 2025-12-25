"use client";

import {
  BarChart3,
  Globe,
  Laptop,
  Loader2,
  Monitor,
  Network,
  Smartphone,
  Tablet,
  Tv,
  Youtube,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlacements, useSegmentedPerformance, useTopCombinations } from "@/features/campaigns";
import type {
  AssetGroup,
  Placement,
  PlacementType,
  SegmentedPerformance,
  SegmentType,
  TopCombination,
} from "@/features/campaigns/types";
import { formatCompact, formatCurrency, formatPercent } from "@/shared/lib/format";

interface InsightsTabProps {
  accountId: string;
  campaignId: string;
  assetGroups: AssetGroup[] | undefined;
}

// Helper to convert micros to dollars
const microsToDollars = (micros: number) => micros / 1_000_000;

// Icons for placement types
const placementIcons: Record<PlacementType, React.ReactNode> = {
  YOUTUBE_VIDEO: <Youtube className="h-4 w-4 text-red-500" />,
  YOUTUBE_CHANNEL: <Youtube className="h-4 w-4 text-red-500" />,
  GOOGLE_DISPLAY: <Monitor className="h-4 w-4 text-blue-500" />,
  GOOGLE_SEARCH: <Globe className="h-4 w-4 text-green-500" />,
  DISCOVER: <BarChart3 className="h-4 w-4 text-purple-500" />,
  GMAIL: <Globe className="h-4 w-4 text-orange-500" />,
  MAPS: <Globe className="h-4 w-4 text-cyan-500" />,
  OTHER: <Network className="h-4 w-4 text-gray-500" />,
};

// Icons for device types
const deviceIcons: Record<string, React.ReactNode> = {
  MOBILE: <Smartphone className="h-4 w-4" />,
  DESKTOP: <Laptop className="h-4 w-4" />,
  TABLET: <Tablet className="h-4 w-4" />,
  CONNECTED_TV: <Tv className="h-4 w-4" />,
  OTHER: <Monitor className="h-4 w-4" />,
};

// Placements Section
function PlacementsSection({
  accountId,
  campaignId,
}: {
  accountId: string;
  campaignId: string;
}) {
  const { data, isLoading } = usePlacements(accountId, campaignId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const placements = data?.placements ?? [];

  if (placements.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Globe className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No placement data available yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Placements will appear once your PMax campaign starts serving ads
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group by placement type
  const byType = placements.reduce(
    (acc, p) => {
      const type = p.placement_type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(p);
      return acc;
    },
    {} as Record<PlacementType, Placement[]>,
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(byType).map(([type, items]) => {
          const totalImpressions = items.reduce((sum, p) => sum + p.impressions, 0);
          const totalClicks = items.reduce((sum, p) => sum + p.clicks, 0);
          return (
            <Card key={type}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {placementIcons[type as PlacementType]}
                  <span className="font-medium capitalize">
                    {type.replace(/_/g, " ").toLowerCase()}
                  </span>
                </div>
                <div className="text-2xl font-bold">{formatCompact(totalImpressions)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCompact(totalClicks)} clicks from {items.length} placements
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Placements</CardTitle>
          <CardDescription>Where your ads are showing</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placement</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placements.slice(0, 20).map((p, i) => (
                <TableRow key={`${p.placement}-${i}`}>
                  <TableCell className="font-medium max-w-xs truncate">
                    {p.display_name || p.placement}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {placementIcons[p.placement_type]}
                      <span className="text-xs capitalize">
                        {p.placement_type.replace(/_/g, " ").toLowerCase()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{formatCompact(p.impressions)}</TableCell>
                  <TableCell className="text-right">{formatCompact(p.clicks)}</TableCell>
                  <TableCell className="text-right">{formatPercent(p.ctr ?? 0)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(microsToDollars(p.cost_micros))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Top Combinations Section
function TopCombinationsSection({
  accountId,
  assetGroups,
}: {
  accountId: string;
  assetGroups: AssetGroup[] | undefined;
}) {
  const [selectedAssetGroup, setSelectedAssetGroup] = useState<string>(
    assetGroups?.[0]?.asset_group_id ?? "",
  );

  const { data, isLoading } = useTopCombinations(accountId, selectedAssetGroup);

  if (!assetGroups || assetGroups.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No asset groups available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Best Performing Asset Combinations</h4>
          <p className="text-sm text-muted-foreground">
            See which headline + description pairs work best together
          </p>
        </div>
        <Select value={selectedAssetGroup} onValueChange={setSelectedAssetGroup}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select asset group" />
          </SelectTrigger>
          <SelectContent>
            {assetGroups.map((ag) => (
              <SelectItem key={ag.asset_group_id} value={ag.asset_group_id}>
                {ag.asset_group_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && data?.combinations && data.combinations.length > 0 && (
        <div className="space-y-3">
          {data.combinations.map((combo, idx) => (
            <Card key={idx} className={idx === 0 ? "border-green-500 bg-green-50/50 dark:bg-green-950/20" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={idx === 0 ? "default" : "secondary"}>#{combo.rank}</Badge>
                    {idx === 0 && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Top Performer
                      </Badge>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {formatCompact(combo.impressions)} impressions
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {combo.assets.map((asset, assetIdx) => (
                    <div key={assetIdx} className="flex items-start gap-2">
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {asset.field_type}
                      </Badge>
                      <span className="text-sm">{asset.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && (!data?.combinations || data.combinations.length === 0) && (
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No combination data available yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Google needs more data to determine top combinations
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Segmented Performance Section
function SegmentedPerformanceSection({
  accountId,
  campaignId,
}: {
  accountId: string;
  campaignId: string;
}) {
  const [segmentBy, setSegmentBy] = useState<SegmentType>("device");

  const { data, isLoading } = useSegmentedPerformance(accountId, campaignId, segmentBy);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Performance Breakdown</h4>
          <p className="text-sm text-muted-foreground">
            Analyze performance by device or network
          </p>
        </div>
        <Select value={segmentBy} onValueChange={(v) => setSegmentBy(v as SegmentType)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="device">By Device</SelectItem>
            <SelectItem value="network">By Network</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && data?.segments && data.segments.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.segments.map((seg) => (
              <Card key={seg.segment}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {segmentBy === "device" && deviceIcons[seg.segment]}
                    {segmentBy === "network" && <Network className="h-4 w-4" />}
                    <span className="font-medium capitalize">
                      {seg.segment.replace(/_/g, " ").toLowerCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Impressions</p>
                      <p className="font-medium">{formatCompact(seg.impressions)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Clicks</p>
                      <p className="font-medium">{formatCompact(seg.clicks)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">CTR</p>
                      <p className="font-medium">{formatPercent(seg.ctr)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cost</p>
                      <p className="font-medium">
                        {formatCurrency(microsToDollars(seg.cost_micros))}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Conversions</p>
                      <p className="font-medium">{seg.conversions.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg. CPC</p>
                      <p className="font-medium">
                        {formatCurrency(microsToDollars(seg.average_cpc))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{segmentBy === "device" ? "Device" : "Network"}</TableHead>
                    <TableHead className="text-right">Impressions</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Conversions</TableHead>
                    <TableHead className="text-right">Avg. CPC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.segments.map((seg) => (
                    <TableRow key={seg.segment}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {segmentBy === "device" && deviceIcons[seg.segment]}
                          {segmentBy === "network" && <Network className="h-4 w-4" />}
                          <span className="capitalize">
                            {seg.segment.replace(/_/g, " ").toLowerCase()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{formatCompact(seg.impressions)}</TableCell>
                      <TableCell className="text-right">{formatCompact(seg.clicks)}</TableCell>
                      <TableCell className="text-right">{formatPercent(seg.ctr)}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(microsToDollars(seg.cost_micros))}
                      </TableCell>
                      <TableCell className="text-right">{seg.conversions.toFixed(1)}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(microsToDollars(seg.average_cpc))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {!isLoading && (!data?.segments || data.segments.length === 0) && (
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No segmented data available</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Main Insights Tab Component
export function InsightsTab({ accountId, campaignId, assetGroups }: InsightsTabProps) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="placements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="placements">Placements</TabsTrigger>
          <TabsTrigger value="combinations">Top Combinations</TabsTrigger>
          <TabsTrigger value="segments">Performance Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="placements">
          <PlacementsSection accountId={accountId} campaignId={campaignId} />
        </TabsContent>

        <TabsContent value="combinations">
          <TopCombinationsSection accountId={accountId} assetGroups={assetGroups} />
        </TabsContent>

        <TabsContent value="segments">
          <SegmentedPerformanceSection accountId={accountId} campaignId={campaignId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
