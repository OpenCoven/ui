import { Circle, TriangleAlert } from "lucide-react";

import { cn } from "@opencoven/ui/lib/utils";

type BudgetState = "normal" | "warning" | "over";

type BudgetPillProps = {
  used: number;
  limit: number;
  currency?: string;
  className?: string;
};

function BudgetPill({
  used,
  limit,
  currency = "$",
  className,
}: BudgetPillProps) {
  const ratio = limit > 0 ? used / limit : 1;
  const state: BudgetState =
    ratio > 1 ? "over" : ratio >= 0.8 ? "warning" : "normal";
  const Icon = state === "normal" ? Circle : TriangleAlert;

  return (
    <span
      data-slot="budget-pill"
      data-state={state}
      className={cn(
        "numeric inline-flex items-center gap-1 rounded-sm border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground",
        state === "warning" &&
          "border-warning/40 bg-warning/12 font-semibold text-warning",
        state === "over" &&
          "border-destructive/45 bg-destructive/12 font-bold text-destructive",
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-3" />
      {currency}
      {used.toFixed(2)} / {currency}
      {limit.toFixed(2)}
      <span className="sr-only">
        {state === "normal" ? "within budget" : `${state} budget state`}
      </span>
    </span>
  );
}

export { BudgetPill, type BudgetPillProps, type BudgetState };
