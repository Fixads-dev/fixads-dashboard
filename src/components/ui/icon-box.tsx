import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const iconBoxVariants = cva(
  "inline-flex items-center justify-center rounded-lg shrink-0 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary/10 text-primary",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive/10 text-destructive",
        success: "bg-green-500/10 text-green-600 dark:text-green-500",
        warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500",
        muted: "bg-muted text-muted-foreground",
      },
      size: {
        sm: "h-8 w-8 [&>svg]:h-4 [&>svg]:w-4",
        md: "h-10 w-10 [&>svg]:h-5 [&>svg]:w-5",
        lg: "h-12 w-12 [&>svg]:h-6 [&>svg]:w-6",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

interface IconBoxProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof iconBoxVariants> {
  icon: React.ReactNode;
}

function IconBox({ className, variant, size, icon, ...props }: IconBoxProps) {
  return (
    <div
      data-slot="icon-box"
      className={cn(iconBoxVariants({ variant, size }), className)}
      {...props}
    >
      {icon}
    </div>
  );
}

export { IconBox, iconBoxVariants };
