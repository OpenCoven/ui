import { Button, DeveloperSurface } from "@opencoven/ui";
import { ArrowLeft, BookOpen, Boxes, TerminalSquare } from "lucide-react";

function DeveloperShowcase() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground no-underline"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            OpenCoven UI
          </a>
          <span className="h-4 w-px bg-border" aria-hidden="true" />
          <span className="numeric text-[0.625rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Developer surface
          </span>
          <nav className="ms-auto flex items-center gap-2" aria-label="Developer resources">
            <a
              href="https://docs.opencoven.ai"
              className="hidden items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium text-muted-foreground no-underline hover:bg-muted hover:text-foreground sm:inline-flex"
            >
              <BookOpen aria-hidden="true" className="size-3.5" />
              Docs
            </a>
            <a
              href="https://github.com/OpenCoven"
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium text-muted-foreground no-underline hover:bg-muted hover:text-foreground"
            >
              <Boxes aria-hidden="true" className="size-3.5" />
              Repositories
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <section className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div>
            <p className="numeric m-0 text-[0.625rem] font-semibold tracking-[0.14em] text-presence uppercase">
              Shared development UI
            </p>
            <h1 className="editorial mt-3 mb-0 max-w-3xl text-4xl tracking-[-0.04em] text-balance sm:text-6xl">
              One visual language for the work around the work.
            </h1>
            <p className="mt-5 mb-0 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Reusable components for project context, SDK state, CLI execution,
              daemon authority, runtime health, and verifiable receipts. The UI
              presents canonical state; it never invents authority.
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-2 lg:grid-cols-1">
            {[
              ["CLI", "coven"],
              ["SDK", "read-only"],
              ["Authority", "daemon"],
            ].map(([label, value]) => (
              <div key={label} className="border-l border-border ps-3 lg:py-1">
                <dt className="numeric text-[0.625rem] tracking-[0.08em] text-muted-foreground uppercase">
                  {label}
                </dt>
                <dd className="numeric mt-1 mb-0 text-sm font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="py-10 sm:py-14">
          <DeveloperSurface
            project="OpenCoven/ui"
            branch="feat/developer-surface-system"
            title="OpenCoven development context"
            description="A normalized, presentation-only view over real SDK, CLI, daemon, runtime, and repository signals."
            actions={
              <>
                <Button variant="outline" size="sm">
                  <TerminalSquare aria-hidden="true" />
                  Open CLI
                </Button>
                <Button variant="presence" size="sm">
                  Inspect project
                </Button>
              </>
            }
            connections={[
              {
                name: "Coven daemon",
                kind: "Daemon",
                state: "connected",
                authority: "local-authority",
                version: "v0.1",
                detail:
                  "Session and runtime authority from the same-user local daemon contract.",
                meta: "coven.daemon.v1",
              },
              {
                name: "OpenCoven SDK",
                kind: "SDK",
                state: "degraded",
                authority: "read-only",
                version: "0.1 exp",
                detail:
                  "Experimental read-only coordination surface; mutation remains deliberately unavailable.",
                meta: "Cave + Coven reads",
              },
              {
                name: "Coven CLI",
                kind: "CLI",
                state: "connected",
                authority: "proposal",
                version: "@opencoven/cli",
                detail:
                  "Canonical user CLI. Execution is still revalidated by the daemon authority boundary.",
                meta: "coven doctor · run · sessions",
              },
              {
                name: "coven-code runtime",
                kind: "Runtime",
                state: "connected",
                authority: "proposal",
                version: "0.7",
                detail:
                  "Registered coding runtime driven through the Coven execution substrate.",
                meta: "stream-json",
              },
            ]}
            activity={[
              {
                channel: "cli",
                command: "coven doctor",
                status: "success",
                summary: "Local runtime and harness readiness verified.",
                duration: "0.8s",
                exitCode: 0,
                timestamp: "now",
              },
              {
                channel: "sdk",
                command: "cave.health({ timeoutMs: 5000 })",
                status: "success",
                summary: "Read-only Cave health returned through a caller-controlled transport.",
                duration: "42ms",
                timestamp: "now",
              },
              {
                channel: "daemon",
                command: "session.create · project=OpenCoven/ui",
                status: "blocked",
                summary:
                  "Mutation is intentionally shown as blocked until the canonical authority grants it.",
                timestamp: "now",
              },
            ]}
            aside={
              <div className="grid gap-5">
                <section>
                  <p className="numeric m-0 text-[0.625rem] font-semibold tracking-[0.12em] text-presence uppercase">
                    Integration contract
                  </p>
                  <h3 className="mt-2 mb-0 text-sm font-semibold">Normalize, then render.</h3>
                  <p className="mt-2 mb-0 text-xs leading-5 text-muted-foreground">
                    SDK and CLI adapters map external responses into small view
                    models. UI code does not perform discovery, credential lookup,
                    transport negotiation, or daemon mutation.
                  </p>
                </section>
                <section className="border-t border-border pt-4">
                  <p className="numeric m-0 text-[0.625rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    Public install
                  </p>
                  <code className="numeric mt-2 block overflow-x-auto rounded-md border border-border bg-background p-3 text-[0.6875rem] leading-5">
                    pnpm dlx shadcn@latest add https://ui.opencoven.ai/r/developer-surface.json
                  </code>
                </section>
                <section className="border-t border-border pt-4">
                  <p className="numeric m-0 text-[0.625rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    Canonical CLI
                  </p>
                  <code className="numeric mt-2 block overflow-x-auto rounded-md border border-border bg-background p-3 text-[0.6875rem] leading-5">
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
