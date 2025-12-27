"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  CheckCircle,
  Edit,
  MoreHorizontal,
  Play,
  Plus,
  Trash2,
  Webhook,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
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
  type Webhook as WebhookType,
  useCreateWebhook,
  useDeleteWebhook,
  useTestWebhook,
  useUpdateWebhook,
  useWebhooks,
} from "@/features/alerts";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  url: z.string().url("Must be a valid URL"),
  secret: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function WebhookManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookType | null>(null);

  const { data: webhooksData, isLoading } = useWebhooks();
  const createWebhook = useCreateWebhook();
  const updateWebhook = useUpdateWebhook();
  const deleteWebhook = useDeleteWebhook();
  const testWebhook = useTestWebhook();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      url: "",
      secret: "",
    },
  });

  const handleOpenDialog = (webhook?: WebhookType) => {
    if (webhook) {
      setEditingWebhook(webhook);
      form.reset({
        name: webhook.name,
        url: webhook.url,
        secret: "",
      });
    } else {
      setEditingWebhook(null);
      form.reset({
        name: "",
        url: "",
        secret: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingWebhook(null);
    form.reset();
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (editingWebhook) {
        await updateWebhook.mutateAsync({
          webhookId: editingWebhook.id,
          data: {
            name: values.name,
            url: values.url,
            secret: values.secret || undefined,
          },
        });
        toast.success("Webhook updated");
      } else {
        await createWebhook.mutateAsync({
          name: values.name,
          url: values.url,
          secret: values.secret || undefined,
        });
        toast.success("Webhook created");
      }
      handleCloseDialog();
    } catch {
      toast.error("Failed to save webhook");
    }
  };

  const handleToggleActive = async (webhook: WebhookType) => {
    try {
      await updateWebhook.mutateAsync({
        webhookId: webhook.id,
        data: { is_active: !webhook.is_active },
      });
      toast.success(webhook.is_active ? "Webhook disabled" : "Webhook enabled");
    } catch {
      toast.error("Failed to update webhook");
    }
  };

  const handleDelete = async (webhookId: string) => {
    if (!confirm("Are you sure you want to delete this webhook?")) return;
    try {
      await deleteWebhook.mutateAsync(webhookId);
      toast.success("Webhook deleted");
    } catch {
      toast.error("Failed to delete webhook");
    }
  };

  const handleTest = async (webhookId: string) => {
    try {
      const result = await testWebhook.mutateAsync(webhookId);
      if (result.success) {
        toast.success(`Webhook test successful (${result.response_time_ms}ms)`);
      } else {
        toast.error(`Webhook test failed: ${result.error_message}`);
      }
    } catch {
      toast.error("Failed to test webhook");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Webhooks</CardTitle>
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

  const webhooks = webhooksData?.webhooks ?? [];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Webhooks</CardTitle>
            <CardDescription>
              Configure webhooks to receive alert notifications in external services.
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Webhook
          </Button>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <EmptyState
              icon={Webhook}
              title="No Webhooks"
              description="Add a webhook to receive alerts in external services like Slack or Zapier."
              action={
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Webhook
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Active</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Triggered</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map((webhook) => (
                  <TableRow key={webhook.id}>
                    <TableCell>
                      <Switch
                        checked={webhook.is_active}
                        onCheckedChange={() => handleToggleActive(webhook)}
                        disabled={updateWebhook.isPending}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{webhook.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {webhook.url}
                    </TableCell>
                    <TableCell>
                      {webhook.consecutive_failures > 0 ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {webhook.consecutive_failures} failures
                        </Badge>
                      ) : webhook.last_success_at ? (
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Healthy
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not tested</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {webhook.last_triggered_at
                        ? formatDistanceToNow(new Date(webhook.last_triggered_at), {
                            addSuffix: true,
                          })
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleTest(webhook.id)}>
                            <Play className="mr-2 h-4 w-4" />
                            Test
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenDialog(webhook)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(webhook.id)}
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
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingWebhook ? "Edit Webhook" : "Add Webhook"}</DialogTitle>
            <DialogDescription>
              {editingWebhook
                ? "Update your webhook configuration."
                : "Configure a new webhook endpoint to receive alert notifications."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Slack Alerts" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://hooks.slack.com/services/..." {...field} />
                    </FormControl>
                    <FormDescription>The URL that will receive POST requests</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="secret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secret (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={editingWebhook ? "(unchanged)" : "Enter secret"}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Used to sign webhook payloads with HMAC-SHA256
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createWebhook.isPending || updateWebhook.isPending}
                >
                  {createWebhook.isPending || updateWebhook.isPending
                    ? "Saving..."
                    : editingWebhook
                      ? "Save Changes"
                      : "Add Webhook"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
