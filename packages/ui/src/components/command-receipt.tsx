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
type InvocationStatus =
  | "accepted"
  | "running"
  | "succeeded"
  | "failed"
  | "blocked"
  | "unknown"
  | "recovery-required";

type CommandReceiptProps = {
  channel: InvocationChannel;
  /** A presentation-safe, pre-redacted command or operation label. */
  displayCommand: string;
  status: InvocationStatus;
  /** A non-secret receipt or evidence reference supplied by the canonical producer. */
  receiptId?: string;
  summary?: string;
  duration?: string;
  exitCode?: number;
  /** An ISO 8601 timestamp supplied by the host, when available. */
  timestamp?: string;
  className?: string;
};

const statusDetails: Record<
  InvocationStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  accepted: {
    label: "Accepted",
    icon: CheckCircle2,
    className: "text-information",
  },
  running: {
    label: "Running",
    icon: CircleDashed,
    className: "text-information",
  },
  succeeded: {
    label: "Succeeded",
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
  unknown: {
    label: "Unknown",
    icon: Clock3,
    className: "text-warning",
  },
  "recovery-required": {
    label: "Recovery required",
    icon: TriangleAlert,
    className: "text-warning",
  },
};

function CommandReceipt({
  channel,
  displayCommand,
  status,
  receiptId,
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
      aria-label={`${channel.toUpperCase()} invocation: ${statusDetail.label}`}
      className={cn(
        "grid w-full min-w-0 max-w-full gap-3 border-b border-border px-4 py-3 last:border-b-0",
        className,
      )}
    >
      <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md border border-border bg-muted text-muted-foreground">
          <TerminalSquare aria-hidden="true" className="size-3.5" />
        </span>
        <span className="min-w-0">
          <span className="flex min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-1">
            <span className="numeric max-w-full text-[0.625rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase break-words [overflow-wrap:anywhere]">
              {channel}
            </span>
            <span
              className={cn(
                "inline-flex max-w-full flex-wrap items-center gap-1 text-[0.6875rem] font-semibold",
                statusDetail.className,
              )}
            >
              <StatusIcon aria-hidden="true" className="size-3 shrink-0" />
              {statusDetail.label}
            </span>
          </span>
          <code className="numeric mt-1.5 block min-w-0 max-w-full text-xs leading-5 break-words whitespace-pre-wrap text-foreground [overflow-wrap:anywhere]">
            {displayCommand}
          </code>
          {summary ? (
            <p className="mt-1.5 mb-0 min-w-0 max-w-full text-xs leading-5 break-words text-muted-foreground [overflow-wrap:anywhere]">
              {summary}
            </p>
          ) : null}
        </span>
      </div>

      {receiptId || duration || exitCode !== undefined || timestamp ? (
        <footer className="numeric flex w-full min-w-0 max-w-full flex-wrap items-center gap-x-3 gap-y-1 text-[0.625rem] text-muted-foreground sm:ps-10">
          {receiptId ? (
            <span
              className="min-w-0 max-w-full break-all [overflow-wrap:anywhere]"
              title={receiptId}
            >
              receipt {receiptId}
            </span>
          ) : null}
          {duration ? (
            <span className="inline-flex max-w-full items-center gap-1">
              <Clock3 aria-hidden="true" className="size-3 shrink-0" />
              {duration}
            </span>
          ) : null}
          {exitCode !== undefined ? <span>exit {exitCode}</span> : null}
          {timestamp ? (
            <time
              className="max-w-full break-all [overflow-wrap:anywhere]"
              dateTime={timestamp}
            >
              {timestamp}
            </time>
          ) : null}
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
