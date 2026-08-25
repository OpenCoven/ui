import * as React from "react";

import { cn } from "@opencoven/ui/lib/utils";

const toolClassStyles = {
  read: "border-tool-read/40 bg-tool-read/12 text-tool-read",
  write: "border-tool-write/40 bg-tool-write/12 text-tool-write",
  exec: "border-tool-exec/40 bg-tool-exec/12 text-tool-exec",
  net: "border-tool-net/40 bg-tool-net/12 text-tool-net",
} as const;

type ToolClass = keyof typeof toolClassStyles;

type ToolClassBadgeProps = React.ComponentProps<"span"> & {
  tool: ToolClass;
};

function ToolClassBadge({
  tool,
  className,
  children,
  ...props
}: ToolClassBadgeProps) {
  return (
    <span
      data-slot="tool-class-badge"
      data-tool={tool}
      className={cn(
        "numeric inline-flex items-center rounded-sm border px-1.5 py-0.5 text-xs font-semibold",
        toolClassStyles[tool],
        className,
      )}
      {...props}
    >
      {children ?? tool}
    </span>
  );
}

export {
  ToolClassBadge,
  toolClassStyles,
  type ToolClass,
  type ToolClassBadgeProps,
};
