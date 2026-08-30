import {
  CheckCircle2,
  CircleDashed,
  CircleOff,
  ShieldCheck,
  ShieldQuestion,
  TriangleAlert,
} from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@opencoven/ui/lib/utils";

type ConnectionState =
  | "connected"
  | "pending"
  | "degraded"
  | "disconnected"
  | "unavailable";

type AuthorityLevel =
  | "read-only"
  | "proposal"
  | "mutating"
  | "local-authority";

type ConnectionStatusProps = {
  name: string;
  kind: "SDK" | "CLI" | "Daemon" | "Runtime" | "Project";
  state: ConnectionState;
  authority: AuthorityLevel;
  detail?: string;
  version?: string;
  meta?: string;
  action?: ReactNode;
  className?: string;
};

const stateDetails: Record<
  ConnectionState,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  connected: {
    label: "Connected",
    icon: CheckCircle2,
    className: "text-success",
  },
  pending: {
    label: "Pending",
    icon: CircleDashed,
    className: "text-information",
  },
  degraded: {
    label: "Degraded",
    icon: TriangleAlert,
    className: "text-warning",
  },
  disconnected: {
    label: "Disconnected",
    icon: CircleOff,
    className: "text-muted-foreground",
  },
  unavailable: {
    label: "Unavailable",
    icon: TriangleAlert,
    className: "text-destructive",
  },
};

const authorityDetails: Record<
  AuthorityLevel,
  { label: string; icon: typeof ShieldCheck; className: string }
> = {
  "read-only": {
    label: "Read only",
    icon: ShieldCheck,
    className: "text-information",
  },
  proposal: {
    label: "Proposal only",
    icon: ShieldQuestion,
    className: "text-warning",
  },
  mutating: {
    label: "Mutation capable",
    icon: ShieldQuestion,
    className: "text-destructive",
  },
  "local-authority": {
    label: "Local authority",
    icon: ShieldCheck,
    className: "text-success",
  },
};

function ConnectionStatus({
  name,
  kind,
  state,
  authority,
  detail,
  version,
  meta,
  action,
  className,
}: ConnectionStatusProps) {
  const stateDetail = stateDetails[state];
  const authorityDetail = authorityDetails[authority];
  const StateIcon = stateDetail.icon;
  const AuthorityIcon = authorityDetail.icon;

  return (
    <article
      data-slot="connection-status"
      data-state={state}
      data-authority={authority}
      aria-label={`${kind} ${name}: ${stateDetail.label}; ${authorityDetail.label}`}
      className={cn(
        "grid min-w-0 gap-3 rounded-lg border border-border bg-card p-4 shadow-sm",
        className,
      )}
    >
      <header className="flex min-w-0 items-start justify-between gap-3">
        <span className="min-w-0">
          <span className="numeric block text-[0.625rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            {kind}
          </span>
          <strong className="mt-1 block truncate text-sm font-semibold">
            {name}
          </strong>
        </span>
        {version ? (
          <code className="numeric max-w-[45%] min-w-0 truncate rounded-md border border-border bg-muted px-2 py-1 text-[0.625rem] text-muted-foreground">
            {version}
          </code>
        ) : null}
      </header>

      {detail ? (
        <p className="m-0 text-xs leading-5 break-words text-muted-foreground">
          {detail}
        </p>
      ) : null}

      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-3 text-[0.6875rem]">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 font-semibold",
            stateDetail.className,
          )}
        >
          <StateIcon aria-hidden="true" className="size-3.5" />
          {stateDetail.label}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 font-medium",
            authorityDetail.className,
          )}
        >
          <AuthorityIcon aria-hidden="true" className="size-3.5" />
          {authorityDetail.label}
        </span>
        {meta ? (
          <span className="numeric min-w-0 truncate text-muted-foreground">
            {meta}
          </span>
        ) : null}
        {action ? <span className="ms-auto shrink-0">{action}</span> : null}
      </div>
    </article>
  );
}

export {
  ConnectionStatus,
  type AuthorityLevel,
  type ConnectionState,
  type ConnectionStatusProps,
};
