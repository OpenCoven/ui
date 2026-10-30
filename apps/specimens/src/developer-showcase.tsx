import { DeveloperSurface } from "@opencoven/ui";
import { ArrowLeft, BookOpen, Boxes } from "lucide-react";

function DeveloperShowcase() {
  return (
    <div className="min-h-screen min-w-0 bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto grid min-h-16 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 sm:flex sm:gap-3 sm:px-6">
          <a
            href="/"
            className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground no-underline"
          >
            <ArrowLeft aria-hidden="true" className="size-4 shrink-0" />
            <span className="min-w-0 break-words [overflow-wrap:anywhere]">
              OpenCoven UI
            </span>
          </a>
          <span
            className="hidden h-4 w-px bg-border sm:block"
            aria-hidden="true"
          />
          <span className="numeric hidden text-[0.625rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase sm:inline-flex">
            Developer surface
          </span>
          <nav
            className="ms-auto flex min-w-0 items-center justify-end gap-1 sm:gap-2"
            aria-label="Developer resources"
          >
            <a
              href="https://docs.opencoven.ai"
              className="hidden items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium text-muted-foreground no-underline hover:bg-muted hover:text-foreground sm:inline-flex"
            >
              <BookOpen aria-hidden="true" className="size-3.5" />
              Docs
            </a>
            <a
              href="https://github.com/OpenCoven"
              aria-label="OpenCoven repositories"
              className="inline-flex min-w-0 items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium text-muted-foreground no-underline hover:bg-muted hover:text-foreground"
            >
              <Boxes aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="hidden sm:inline">Repositories</span>
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto min-w-0 max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <section className="grid min-w-0 gap-8 border-b border-border pb-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div className="min-w-0">
            <p className="numeric m-0 max-w-full text-[0.625rem] font-semibold tracking-[0.14em] text-presence uppercase break-words [overflow-wrap:anywhere]">
              Shared development UI
            </p>
            <h1 className="editorial mt-3 mb-0 max-w-3xl text-4xl tracking-[-0.04em] text-balance break-words [overflow-wrap:anywhere] sm:text-6xl">
              One visual language for the work around the work.
            </h1>
            <p className="mt-5 mb-0 max-w-2xl text-sm leading-7 break-words text-muted-foreground [overflow-wrap:anywhere] sm:text-base">
              Reusable components for project context, SDK state, CLI execution,
              daemon authority, runtime health, and verifiable receipts. The UI
              presents canonical state; it never invents authority.
            </p>
          </div>
          <dl className="grid min-w-0 grid-cols-3 gap-2 lg:grid-cols-1">
            {[
              ["CLI", "coven"],
              ["SDK", "read-only"],
              ["Authority", "daemon"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="min-w-0 border-l border-border ps-3 lg:py-1"
              >
                <dt className="numeric min-w-0 text-[0.625rem] tracking-[0.08em] text-muted-foreground uppercase break-words [overflow-wrap:anywhere]">
                  {label}
                </dt>
                <dd className="numeric mt-1 mb-0 min-w-0 text-sm font-semibold break-words [overflow-wrap:anywhere]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="min-w-0 py-10 sm:py-14">
          <DeveloperSurface
            project="OpenCoven/ui"
            branch="feat/developer-surface-system"
            title="OpenCoven development context"
            description="A normalized, presentation-only view over SDK, CLI, daemon, runtime, and repository signals supplied by their owning systems."
            connections={[
              {
                id: "daemon-primary",
                name: "Coven daemon",
                kind: "Daemon",
                state: "connected",
                authority: "local-authority",
                version: "coven.daemon.v1",
                detail:
                  "Session and runtime authority from the same-user local daemon contract.",
                meta: "owner-local IPC",
              },
              {
                id: "sdk-primary",
                name: "OpenCoven SDK",
                kind: "SDK",
                state: "degraded",
                authority: "read-only",
                version: "pre-release",
                detail:
                  "Experimental read-only coordination surface; mutation remains deliberately unavailable.",
                meta: "Cave + Coven reads",
              },
              {
                id: "cli-primary",
                name: "Coven CLI",
                kind: "CLI",
                state: "connected",
                authority: "proposal",
                version: "@opencoven/cli",
                detail:
                  "Canonical user CLI. Consequential execution is revalidated by the daemon authority boundary.",
                meta: "coven doctor · run · sessions",
              },
              {
                id: "runtime-primary",
                name: "coven-code runtime",
                kind: "Runtime",
                state: "connected",
                authority: "proposal",
                version: "registered",
                detail:
                  "Coding runtime presented through the Coven execution substrate.",
                meta: "stream-json adapter",
              },
            ]}
            activity={[
              {
                id: "doctor-receipt",
                channel: "cli",
                displayCommand: "coven doctor",
                status: "succeeded",
                receiptId: "demo:doctor:01",
                summary: "Local runtime and harness readiness verified.",
                duration: "0.8s",
                exitCode: 0,
                timestamp: "2026-08-30T12:00:00Z",
              },
              {
                id: "sdk-health-receipt",
                channel: "sdk",
                displayCommand: "cave.health({ timeoutMs: 5000 })",
                status: "succeeded",
                receiptId: "demo:cave-health:01",
                summary:
                  "Read-only Cave health returned through a caller-controlled transport.",
                duration: "42ms",
                timestamp: "2026-08-30T12:00:01Z",
              },
              {
                id: "daemon-policy-receipt",
                channel: "daemon",
                displayCommand:
                  "session.create · project=[redacted-demo-scope]",
                status: "blocked",
                receiptId: "demo:policy-denial:01",
                summary:
                  "Mutation is explicitly blocked until the canonical authority grants it.",
                timestamp: "2026-08-30T12:00:02Z",
              },
            ]}
            aside={
              <div className="grid min-w-0 gap-5">
                <section className="min-w-0">
                  <p className="numeric m-0 max-w-full text-[0.625rem] font-semibold tracking-[0.12em] text-presence uppercase break-words [overflow-wrap:anywhere]">
                    Integration contract
                  </p>
                  <h3 className="mt-2 mb-0 min-w-0 text-sm font-semibold break-words [overflow-wrap:anywhere]">
                    Normalize, then render.
                  </h3>
                  <p className="mt-2 mb-0 min-w-0 text-xs leading-5 break-words text-muted-foreground [overflow-wrap:anywhere]">
                    SDK and CLI adapters map external responses into small,
                    presentation-safe view models. UI code does not perform
                    discovery, credential lookup, transport negotiation, or
                    daemon mutation.
                  </p>
                </section>
                <section className="min-w-0 border-t border-border pt-4">
                  <p className="numeric m-0 max-w-full text-[0.625rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase break-words [overflow-wrap:anywhere]">
                    Public install
                  </p>
                  <code className="numeric mt-2 block max-w-full rounded-md border border-border bg-background p-3 text-[0.6875rem] leading-5 whitespace-pre-wrap break-all [overflow-wrap:anywhere]">
                    pnpm dlx shadcn@latest add
                    https://ui.opencoven.ai/r/developer-surface.json
                  </code>
                </section>
                <section className="min-w-0 border-t border-border pt-4">
                  <p className="numeric m-0 max-w-full text-[0.625rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase break-words [overflow-wrap:anywhere]">
                    Canonical CLI
                  </p>
                  <code className="numeric mt-2 block max-w-full rounded-md border border-border bg-background p-3 text-[0.6875rem] leading-5 whitespace-pre-wrap break-all [overflow-wrap:anywhere]">
                    npm install -g @opencoven/cli
                  </code>
                </section>
              </div>
            }
          />
        </section>
      </main>
    </div>
  );
}

export { DeveloperShowcase };
