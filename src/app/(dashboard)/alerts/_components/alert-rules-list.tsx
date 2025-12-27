"use client";

import { Bell, Edit, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ALERT_METRIC_LABELS,
  ALERT_OPERATOR_LABELS,
  ALERT_TYPE_LABELS,
  type AlertRule,
  useDeleteAlertRule,
  useUpdateAlertRule,
} from "@/features/alerts";
import { AlertRuleDialog } from "./alert-rule-dialog";

interface AlertRulesListProps {
  rules: AlertRule[];
  isLoading: boolean;
  onCreateClick: () => void;
}

export function AlertRulesList({ rules, isLoading, onCreateClick }: AlertRulesListProps) {
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const updateRule = useUpdateAlertRule();
  const deleteRule = useDeleteAlertRule();

  const handleToggleEnabled = (rule: AlertRule) => {
    updateRule.mutate({
      ruleId: rule.id,
      data: { is_enabled: !rule.is_enabled },
    });
  };

  const handleDelete = (ruleId: string) => {
    if (confirm("Are you sure you want to delete this alert rule?")) {
      deleteRule.mutate(ruleId);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alert Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (rules.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="No Alert Rules"
        description="Create your first alert rule to get notified about important changes in your campaigns."
        action={
          <Button onClick={onCreateClick}>
            <Plus className="mr-2 h-4 w-4" />
            Create Alert Rule
          </Button>
        }
      />
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Alert Rules ({rules.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Active</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Channels</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <Switch
                      checked={rule.is_enabled}
                      onCheckedChange={() => handleToggleEnabled(rule)}
                      disabled={updateRule.isPending}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{ALERT_TYPE_LABELS[rule.alert_type]}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {ALERT_METRIC_LABELS[rule.metric]} {ALERT_OPERATOR_LABELS[rule.operator]}{" "}
                    {rule.threshold}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {rule.notification_channels?.map((channel) => (
                        <Badge key={channel} variant="secondary" className="text-xs">
                          {channel}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingRule(rule)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(rule.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <AlertRuleDialog
        open={!!editingRule}
        onOpenChange={(open) => !open && setEditingRule(null)}
        mode="edit"
        rule={editingRule ?? undefined}
      />
    </>
  );
}
