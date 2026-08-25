import { Inbox } from "lucide-react";
import * as React from "react";

import { cn } from "@opencoven/ui/lib/utils";

type EmptyStateProps = React.ComponentProps<"div"> & {
  title: string;
  description: string;
  action?: React.ReactNode;
};

function EmptyState({
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "grid justify-items-center gap-2 rounded-lg border border-dashed border-border bg-card p-8 text-center",
        className,
      )}
      {...props}
    >
      <Inbox aria-hidden="true" className="size-5 text-muted-foreground" />
      <strong>{title}</strong>
      <p className="m-0 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {action}
    </div>
  );
}

export { EmptyState, type EmptyStateProps };
