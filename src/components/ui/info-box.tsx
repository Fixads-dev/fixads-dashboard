import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const infoBoxVariants = cva("rounded-lg", {
  variants: {
    variant: {
      default: "bg-muted/50",
      muted: "bg-muted",
      primary: "bg-primary/5",
      success: "bg-green-500/5",
      warning: "bg-yellow-500/5",
      destructive: "bg-destructive/5",
    },
    padding: {
      sm: "p-2",
      md: "p-3",
      lg: "p-4",
      xl: "p-6",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
  },
});

interface InfoBoxProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof infoBoxVariants> {}

function InfoBox({ className, variant, padding, children, ...props }: InfoBoxProps) {
  return (
    <div
      data-slot="info-box"
      className={cn(infoBoxVariants({ variant, padding }), className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { InfoBox, infoBoxVariants };
