import { LoaderCircle } from "lucide-react";

import {
  ToolClassBadge,
  type ToolClass,
} from "@opencoven/ui/components/tool-class-badge";
import { cn } from "@opencoven/ui/lib/utils";

type ActivityItemProps = {
  tool: ToolClass;
  target: string;
  duration?: string;
  running?: boolean;
  density?: "default" | "compact";
  className?: string;
};

function ActivityItem({
  tool,
  target,
  duration,
  running = false,
  density = "default",
  className,
}: ActivityItemProps) {
  return (
    <div
      data-slot="activity-item"
      data-tool={tool}
      data-density={density}
      className={cn(
        "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 py-1.5",
        density === "compact" && "py-1 text-xs",
        className,
      )}
    >
      <ToolClassBadge tool={tool} />
      <span className="truncate text-sm text-muted-foreground">{target}</span>
      {running ? (
        <LoaderCircle
          aria-label="Running"
          className="size-3.5 animate-spin text-presence motion-reduce:animate-none"
        />
      ) : (
        <span className="numeric text-xs text-muted-foreground">
          {duration}
        </span>
      )}
    </div>
  );
}

export { ActivityItem, type ActivityItemProps };
