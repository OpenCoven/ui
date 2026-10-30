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
import { PlanRow, type PlanRowProps } from "@opencoven/ui/components/plan-row";
import {
  ResourceRow,
  type ResourceRowProps,
} from "@opencoven/ui/components/resource-row";
import { Card } from "@opencoven/ui/components/ui/card";
import { cn } from "@opencoven/ui/lib/utils";
import {
  Activity,
  ChartNoAxesCombined,
  Files,
  ListChecks,
  ShieldCheck,
} from "lucide-react";

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
  plan?: PlanRowProps[];
  resources?: ResourceRowProps[];
  density?: "default" | "compact";
  className?: string;
};

function RunRail({
  metrics,
  activity,
  context,
  budget,
  plan = [],
  resources = [],
  density = "default",
  className,
}: RunRailProps) {
  return (
    <aside
      data-slot="run-rail"
      data-density={density}
      aria-label="Run status"
      className={cn("grid min-w-0 content-start gap-4", className)}
    >
      <div>
        <p className="numeric mb-2 flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.12em] text-information uppercase">
          <ChartNoAxesCombined aria-hidden="true" className="size-3.5" />
          Run overview
        </p>
        <Card className="grid grid-cols-3 divide-x divide-border border-information/25 bg-information/5">
          {metrics.map((metric) => (
            <MetricDisplay key={metric.label} {...metric} density={density} />
          ))}
        </Card>
      </div>
      {plan.length > 0 ? (
        <div>
          <p className="numeric mb-2 flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.12em] text-presence uppercase">
            <ListChecks aria-hidden="true" className="size-3.5" />
            Plan
            <span className="ms-auto">
              {plan.filter((step) => step.status === "complete").length} /{" "}
              {plan.length}
            </span>
          </p>
          <Card>
            {plan.map((step, index) => (
              <PlanRow
                key={`${step.title}-${index}`}
                {...step}
                density={density}
              />
            ))}
          </Card>
        </div>
      ) : null}
      <div>
        <p className="numeric mb-2 flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.12em] text-tool-exec uppercase">
          <Activity aria-hidden="true" className="size-3.5" />
          Activity
          <span className="ms-auto">
            {activity.some((item) => item.running) ? "Running" : "Idle"}
          </span>
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
      {resources.length > 0 ? (
        <div>
          <p className="numeric mb-2 flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.12em] text-tool-write uppercase">
            <Files aria-hidden="true" className="size-3.5" />
            Changed files
            <span className="ms-auto">{resources.length}</span>
          </p>
          <Card>
            {resources.map((resource) => (
              <ResourceRow
                key={resource.path}
                {...resource}
                density={density}
              />
            ))}
          </Card>
        </div>
      ) : null}
      <div>
        <p className="numeric mb-2 flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.12em] text-success uppercase">
          <ShieldCheck aria-hidden="true" className="size-3.5" />
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
