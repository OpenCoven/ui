import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@opencoven/ui/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit items-center gap-1 rounded-sm border px-1.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "border-border bg-muted text-muted-foreground",
        presence: "border-presence/40 bg-presence/12 text-presence",
        success: "border-success/40 bg-success/12 text-success",
        warning: "border-warning/40 bg-warning/12 text-warning",
        destructive: "border-destructive/40 bg-destructive/12 text-destructive",
        information: "border-information/40 bg-information/12 text-information",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

function Badge({
  className,
  variant = "neutral",
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
