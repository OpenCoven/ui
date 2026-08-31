import { GitBranch } from "lucide-react";

import { BudgetPill } from "@opencoven/ui/components/budget-pill";
import {
  StatusIndicator,
  type Status,
} from "@opencoven/ui/components/status-indicator";
import { cn } from "@opencoven/ui/lib/utils";

type SessionHeaderProps = {
  title: string;
  branch: string;
  status: Status;
  budget?: {
    used: number;
    limit: number;
  };
  className?: string;
};

function SessionHeader({
  title,
  branch,
  status,
  budget,
  className,
}: SessionHeaderProps) {
  return (
    <header
      data-slot="session-header"
      className={cn(
        "grid min-w-0 grid-cols-2 gap-x-3 gap-y-2 border-b border-border bg-card px-4 py-3 sm:flex sm:flex-wrap sm:items-center",
        className,
      )}
    >
      <span className="col-span-2 min-w-0 flex-1 sm:col-auto sm:basis-auto">
        <strong className="block text-sm leading-5 sm:truncate">{title}</strong>
        <span className="numeric flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
          <GitBranch aria-hidden="true" className="size-3 shrink-0" />
          <span className="min-w-0 truncate">{branch}</span>
        </span>
      </span>
      <span className="col-span-2 flex min-w-0 flex-wrap items-center justify-between gap-2 sm:contents">
        <StatusIndicator status={status} />
        {budget ? <BudgetPill {...budget} /> : null}
      </span>
    </header>
  );
}

export { SessionHeader, type SessionHeaderProps };
