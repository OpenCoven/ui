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
        "w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm",
        className,
      )}
    >
      <header className="grid min-w-0 gap-4 border-b border-border px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="min-w-0">
          <span className="numeric inline-flex max-w-full flex-wrap items-center gap-1.5 text-[0.625rem] font-semibold tracking-[0.12em] text-presence uppercase [overflow-wrap:anywhere]">
            <Layers3 aria-hidden="true" className="size-3 shrink-0" />
            Developer surface
          </span>
          <Title
            id={titleId}
            className="mt-1.5 mb-0 min-w-0 text-lg font-semibold tracking-tight break-words [overflow-wrap:anywhere]"
          >
            {title}
          </Title>
          <p className="mt-1 mb-0 min-w-0 max-w-2xl text-xs leading-5 break-words text-muted-foreground [overflow-wrap:anywhere]">
            {description}
          </p>
        </div>
        {actions ? (
          <div className="flex min-w-0 max-w-full flex-wrap gap-2">
            {actions}
          </div>
        ) : null}
      </header>

      <div className="grid w-full min-w-0 max-w-full lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <div className="grid min-w-0 gap-2 border-b border-border bg-muted/35 px-5 py-3 text-xs sm:flex sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2">
            <span className="inline-flex min-w-0 max-w-full items-start gap-1.5 font-semibold">
              <Code2
                aria-hidden="true"
                className="size-3.5 shrink-0 text-presence"
              />
              <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                {project}
              </span>
            </span>
            {branch ? (
              <span className="numeric inline-flex min-w-0 max-w-full items-start gap-1.5 text-muted-foreground">
                <GitBranch aria-hidden="true" className="size-3.5 shrink-0" />
                <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                  {branch}
                </span>
              </span>
            ) : null}
          </div>

          <section className="min-w-0" aria-labelledby={connectionsId}>
            <header className="grid min-w-0 gap-2 px-5 pt-5 pb-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <div className="min-w-0">
                <p className="numeric m-0 max-w-full text-[0.625rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase break-words [overflow-wrap:anywhere]">
                  Integrations
                </p>
                <SectionTitle
                  id={connectionsId}
                  className="mt-1 mb-0 min-w-0 text-sm font-semibold break-words [overflow-wrap:anywhere]"
                >
                  Connected development context
                </SectionTitle>
              </div>
              <span className="numeric justify-self-start text-[0.625rem] text-muted-foreground sm:justify-self-end">
                {connections.length} source{connections.length === 1 ? "" : "s"}
              </span>
            </header>
            {connections.length > 0 ? (
              <div className="grid min-w-0 gap-3 px-5 pb-5 md:grid-cols-2">
                {connections.map(({ id: connectionId, ...connection }) => (
                  <ConnectionStatus key={connectionId} {...connection} />
                ))}
              </div>
            ) : (
              <p className="mx-5 mt-0 mb-5 min-w-0 rounded-lg border border-dashed border-border p-4 text-xs break-words text-muted-foreground [overflow-wrap:anywhere]">
                No integration state is available. Do not infer connectivity or
                authority from an empty response.
              </p>
            )}
          </section>

          <section
            className="min-w-0 border-t border-border"
            aria-labelledby={activityId}
          >
            <header className="grid min-w-0 gap-2 px-5 pt-5 pb-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <div className="min-w-0">
                <p className="numeric m-0 max-w-full text-[0.625rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase break-words [overflow-wrap:anywhere]">
                  Evidence
                </p>
                <SectionTitle
                  id={activityId}
                  className="mt-1 mb-0 min-w-0 text-sm font-semibold break-words [overflow-wrap:anywhere]"
                >
                  Recent invocations
                </SectionTitle>
              </div>
              <span className="numeric justify-self-start text-[0.625rem] text-muted-foreground sm:justify-self-end">
                {activity.length} receipt{activity.length === 1 ? "" : "s"}
              </span>
            </header>
            {activity.length > 0 ? (
              <div className="min-w-0 pb-2">
                {activity.map(({ id: receiptId, ...receipt }) => (
                  <CommandReceipt key={receiptId} {...receipt} />
                ))}
              </div>
            ) : (
              <p className="mx-5 mt-1 mb-5 min-w-0 rounded-lg border border-dashed border-border p-4 text-xs break-words text-muted-foreground [overflow-wrap:anywhere]">
                No invocation receipts yet. Keep empty states explicit rather
                than fabricating execution history.
              </p>
            )}
          </section>
        </div>

        <aside
          aria-label="Developer surface guidance"
          className="w-full min-w-0 max-w-full border-t border-border bg-muted/25 p-5 [overflow-wrap:anywhere] [&_*]:min-w-0 lg:border-t-0 lg:border-l"
        >
          {aside ?? (
            <div className="grid min-w-0 gap-4">
              <div className="min-w-0">
                <p className="numeric m-0 max-w-full text-[0.625rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase break-words [overflow-wrap:anywhere]">
                  Authority rule
                </p>
                <p className="mt-2 mb-0 max-w-full text-xs leading-5 break-words text-muted-foreground [overflow-wrap:anywhere]">
                  Presentation does not imply permission. Consumers must source
                  authority from Coven, Threads, Psyche, or another canonical
                  producer and render that state explicitly.
                </p>
              </div>
              <div className="min-w-0 border-t border-border pt-4">
                <p className="numeric m-0 max-w-full text-[0.625rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase break-words [overflow-wrap:anywhere]">
                  Adapter boundary
                </p>
                <p className="mt-2 mb-0 max-w-full text-xs leading-5 break-words text-muted-foreground [overflow-wrap:anywhere]">
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
