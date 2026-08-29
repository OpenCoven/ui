import {
  Ban,
  CheckCircle2,
  CircleDashed,
  Clock3,
  TerminalSquare,
  TriangleAlert,
} from "lucide-react";

import { cn } from "@opencoven/ui/lib/utils";

type InvocationChannel = "cli" | "sdk" | "daemon" | "runtime";
type InvocationStatus = "running" | "success" | "failed" | "blocked";

type CommandReceiptProps = {
  channel: InvocationChannel;
  command: string;
  status: InvocationStatus;
  summary?: string;
  duration?: string;
  exitCode?: number;
  timestamp?: string;
  className?: string;
};

const statusDetails: Record<
  InvocationStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  running: {
    label: "Running",
    icon: CircleDashed,
    className: "text-information",
  },
  success: {
    label: "Complete",
    icon: CheckCircle2,
    className: "text-success",
  },
  failed: {
    label: "Failed",
    icon: TriangleAlert,
    className: "text-destructive",
  },
  blocked: {
    label: "Blocked",
    icon: Ban,
    className: "text-warning",
  },
};

function CommandReceipt({
  channel,
  command,
  status,
  summary,
  duration,
  exitCode,
  timestamp,
  className,
}: CommandReceiptProps) {
  const statusDetail = statusDetails[status];
  const StatusIcon = statusDetail.icon;

  return (
    <article
      data-slot="command-receipt"
      data-channel={channel}
      data-status={status}
      className={cn(
        "grid min-w-0 gap-3 border-b border-border px-4 py-3 last:border-b-0",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md border border-border bg-muted text-muted-foreground">
          <TerminalSquare aria-hidden="true" className="size-3.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="numeric text-[0.625rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
              {channel}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[0.6875rem] font-semibold",
                statusDetail.className,
              )}
            >
              <StatusIcon aria-hidden="true" className="size-3" />
              {statusDetail.label}
            </span>
          </span>
          <code className="numeric mt-1.5 block overflow-x-auto text-xs leading-5 text-foreground">
            {command}
          </code>
          {summary ? (
            <p className="mt-1.5 mb-0 text-xs leading-5 text-muted-foreground">
              {summary}
            </p>
          ) : null}
        </span>
      </div>

      {duration || exitCode !== undefined || timestamp ? (
        <footer className="numeric flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 ps-10 text-[0.625rem] text-muted-foreground">
          {duration ? (
            <span className="inline-flex items-center gap-1">
              <Clock3 aria-hidden="true" className="size-3" />
              {duration}
            </span>
          ) : null}
          {exitCode !== undefined ? <span>exit {exitCode}</span> : null}
          {timestamp ? <span>{timestamp}</span> : null}
        </footer>
      ) : null}
    </article>
  );
}

export {
  CommandReceipt,
  type CommandReceiptProps,
  type InvocationChannel,
  type InvocationStatus,
};
