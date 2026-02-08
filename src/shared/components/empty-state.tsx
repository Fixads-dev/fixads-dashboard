"use client";

import { type LucideIcon, Package } from "lucide-react";
import { type ReactNode, isValidElement } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateActionObject {
  label: string;
  onClick: () => void;
}

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Accept either a ReactNode (JSX) or an action config object */
  action?: ReactNode | EmptyStateActionObject;
  children?: ReactNode;
  className?: string;
}

function isActionObject(action: unknown): action is EmptyStateActionObject {
  return (
    typeof action === "object" &&
    action !== null &&
    !isValidElement(action) &&
    "label" in action &&
    "onClick" in action
  );
}

export function EmptyState({
  icon: Icon = Package,
  title,
  description,
  action,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center",
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground max-w-sm">{description}</p>}
      </div>
      {action &&
        (isActionObject(action) ? (
          <Button onClick={action.onClick} className="mt-2">
            {action.label}
          </Button>
        ) : (
          action
        ))}
      {children}
    </div>
  );
}
