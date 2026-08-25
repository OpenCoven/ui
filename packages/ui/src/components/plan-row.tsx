import { StatusIndicator, type Status } from "./status-indicator";
import { cn } from "@opencoven/ui/lib/utils";

type PlanRowProps = {
  title: string;
  status: Extract<Status, "pending" | "active" | "complete" | "blocked">;
  duration?: string;
  density?: "default" | "compact";
  className?: string;
};

function PlanRow({
  title,
  status,
  duration,
  density = "default",
  className,
}: PlanRowProps) {
  const displayedDuration =
    status === "active" ? "now" : status === "pending" ? "—" : duration;

  return (
    <div
      data-slot="plan-row"
      data-status={status}
      data-density={density}
      className={cn(
        "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-3 py-2 last:border-b-0",
        density === "compact" && "px-2 py-1.5 text-xs",
        className,
      )}
    >
      <StatusIndicator status={status} label="" aria-label={status} />
      <span
        className={cn(
          "truncate text-sm",
          status === "active" && "font-semibold",
          status === "complete" &&
            "text-muted-foreground line-through decoration-border",
        )}
      >
        {title}
      </span>
      <span className="numeric text-xs text-muted-foreground">
        {displayedDuration}
      </span>
    </div>
  );
}

export { PlanRow, type PlanRowProps };
