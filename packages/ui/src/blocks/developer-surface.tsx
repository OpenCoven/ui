import { Code2, GitBranch, Layers3 } from "lucide-react";
import { useId, type ReactNode } from "react";

import {
  CommandReceipt,
  type CommandReceiptProps,
} from "@opencoven/ui/components/command-receipt";
import {
  ConnectionStatus,
  type ConnectionStatusProps,
} from "@opencoven/ui/components/connection-status";
import { cn } from "@opencoven/ui/lib/utils";

type DeveloperConnection = ConnectionStatusProps & { id: string };
type DeveloperReceipt = CommandReceiptProps & { id: string };

type DeveloperSurfaceProps = {
  project: string;
  branch?: string;
  title?: string;
  description?: string;
  connections: readonly DeveloperConnection[];
  activity?: readonly DeveloperReceipt[];
  actions?: ReactNode;
  aside?: ReactNode;
  headingLevel?: 2 | 3;
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
  headingLevel = 2,
  className,
}: DeveloperSurfaceProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const connectionsId = `${id}-connections`;
  const activityId = `${id}-activity`;
  const Title = headingLevel === 2 ? "h2" : "h3";
  const SectionTitle = headingLevel === 2 ? "h3" : "h4";

  return (
    <section
      data-slot="developer-surface"
      aria-labelledby={titleId}
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
          <Title
            id={titleId}
            className="mt-1.5 mb-0 text-lg font-semibold tracking-tight"
          >
            {title}
          </Title>
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

          <section aria-labelledby={connectionsId}>
            <header className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
              <div>
                <p className="numeric m-0 text-[0.625rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  Integrations
                </p>
                <SectionTitle
                  id={connectionsId}
                  className="mt-1 mb-0 text-sm font-semibold"
                >
                  Connected development context
                </SectionTitle>
              </div>
              <span className="numeric text-[0.625rem] text-muted-foreground">
                {connections.length} source{connections.length === 1 ? "" : "s"}
              </span>
            </header>
            {connections.length > 0 ? (
              <div className="grid gap-3 px-5 pb-5 md:grid-cols-2">
                {connections.map(({ id: connectionId, ...connection }) => (
                  <ConnectionStatus key={connectionId} {...connection} />
                ))}
              </div>
            ) : (
              <p className="mx-5 mt-0 mb-5 rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
                No integration state is available. Do not infer connectivity or
                authority from an empty response.
              </p>
            )}
          </section>

          <section
            className="border-t border-border"
            aria-labelledby={activityId}
          >
            <header className="flex items-center justify-between gap-3 px-5 pt-5 pb-2">
              <div>
                <p className="numeric m-0 text-[0.625rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  Evidence
                </p>
                <SectionTitle
                  id={activityId}
                  className="mt-1 mb-0 text-sm font-semibold"
                >
                  Recent invocations
                </SectionTitle>
              </div>
              <span className="numeric text-[0.625rem] text-muted-foreground">
                {activity.length} receipt{activity.length === 1 ? "" : "s"}
              </span>
            </header>
            {activity.length > 0 ? (
              <div className="pb-2">
                {activity.map(({ id: receiptId, ...receipt }) => (
                  <CommandReceipt key={receiptId} {...receipt} />
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

        <aside
          aria-label="Developer surface guidance"
          className="min-w-0 border-t border-border bg-muted/25 p-5 lg:border-t-0 lg:border-l"
        >
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

export {
  DeveloperSurface,
  type DeveloperConnection,
  type DeveloperReceipt,
  type DeveloperSurfaceProps,
};
