"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ALERT_METRIC_LABELS,
  ALERT_OPERATOR_LABELS,
  ALERT_TYPE_LABELS,
  type AlertMetric,
  type AlertOperator,
  type AlertRule,
  type AlertType,
  type NotificationChannel,
  useCreateAlertRule,
  useUpdateAlertRule,
} from "@/features/alerts";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  alert_type: z.string().min(1, "Alert type is required"),
  metric: z.string().min(1, "Metric is required"),
  operator: z.string().min(1, "Operator is required"),
  threshold: z.string().min(1, "Threshold is required"),
  notification_channels: z.array(z.string()).min(1, "Select at least one channel"),
  cooldown_minutes: z.string().min(1, "Cooldown is required"),
  email_recipients: z.string().optional(),
  webhook_url: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AlertRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  rule?: AlertRule;
}

const alertTypes = Object.entries(ALERT_TYPE_LABELS) as [AlertType, string][];
const metrics = Object.entries(ALERT_METRIC_LABELS) as [AlertMetric, string][];
const operators = Object.entries(ALERT_OPERATOR_LABELS) as [AlertOperator, string][];

const channels: { id: NotificationChannel; label: string }[] = [
  { id: "in_app", label: "In-App" },
  { id: "email", label: "Email" },
  { id: "webhook", label: "Webhook" },
];

export function AlertRuleDialog({ open, onOpenChange, mode, rule }: AlertRuleDialogProps) {
  const createRule = useCreateAlertRule();
  const updateRule = useUpdateAlertRule();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      alert_type: "BUDGET_THRESHOLD",
      metric: "cost",
      operator: "gt",
      threshold: "0",
      notification_channels: ["in_app"],
      cooldown_minutes: "60",
      email_recipients: "",
      webhook_url: "",
    },
  });

  useEffect(() => {
    if (mode === "edit" && rule) {
      form.reset({
        name: rule.name,
        alert_type: rule.alert_type,
        metric: rule.metric,
        operator: rule.operator,
        threshold: String(rule.threshold),
        notification_channels: rule.notification_channels ?? ["in_app"],
        cooldown_minutes: String(rule.cooldown_minutes),
        email_recipients: rule.email_recipients?.join(", ") ?? "",
        webhook_url: rule.webhook_url ?? "",
      });
    } else if (mode === "create") {
      form.reset({
        name: "",
        alert_type: "BUDGET_THRESHOLD",
        metric: "cost",
        operator: "gt",
        threshold: "0",
        notification_channels: ["in_app"],
        cooldown_minutes: "60",
        email_recipients: "",
        webhook_url: "",
      });
    }
  }, [mode, rule, form]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name,
      alert_type: values.alert_type as AlertType,
      metric: values.metric as AlertMetric,
      operator: values.operator as AlertOperator,
      threshold: parseFloat(values.threshold),
      notification_channels: values.notification_channels as NotificationChannel[],
      cooldown_minutes: parseInt(values.cooldown_minutes, 10),
      email_recipients: values.email_recipients
        ? values.email_recipients.split(",").map((e) => e.trim())
        : undefined,
      webhook_url: values.webhook_url || undefined,
    };

    if (mode === "create") {
      await createRule.mutateAsync(payload);
    } else if (rule) {
      await updateRule.mutateAsync({
        ruleId: rule.id,
        data: {
          name: payload.name,
          threshold: payload.threshold,
          notification_channels: payload.notification_channels,
          cooldown_minutes: payload.cooldown_minutes,
          email_recipients: payload.email_recipients,
          webhook_url: payload.webhook_url,
        },
      });
    }
    onOpenChange(false);
  };

  const isPending = createRule.isPending || updateRule.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Alert Rule" : "Edit Alert Rule"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Set up a new alert rule to get notified about important changes."
              : "Modify your alert rule settings."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rule Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., High CPA Alert" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="alert_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alert Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={mode === "edit"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {alertTypes.map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metric"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metric</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={mode === "edit"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select metric" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {metrics.map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="operator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={mode === "edit"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {operators.map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="threshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Threshold Value</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notification_channels"
              render={() => (
                <FormItem>
                  <FormLabel>Notification Channels</FormLabel>
                  <div className="flex gap-4">
                    {channels.map((channel) => (
                      <FormField
                        key={channel.id}
                        control={form.control}
                        name="notification_channels"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(channel.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, channel.id]);
                                  } else {
                                    field.onChange(
                                      field.value?.filter((v: string) => v !== channel.id),
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="cursor-pointer font-normal">
                              {channel.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("notification_channels")?.includes("email") && (
              <FormField
                control={form.control}
                name="email_recipients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Recipients</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com, other@example.com" {...field} />
                    </FormControl>
                    <FormDescription>Comma-separated list of email addresses</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {form.watch("notification_channels")?.includes("webhook") && (
              <FormField
                control={form.control}
                name="webhook_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://your-webhook.com/alerts" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="cooldown_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cooldown (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="1440" {...field} />
                  </FormControl>
                  <FormDescription>
                    Minimum time between repeated alerts (1-1440 minutes)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : mode === "create" ? "Create Rule" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
