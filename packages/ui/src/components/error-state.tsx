import { AlertTriangle } from "lucide-react";
import * as React from "react";

import { cn } from "@opencoven/ui/lib/utils";

type ErrorStateProps = React.ComponentProps<"div"> & {
  title: string;
  description: string;
  action?: React.ReactNode;
};

function ErrorState({
  title,
  description,
  action,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      data-slot="error-state"
      role="alert"
      className={cn(
        "grid justify-items-start gap-2 rounded-lg border border-destructive/45 border-s-4 border-s-destructive bg-card p-5",
        className,
      )}
      {...props}
    >
      <AlertTriangle aria-hidden="true" className="size-5 text-destructive" />
      <strong>{title}</strong>
      <p className="m-0 text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

export { ErrorState, type ErrorStateProps };
