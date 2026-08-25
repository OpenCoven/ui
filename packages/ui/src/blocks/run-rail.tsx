import {
  ActivityItem,
  type ActivityItemProps,
} from "@opencoven/ui/components/activity-item";
import { BudgetPill } from "@opencoven/ui/components/budget-pill";
import { ContextMeter } from "@opencoven/ui/components/context-meter";
import {
  MetricDisplay,
  type MetricDisplayProps,
} from "@opencoven/ui/components/metric-display";
import { Card } from "@opencoven/ui/components/ui/card";
import { cn } from "@opencoven/ui/lib/utils";

type RunRailProps = {
  metrics: MetricDisplayProps[];
  activity: ActivityItemProps[];
  context: {
    used: number;
    total: number;
    threshold?: number;
  };
  budget: {
    used: number;
    limit: number;
  };
  density?: "default" | "compact";
  className?: string;
};

function RunRail({
  metrics,
  activity,
  context,
  budget,
  density = "default",
  className,
}: RunRailProps) {
  return (
    <aside
      data-slot="run-rail"
      data-density={density}
      aria-label="Run status"
      className={cn("grid content-start gap-4", className)}
    >
      <div>
        <p className="numeric mb-2 text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          Run
        </p>
        <Card className="grid grid-cols-3 divide-x divide-border">
          {metrics.map((metric) => (
            <MetricDisplay key={metric.label} {...metric} density={density} />
          ))}
        </Card>
      </div>
      <div>
        <p className="numeric mb-2 text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          Activity
        </p>
        <Card className="divide-y divide-border px-3 py-1">
          {activity.map((item, index) => (
            <ActivityItem
              key={`${item.tool}-${index}`}
              {...item}
              density={density}
            />
          ))}
        </Card>
      </div>
      <div>
        <p className="numeric mb-2 text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          Limits
        </p>
        <Card className="grid gap-3 p-3">
          <ContextMeter {...context} density={density} />
          <BudgetPill {...budget} className="justify-self-start" />
        </Card>
      </div>
    </aside>
  );
}

export { RunRail, type RunRailProps };
