import { type CSSProperties } from "react";

import { type ToolClass } from "@opencoven/ui/components/tool-class-badge";
import { cn } from "@opencoven/ui/lib/utils";

type ToolMixValue = {
  tool: ToolClass;
  value: number;
};

const TOOL_ORDER: ToolClass[] = ["read", "exec", "write", "net"];

const toolStyles: Record<ToolClass, string> = {
  read: "bg-tool-read",
  write: "bg-tool-write",
  exec: "bg-tool-exec",
  net: "bg-tool-net",
};

type ToolMixProps = {
  values: ToolMixValue[];
  label?: string;
  className?: string;
};

function ToolMix({ values, label = "Tool usage", className }: ToolMixProps) {
  const normalized = TOOL_ORDER.map((tool) => ({
    tool,
    value: Math.max(0, values.find((entry) => entry.tool === tool)?.value ?? 0),
  }));
  const total = normalized.reduce((sum, entry) => sum + entry.value, 0);
  const percentages = normalized.map((entry) => ({
    ...entry,
    percentage: total === 0 ? 0 : Math.round((entry.value / total) * 100),
  }));
  const accessibleLabel = percentages
    .map(({ tool, percentage }) => `${tool} ${percentage} percent`)
    .join(", ");

  return (
    <figure
      data-slot="tool-mix"
      className={cn("grid gap-2", className)}
      aria-label={`${label}: ${accessibleLabel}`}
    >
      <div
        role="img"
        aria-label={accessibleLabel}
        className="flex h-2.5 overflow-hidden rounded-sm bg-muted"
      >
        {percentages.map(({ tool, percentage }) => (
          <span
            key={tool}
            data-tool={tool}
            className={cn("h-full min-w-px", toolStyles[tool])}
            style={{ width: `${percentage}%` } as CSSProperties}
          />
        ))}
      </div>
      <figcaption className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {percentages.map(({ tool, percentage }) => (
          <span
            key={tool}
            className="inline-flex items-center gap-1 capitalize"
          >
            <span
              aria-hidden="true"
              className={cn("size-2 rounded-sm", toolStyles[tool])}
            />
            {tool}
            <strong className="numeric text-foreground">{percentage}%</strong>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

export { TOOL_ORDER, ToolMix, type ToolMixProps, type ToolMixValue };
