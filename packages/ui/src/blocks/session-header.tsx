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
        "flex min-w-0 flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-3",
        className,
      )}
    >
      <span className="min-w-0 flex-1">
        <strong className="block truncate text-sm">{title}</strong>
        <span className="numeric flex items-center gap-1 truncate text-xs text-muted-foreground">
          <GitBranch aria-hidden="true" className="size-3" />
          {branch}
        </span>
      </span>
      <StatusIndicator status={status} />
      {budget ? <BudgetPill {...budget} /> : null}
    </header>
  );
}

export { SessionHeader, type SessionHeaderProps };
