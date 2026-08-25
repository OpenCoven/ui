import { Progress } from "@opencoven/ui/components/ui/progress";
import { cn } from "@opencoven/ui/lib/utils";

type ContextMeterProps = {
  used: number;
  total: number;
  threshold?: number;
  density?: "default" | "compact";
  className?: string;
};

function ContextMeter({
  used,
  total,
  threshold = 0.8,
  density = "default",
  className,
}: ContextMeterProps) {
  const percentage = total > 0 ? Math.min(used / total, 1) : 0;
  const warning = percentage >= threshold;
  const percentLabel = Math.round(percentage * 100);

  return (
    <div
      data-slot="context-meter"
      data-state={warning ? "warning" : "normal"}
      data-density={density}
      className={cn("grid gap-1.5", className)}
    >
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="text-muted-foreground">Context</span>
        <strong
          className={cn("numeric text-foreground", warning && "text-warning")}
        >
          {percentLabel}% · {used.toLocaleString()} / {total.toLocaleString()}
        </strong>
      </div>
      <div className="relative">
        <Progress
          value={used}
          max={total}
          label={`${percentLabel}% of context used`}
          indicatorClassName={warning ? "bg-warning" : "bg-presence"}
        />
        <span
          aria-hidden="true"
          className="absolute -inset-y-1 w-px bg-foreground/60"
          style={{ insetInlineStart: `${threshold * 100}%` }}
        />
      </div>
    </div>
  );
}

export { ContextMeter, type ContextMeterProps };
