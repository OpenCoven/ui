import { Code2, GitBranch, Layers3 } from "lucide-react";
import type { ReactNode } from "react";

import {
  CommandReceipt,
  type CommandReceiptProps,
} from "@opencoven/ui/components/command-receipt";
import {
  ConnectionStatus,
  type ConnectionStatusProps,
} from "@opencoven/ui/components/connection-status";
import { cn } from "@opencoven/ui/lib/utils";

type DeveloperSurfaceProps = {
  project: string;
  branch?: string;
  title?: string;
  description?: string;
  connections: ConnectionStatusProps[];
  activity?: CommandReceiptProps[];
  actions?: ReactNode;
  aside?: ReactNode;
  className?: string;
};

function DeveloperSurface({
  project,
  branch,
  title = "Development surface",
  description = "Project context, integration health, and execution evidence in one reusable surface.",
  connections,
  activity = [],
  actions,
  aside,
  className,
}: DeveloperSurfaceProps) {
  return (
    <section
      data-slot="developer-surface"
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm",
        className,
      )}
    >
      <header className="grid gap-4 border-b border-border px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="min-w-0">
          <span className="numeric inline-flex items-center gap-1.5 text-[0.625rem] font-semibold tracking-[0.12em] text-presence uppercase">
            <Layers3 aria-hidden="true" className="size-3" />
            Developer surface
          </span>
          <h2 className="mt-1.5 mb-0 text-lg font-semibold tracking-tight">
            {title}
          </h2>
          <p className="mt-1 mb-0 max-w-2xl text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </header>

      <div className="grid min-w-0 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-border bg-muted/35 px-5 py-3 text-xs">
            <span className="inline-flex min-w-0 items-center gap-1.5 font-semibold">
              <Code2 aria-hidden="true" className="size-3.5 text-presence" />
              <span className="truncate">{project}</span>
            </span>
            {branch ? (
              <span className="numeric inline-flex min-w-0 items-center gap-1.5 text-muted-foreground">
                <GitBranch aria-hidden="true" className="size-3.5" />
                <span className="truncate">{branch}</span>
              </span>
            ) : null}
          </div>

          <section aria-labelledby="developer-surface-connections">
            <header className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
              <div>
                <p className="numeric m-0 text-[0.625rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  Integrations
                </p>
                <h3
                  id="developer-surface-connections"
                  className="mt-1 mb-0 text-sm font-semibold"
                >
                  Connected development context
                </h3>
              </div>
              <span className="numeric text-[0.625rem] text-muted-foreground">
                {connections.length} source{connections.length === 1 ? "" : "s"}
              </span>
            </header>
            <div className="grid gap-3 px-5 pb-5 md:grid-cols-2">
              {connections.map((connection) => (
                <ConnectionStatus
                  key={`${connection.kind}:${connection.name}`}
                  {...connection}
                />
              ))}
            </div>
          </section>

          <section
            className="border-t border-border"
            aria-labelledby="developer-surface-activity"
          >
            <header className="flex items-center justify-between gap-3 px-5 pt-5 pb-2">
              <div>
                <p className="numeric m-0 text-[0.625rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  Evidence
                </p>
                <h3
                  id="developer-surface-activity"
                  className="mt-1 mb-0 text-sm font-semibold"
                >
                  Recent invocations
                </h3>
              </div>
              <span className="numeric text-[0.625rem] text-muted-foreground">
                {activity.length} receipt{activity.length === 1 ? "" : "s"}
              </span>
            </header>
            {activity.length > 0 ? (
              <div className="pb-2">
                {activity.map((receipt, index) => (
                  <CommandReceipt
                    key={`${receipt.channel}:${receipt.command}:${index}`}
                    {...receipt}
                  />
                ))}
              </div>
            ) : (
              <p className="mx-5 mt-1 mb-5 rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
                No invocation receipts yet. Keep empty states explicit rather
                than fabricating execution history.
              </p>
            )}
          </section>
        </div>

        <aside className="min-w-0 border-t border-border bg-muted/25 p-5 lg:border-t-0 lg:border-l">
          {aside ?? (
            <div className="grid gap-4">
              <div>
                <p className="numeric m-0 text-[0.625rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  Authority rule
                </p>
                <p className="mt-2 mb-0 text-xs leading-5 text-muted-foreground">
                  Presentation does not imply permission. Consumers must source
                  authority from Coven, Threads, Psyche, or another canonical
                  producer and render that state explicitly.
                </p>
              </div>
              <div className="border-t border-border pt-4">
                <p className="numeric m-0 text-[0.625rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  Adapter boundary
                </p>
                <p className="mt-2 mb-0 text-xs leading-5 text-muted-foreground">
                  Feed this block normalized view models from the SDK, CLI,
                  daemon, runtime registry, or application state. The component
                  performs no discovery or mutation on its own.
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

export { DeveloperSurface, type DeveloperSurfaceProps };
