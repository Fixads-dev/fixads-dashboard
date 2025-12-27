"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Bell, Mail, Webhook } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  DIGEST_FREQUENCY_LABELS,
  type DigestFrequency,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/features/alerts";

const formSchema = z.object({
  email_enabled: z.boolean(),
  webhook_enabled: z.boolean(),
  in_app_enabled: z.boolean(),
  email_address: z.string().email().optional().or(z.literal("")),
  digest_frequency: z.string(),
  quiet_hours_enabled: z.boolean(),
  quiet_hours_start: z.string().optional(),
  quiet_hours_end: z.string().optional(),
  timezone: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

const digestOptions = Object.entries(DIGEST_FREQUENCY_LABELS) as [DigestFrequency, string][];

export function NotificationSettings() {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email_enabled: true,
      webhook_enabled: false,
      in_app_enabled: true,
      email_address: "",
      digest_frequency: "IMMEDIATE",
      quiet_hours_enabled: false,
      quiet_hours_start: "22:00",
      quiet_hours_end: "08:00",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  useEffect(() => {
    if (preferences) {
      form.reset({
        email_enabled: preferences.email_enabled,
        webhook_enabled: preferences.webhook_enabled,
        in_app_enabled: preferences.in_app_enabled,
        email_address: preferences.email_address ?? "",
        digest_frequency: preferences.digest_frequency,
        quiet_hours_enabled: preferences.quiet_hours_enabled,
        quiet_hours_start: preferences.quiet_hours_start ?? "22:00",
        quiet_hours_end: preferences.quiet_hours_end ?? "08:00",
        timezone: preferences.timezone,
      });
    }
  }, [preferences, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      await updatePreferences.mutateAsync({
        email_enabled: values.email_enabled,
        webhook_enabled: values.webhook_enabled,
        in_app_enabled: values.in_app_enabled,
        email_address: values.email_address || undefined,
        digest_frequency: values.digest_frequency as DigestFrequency,
        quiet_hours_enabled: values.quiet_hours_enabled,
        quiet_hours_start: values.quiet_hours_enabled ? values.quiet_hours_start : undefined,
        quiet_hours_end: values.quiet_hours_enabled ? values.quiet_hours_end : undefined,
        timezone: values.timezone,
      });
      toast.success("Notification preferences updated");
    } catch {
      toast.error("Failed to update preferences");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Configure how and when you want to receive alert notifications.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Notification Channels */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Notification Channels</h3>

              <FormField
                control={form.control}
                name="in_app_enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <FormLabel className="text-base">In-App Notifications</FormLabel>
                        <FormDescription>Show notifications in the dashboard</FormDescription>
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email_enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <FormLabel className="text-base">Email Notifications</FormLabel>
                        <FormDescription>Receive alerts via email</FormDescription>
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("email_enabled") && (
                <FormField
                  control={form.control}
                  name="email_address"
                  render={({ field }) => (
                    <FormItem className="ml-8">
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="webhook_enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <Webhook className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <FormLabel className="text-base">Webhook Notifications</FormLabel>
                        <FormDescription>Send alerts to your webhooks</FormDescription>
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Digest Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Digest Settings</h3>

              <FormField
                control={form.control}
                name="digest_frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification Frequency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {digestOptions.map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>How often to send notification digests</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Quiet Hours */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Quiet Hours</h3>

              <FormField
                control={form.control}
                name="quiet_hours_enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <FormLabel className="text-base">Enable Quiet Hours</FormLabel>
                      <FormDescription>
                        Pause notifications during specified hours
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("quiet_hours_enabled") && (
                <div className="ml-8 grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quiet_hours_start"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quiet_hours_end"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {/* Timezone */}
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly className="bg-muted" />
                  </FormControl>
                  <FormDescription>Your timezone (auto-detected)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={updatePreferences.isPending}>
              {updatePreferences.isPending ? "Saving..." : "Save Preferences"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
