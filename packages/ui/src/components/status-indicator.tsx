import { Check, Circle, LoaderCircle, TriangleAlert } from "lucide-react";
import * as React from "react";

import { cn } from "@opencoven/ui/lib/utils";

type Status = "pending" | "active" | "complete" | "blocked";

const statusConfig = {
  pending: {
    icon: Circle,
    label: "Pending",
    className: "text-muted-foreground",
  },
  active: {
    icon: LoaderCircle,
    label: "Active",
    className: "text-presence",
  },
  complete: {
    icon: Check,
    label: "Complete",
    className: "text-success",
  },
  blocked: {
    icon: TriangleAlert,
    label: "Blocked",
    className: "text-warning",
  },
} as const;

type StatusIndicatorProps = Omit<React.ComponentProps<"span">, "children"> & {
  status: Status;
  label?: string;
};

function StatusIndicator({
  status,
  label = statusConfig[status].label,
  className,
  ...props
}: StatusIndicatorProps) {
  const Icon = statusConfig[status].icon;
  return (
    <span
      data-slot="status-indicator"
      data-status={status}
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        statusConfig[status].className,
        className,
      )}
      {...props}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          "size-3.5",
          status === "active" && "animate-spin motion-reduce:animate-none",
        )}
      />
      {label}
    </span>
  );
}

export { StatusIndicator, type Status, type StatusIndicatorProps };
