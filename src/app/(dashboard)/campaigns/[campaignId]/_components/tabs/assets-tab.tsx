"use client";

import { Layers, Loader2, Type } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AssetGroup, AssetGroupWithAssets, TextAsset } from "@/features/campaigns/types";
import { performanceColors, statusColors } from "../constants";

interface AssetsTabProps {
  assetGroups: AssetGroup[] | undefined;
  assetGroupsLoading: boolean;
  textAssets: AssetGroupWithAssets[] | undefined;
  textAssetsLoading: boolean;
}

function TextAssetItem({ asset }: { asset: TextAsset }) {
  return (
    <div className="flex items-start justify-between gap-2 rounded border p-2 text-sm">
      <span className="flex-1">{asset.text}</span>
      {asset.performance_label && (
        <span
          className={`shrink-0 rounded border px-1.5 py-0.5 text-xs font-medium ${performanceColors[asset.performance_label] ?? performanceColors.UNSPECIFIED}`}
        >
          {asset.performance_label}
        </span>
      )}
    </div>
  );
}

export function AssetsTab({
  assetGroups,
  assetGroupsLoading,
  textAssets,
  textAssetsLoading,
}: AssetsTabProps) {
  return (
    <div className="space-y-6">
      {/* Asset Groups */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Asset Groups</CardTitle>
          </div>
          <CardDescription>Manage assets for this campaign</CardDescription>
        </CardHeader>
        <CardContent>
          {assetGroupsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : assetGroups && assetGroups.length > 0 ? (
            <div className="space-y-3">
              {assetGroups.map((group) => (
                <div
                  key={group.asset_group_id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{group.asset_group_name}</p>
                    <p className="text-sm text-muted-foreground">ID: {group.asset_group_id}</p>
                    {group.final_url && (
                      <p className="text-sm text-muted-foreground truncate max-w-md">
                        {group.final_url}
                      </p>
                    )}
                  </div>
                  {group.status && (
                    <Badge variant={statusColors[group.status] ?? "secondary"}>
                      {group.status}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No asset groups found</p>
          )}
        </CardContent>
      </Card>

      {/* Text Assets */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Type className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Text Assets</CardTitle>
          </div>
          <CardDescription>
            Headlines, long headlines, and descriptions for this campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          {textAssetsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : textAssets && textAssets.length > 0 ? (
            <div className="space-y-6">
              {textAssets.map((group) => (
                <div key={group.asset_group_id} className="space-y-3">
                  <h4 className="font-medium text-sm border-b pb-2">{group.asset_group_name}</h4>

                  {group.headlines.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Headlines ({group.headlines.length})
                      </p>
                      <div className="space-y-1">
                        {group.headlines.map((asset) => (
                          <TextAssetItem key={asset.asset_id} asset={asset} />
                        ))}
                      </div>
                    </div>
                  )}

                  {group.long_headlines.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Long Headlines ({group.long_headlines.length})
                      </p>
                      <div className="space-y-1">
                        {group.long_headlines.map((asset) => (
                          <TextAssetItem key={asset.asset_id} asset={asset} />
                        ))}
                      </div>
                    </div>
                  )}

                  {group.descriptions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Descriptions ({group.descriptions.length})
                      </p>
                      <div className="space-y-1">
                        {group.descriptions.map((asset) => (
                          <TextAssetItem key={asset.asset_id} asset={asset} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No text assets found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
