import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium [&>svg]:h-3 [&>svg]:w-3 [&>svg]:shrink-0",
  {
    variants: {
      status: {
        active: "bg-green-500/10 text-green-600 dark:text-green-500",
        inactive: "bg-muted text-muted-foreground",
        pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500",
        error: "bg-destructive/10 text-destructive",
        enabled: "bg-green-500/10 text-green-600 dark:text-green-500",
        paused: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500",
        removed: "bg-destructive/10 text-destructive",
        unknown: "bg-muted text-muted-foreground",
        // Budget pacing statuses
        on_track: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        underspending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        overspending: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        limited: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      },
    },
    defaultVariants: {
      status: "unknown",
    },
  },
);

interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  icon?: React.ReactNode;
}

function StatusBadge({ className, status, icon, children, ...props }: StatusBadgeProps) {
  return (
    <span
      data-slot="status-badge"
      className={cn(statusBadgeVariants({ status }), className)}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}

export { StatusBadge, statusBadgeVariants };
