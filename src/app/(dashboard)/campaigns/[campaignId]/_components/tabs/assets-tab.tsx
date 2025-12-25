"use client";

import { Layers, Loader2, Plus, Search, Trash2, Type, Users } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAddSearchThemeSignal,
  useRemoveSignal,
  useSignals,
} from "@/features/campaigns";
import type { AssetGroup, AssetGroupSignal, AssetGroupWithAssets, TextAsset } from "@/features/campaigns/types";
import { performanceColors, statusColors } from "../constants";

interface AssetsTabProps {
  accountId: string;
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

// Signals Section for an Asset Group
function SignalsSection({
  accountId,
  assetGroup,
}: {
  accountId: string;
  assetGroup: AssetGroup;
}) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSearchTheme, setNewSearchTheme] = useState("");

  const { data: signalsData, isLoading } = useSignals(accountId, assetGroup.asset_group_id);
  const addSearchTheme = useAddSearchThemeSignal(accountId, assetGroup.asset_group_id);
  const removeSignal = useRemoveSignal(accountId, assetGroup.asset_group_id);

  const signals = signalsData?.signals ?? [];

  const handleAddSearchTheme = () => {
    if (newSearchTheme.trim()) {
      addSearchTheme.mutate(newSearchTheme.trim(), {
        onSuccess: () => {
          setNewSearchTheme("");
          setIsAddDialogOpen(false);
        },
      });
    }
  };

  const handleRemoveSignal = (signalId: string) => {
    removeSignal.mutate(signalId);
  };

  return (
    <div className="mt-3 pt-3 border-t">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Targeting Signals ({signals.length})
        </p>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Add Signal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Search Theme Signal</DialogTitle>
              <DialogDescription>
                Add a search theme to help Google understand what your audience is searching for.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="searchTheme">Search Theme</Label>
                <Input
                  id="searchTheme"
                  placeholder="e.g., luxury hotels near me"
                  value={newSearchTheme}
                  onChange={(e) => setNewSearchTheme(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSearchTheme()}
                />
                <p className="text-xs text-muted-foreground">
                  Enter keywords or phrases your target audience might search for
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddSearchTheme}
                disabled={!newSearchTheme.trim() || addSearchTheme.isPending}
              >
                {addSearchTheme.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : null}
                Add Signal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : signals.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {signals.map((signal) => (
            <Badge
              key={signal.signal_id}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              {signal.signal_type === "SEARCH_THEME" ? (
                <Search className="h-3 w-3" />
              ) : (
                <Users className="h-3 w-3" />
              )}
              <span>
                {signal.signal_type === "SEARCH_THEME"
                  ? signal.search_theme
                  : signal.audience_name}
              </span>
              <button
                onClick={() => handleRemoveSignal(signal.signal_id)}
                className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                disabled={removeSignal.isPending}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">
          No signals configured. Add search themes or audiences to improve targeting.
        </p>
      )}
    </div>
  );
}

export function AssetsTab({
  accountId,
  assetGroups,
  assetGroupsLoading,
  textAssets,
  textAssetsLoading,
}: AssetsTabProps) {
  return (
    <div className="space-y-6">
      {/* Asset Groups with Signals */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Asset Groups & Targeting</CardTitle>
          </div>
          <CardDescription>Manage assets and targeting signals for this campaign</CardDescription>
        </CardHeader>
        <CardContent>
          {assetGroupsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : assetGroups && assetGroups.length > 0 ? (
            <div className="space-y-4">
              {assetGroups.map((group) => (
                <div
                  key={group.asset_group_id}
                  className="rounded-lg border p-4"
                >
                  <div className="flex items-start justify-between">
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
                  {/* Signals Section */}
                  <SignalsSection accountId={accountId} assetGroup={group} />
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
