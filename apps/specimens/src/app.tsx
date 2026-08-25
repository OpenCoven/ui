import {
  ActivityItem,
  AttachmentChip,
  Badge,
  BudgetPill,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CompletionPalette,
  Composer,
  ContextMeter,
  FailureSurface,
  MetricDisplay,
  ModeSwitch,
  PlanRow,
  ResourceRow,
  RunRail,
  SearchField,
  SendControl,
  SessionHeader,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ToolMix,
  TooltipProvider,
  TranscriptTurn,
  type ComposerMode,
} from "@opencoven/ui";
import { ArrowRight, Moon, Sparkles, Sun } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

type Density = "default" | "compact";
type Scheme = "light" | "dark";

type Specimen = {
  id: string;
  title: string;
  group: "Composer" | "Run rail" | "Blocks";
  primitive: string;
  description: string;
  states: string;
  preview: ReactNode;
};

function SpecimenCard({ specimen }: { specimen: Specimen }) {
  return (
    <article className="specimen-card" id={specimen.id}>
      <header className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <span className="numeric text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            {specimen.group}
          </span>
          <Badge>{specimen.primitive}</Badge>
        </div>
        <h2 className="mt-1 text-lg font-semibold">{specimen.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {specimen.description}
        </p>
      </header>
      <Tabs defaultValue="preview">
        <TabsList variant="line" className="mx-4 mt-3">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>
        <TabsContent value="preview">
          <div className="specimen-stage">{specimen.preview}</div>
        </TabsContent>
        <TabsContent value="api" className="min-h-60 p-4">
          <p className="numeric text-xs text-muted-foreground">
            pnpm dlx shadcn@latest add https://ui.opencoven.ai/r/{specimen.id}
            .json
          </p>
          <p className="mt-3 text-sm">
            Import from{" "}
            <code className="numeric text-presence">
              @opencoven/ui/components/{specimen.id}
            </code>
            .
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            States: {specimen.states}.
          </p>
        </TabsContent>
        <TabsContent value="usage" className="min-h-60 p-4">
          <p className="text-sm text-muted-foreground">
            Uses semantic tokens, visible focus, non-color state cues, logical
            properties, and reduced-motion-safe feedback. Compact density is an
            explicit prop, never a global compression shortcut.
          </p>
        </TabsContent>
      </Tabs>
    </article>
  );
}

function Library({ density, query }: { density: Density; query: string }) {
  const [mode, setMode] = useState<ComposerMode>("do");
  const [message, setMessage] = useState("Review the changed files");

  const specimens = useMemo<Specimen[]>(
    () => [
      {
        id: "mode-switch",
        title: "Mode switch",
        group: "Composer",
        primitive: "native",
        description:
          "A pressed-state control for Chat, Do, and Plan authority.",
        states: "default, selected, focus, disabled",
        preview: (
          <ModeSwitch value={mode} onValueChange={setMode} density={density} />
        ),
      },
      {
        id: "send-control",
        title: "Send control",
        group: "Composer",
        primitive: "Base UI",
        description:
          "The surface's one filled action, with a stable stop state.",
        states: "ready, running, disabled",
        preview: (
          <div className="flex flex-wrap gap-3">
            <SendControl density={density} />
            <SendControl density={density} running />
          </div>
        ),
      },
      {
        id: "completion-palette",
        title: "Completion palette",
        group: "Composer",
        primitive: "Base UI Menu",
        description:
          "Keyboard-ready slash commands in a collision-aware overlay.",
        states: "closed, open, focused, disabled",
        preview: (
          <CompletionPalette
            trigger={<Button variant="outline">Open slash commands</Button>}
            onSelect={() => undefined}
            commands={[
              {
                id: "plan",
                label: "/plan",
                description: "Draft a plan before acting",
                shortcut: "↵",
              },
              {
                id: "handoff",
                label: "/handoff",
                description: "Write a continuation handoff",
              },
              {
                id: "research",
                label: "/research",
                description: "Start a bounded research mission",
              },
            ]}
          />
        ),
      },
      {
        id: "attachment-chip",
        title: "Attachment chip",
        group: "Composer",
        primitive: "native",
        description: "A file attachment with explicit operational state.",
        states: "ready, uploading, failed",
        preview: (
          <div className="flex flex-wrap gap-2">
            <AttachmentChip name="spec.md" meta="4.2 KB" />
            <AttachmentChip
              name="preview.png"
              state="uploading"
              progress={62}
            />
            <AttachmentChip name="trace.har" state="failed" meta="too large" />
          </div>
        ),
      },
      {
        id: "metric-display",
        title: "Metric display",
        group: "Run rail",
        primitive: "native",
        description:
          "Comparable run figures in stable tabular numeric typography.",
        states: "neutral, success, warning, information",
        preview: (
          <Card className="grid grid-cols-3 divide-x divide-border">
            <MetricDisplay value="12.4" unit="k" label="Tokens" />
            <MetricDisplay value={8} label="Files" tone="success" />
            <MetricDisplay value="2:14" label="Elapsed" />
          </Card>
        ),
      },
      {
        id: "plan-row",
        title: "Plan row",
        group: "Run rail",
        primitive: "native",
        description:
          "A task step whose icon, text treatment, and label carry state.",
        states: "pending, active, complete, blocked",
        preview: (
          <Card>
            <PlanRow
              title="Read the failing test"
              status="complete"
              duration="0:41"
            />
            <PlanRow title="Run the suite" status="active" />
            <PlanRow title="Write the changelog" status="pending" />
          </Card>
        ),
      },
      {
        id: "activity-item",
        title: "Activity item",
        group: "Run rail",
        primitive: "native",
        description:
          "One append-only tool event using the canonical class mapping.",
        states: "read, write, exec, net, running",
        preview: (
          <div className="run-spine grid gap-1 ps-6">
            <ActivityItem tool="read" target="src/parser.ts" duration="0.3s" />
            <ActivityItem tool="exec" target="pnpm test" duration="6.1s" />
            <ActivityItem tool="write" target="src/parser.ts" duration="0.2s" />
            <ActivityItem tool="net" target="push branch" running />
          </div>
        ),
      },
      {
        id: "resource-row",
        title: "Resource row",
        group: "Run rail",
        primitive: "native",
        description:
          "A direction-aware path row with operation and diff evidence.",
        states: "modified, added, deleted, renamed",
        preview: (
          <Card>
            <ResourceRow
              path="src/parser/tokenizer.ts"
              operation="M"
              additions={34}
              deletions={9}
            />
            <ResourceRow
              path="src/parser/escapes.test.ts"
              operation="A"
              additions={61}
              deletions={0}
            />
          </Card>
        ),
      },
      {
        id: "tool-mix",
        title: "Tool mix",
        group: "Run rail",
        primitive: "native",
        description:
          "A readable summary with one fixed read/exec/write/net order.",
        states: "populated, empty",
        preview: (
          <ToolMix
            values={[
              { tool: "read", value: 38 },
              { tool: "exec", value: 27 },
              { tool: "write", value: 24 },
              { tool: "net", value: 11 },
            ]}
          />
        ),
      },
      {
        id: "failure-surface",
        title: "Failure surface",
        group: "Run rail",
        primitive: "Base UI Button",
        description:
          "A durable failure receipt with quiet output and explicit next moves.",
        states: "failed, retried",
        preview: (
          <FailureSurface
            command="pnpm vitest run tokenizer"
            exitCode={1}
            output="AssertionError: expected 3 cells, got 4"
            actions={[{ label: "Retry", onSelect: () => undefined }]}
          />
        ),
      },
      {
        id: "context-meter",
        title: "Context meter",
        group: "Run rail",
        primitive: "native progress",
        description:
          "Window consumption with a fixed threshold and stable numbers.",
        states: "normal, warning, full",
        preview: (
          <div className="grid gap-4">
            <ContextMeter used={82_000} total={200_000} />
            <ContextMeter used={172_000} total={200_000} />
          </div>
        ),
      },
      {
        id: "budget-pill",
        title: "Budget pill",
        group: "Run rail",
        primitive: "native",
        description:
          "Spend against a limit with icon, text weight, and semantic tone.",
        states: "normal, warning, over",
        preview: (
          <div className="flex flex-wrap gap-2">
            <BudgetPill used={0.41} limit={5} />
            <BudgetPill used={4.12} limit={5} />
            <BudgetPill used={5.37} limit={5} />
          </div>
        ),
      },
      {
        id: "composer",
        title: "Composer block",
        group: "Blocks",
        primitive: "composition",
        description:
          "The full intent-taking surface, built only from public modules.",
        states: "empty, ready, running, disabled",
        preview: (
          <Composer
            value={message}
            onValueChange={setMessage}
            mode={mode}
            onModeChange={setMode}
            density={density}
            attachments={[{ id: "spec", name: "spec.md", meta: "4.2 KB" }]}
          />
        ),
      },
      {
        id: "run-rail",
        title: "Run rail block",
        group: "Blocks",
        primitive: "composition",
        description:
          "Metrics, activity, context, and budget as one operational report.",
        states: "populated, loading, empty, error",
        preview: (
          <RunRail
            density={density}
            metrics={[
              { value: "12.4", unit: "k", label: "Tokens" },
              { value: 8, label: "Files", tone: "success" },
              { value: "2:14", label: "Elapsed" },
            ]}
            activity={[
              { tool: "read", target: "src/parser.ts", duration: "0.3s" },
              { tool: "exec", target: "pnpm test", running: true },
            ]}
            context={{ used: 82_000, total: 200_000 }}
            budget={{ used: 0.41, limit: 5 }}
          />
        ),
      },
      {
        id: "transcript-turn",
        title: "Transcript turn",
        group: "Blocks",
        primitive: "composition",
        description:
          "Familiar identity and provenance lead an editorial response.",
        states: "streaming, complete, with artifacts",
        preview: (
          <TranscriptTurn
            familiar="Cody"
            initials="CO"
            role="Code Familiar"
            model="GPT-5.6 Sol"
            timestamp="now"
            utilities={
              <>
                <span>Reply</span>
                <span>Copy</span>
                <span className="numeric">1.8K tokens</span>
              </>
            }
          >
            <p>
              The component source, registry item, and specimen now share one
              implementation boundary.
            </p>
          </TranscriptTurn>
        ),
      },
      {
        id: "session-header",
        title: "Session header",
        group: "Blocks",
        primitive: "composition",
        description:
          "The session task, branch, execution state, and spend in one line.",
        states: "pending, active, complete, blocked",
        preview: (
          <SessionHeader
            title="Keep escaped delimiters"
            branch="fix/tokenizer-escapes"
            status="active"
            budget={{ used: 0.41, limit: 5 }}
          />
        ),
      },
    ],
    [density, message, mode],
  );

  const filtered = specimens.filter((specimen) =>
    `${specimen.title} ${specimen.group} ${specimen.description}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className="specimen-grid">
      {filtered.map((specimen) => (
        <SpecimenCard key={specimen.id} specimen={specimen} />
      ))}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No components match “{query}”.
        </p>
      ) : null}
    </div>
  );
}

function Lab({ density }: { density: Density }) {
  const [view, setView] = useState("composer");
  const [mode, setMode] = useState<ComposerMode>("do");
  const [message, setMessage] = useState(
    "Ask Cody to review the changed files",
  );

  const views: Record<string, ReactNode> = {
    composer: (
      <Composer
        value={message}
        onValueChange={setMessage}
        mode={mode}
        onModeChange={setMode}
        density={density}
      />
    ),
    messages: (
      <TranscriptTurn
        familiar="Cody"
        initials="CO"
        role="Code Familiar"
        model="GPT-5.6 Sol"
        timestamp="now"
      >
        <p>
          Model selection, linked context, and send readiness remain visible
          without interrupting the writing flow.
        </p>
      </TranscriptTurn>
    ),
    context: (
      <Card>
        <ResourceRow
          path="OpenCoven/coven-cave"
          meta="main · src/components/chat-view.tsx · read + write"
        />
        <ResourceRow path="Composer polish" meta="Issue #4621 · linked task" />
      </Card>
    ),
    actions: (
      <Card className="grid gap-1 p-2">
        <Button variant="ghost" className="h-auto justify-start py-3">
          <span className="grid text-start">
            <strong>Attach changed files</strong>
            <small className="text-muted-foreground">
              Include the current git diff as context
            </small>
          </span>
        </Button>
        <Button variant="ghost" className="h-auto justify-start py-3">
          <span className="grid text-start">
            <strong>Enhance prompt</strong>
            <small className="text-muted-foreground">
              Clarify intent without changing scope
            </small>
          </span>
        </Button>
      </Card>
    ),
    cards: (
      <div className="grid gap-3">
        {[
          ["Pull request", "Recover attachment ingestion", "Checks 12 / 12"],
          ["Proposal", "Merge #4764 · squash", "Awaiting your tap"],
          ["Attachment", "Components-preview.png", "384 KB · added by Cody"],
          ["Handoff", "Vercel deployment ledger", "7 sections"],
        ].map(([kind, title, meta]) => (
          <Card key={kind}>
            <CardHeader>
              <Badge variant={kind === "Proposal" ? "presence" : "neutral"}>
                {kind}
              </Badge>
            </CardHeader>
            <CardContent>
              <strong>{title}</strong>
              <p className="mt-1 text-xs text-muted-foreground">{meta}</p>
            </CardContent>
            <CardFooter className="justify-end text-xs text-muted-foreground">
              Open in reader <ArrowRight className="size-3" />
            </CardFooter>
          </Card>
        ))}
      </div>
    ),
  };

  return (
    <section className="mx-auto max-w-5xl">
      <Tabs value={view} onValueChange={(next) => setView(String(next))}>
        <TabsList className="mb-6 flex w-full overflow-x-auto">
          {Object.keys(views).map((name) => (
            <TabsTrigger key={name} value={name} className="capitalize">
              {name}
            </TabsTrigger>
          ))}
        </TabsList>
        {Object.entries(views).map(([name, content]) => (
          <TabsContent key={name} value={name}>
            <div className="specimen-stage min-h-[34rem] rounded-lg border border-border">
              {content}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}

function App() {
  const [scheme, setScheme] = useState<Scheme>(() =>
    localStorage.getItem("coven-ui:scheme") === "light" ? "light" : "dark",
  );
  const [density, setDensity] = useState<Density>(() =>
    localStorage.getItem("coven-ui:density") === "compact"
      ? "compact"
      : "default",
  );
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const isLab = window.location.pathname === "/lab";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", scheme === "dark");
    document.documentElement.dataset.density = density;
    localStorage.setItem("coven-ui:scheme", scheme);
    localStorage.setItem("coven-ui:density", density);
  }, [density, scheme]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <TooltipProvider>
      <div className="specimen-shell">
        <aside className="specimen-rail p-5">
          <a href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid size-8 place-items-center rounded-md border border-presence/35 bg-presence/12 text-presence">
              <Sparkles className="size-4" />
            </span>
            OpenCoven UI
          </a>
          <p className="mt-2 text-xs text-muted-foreground">
            Base UI · Nova · Zinc seed · Coven semantics
          </p>
          <nav className="mt-8 grid gap-1" aria-label="Specimen surfaces">
            <a
              href="/"
              aria-current={!isLab ? "page" : undefined}
              className="rounded-md px-3 py-2 text-sm hover:bg-muted aria-[current=page]:bg-presence/12 aria-[current=page]:font-semibold aria-[current=page]:text-presence"
            >
              Component library
            </a>
            <a
              href="/lab"
              aria-current={isLab ? "page" : undefined}
              className="rounded-md px-3 py-2 text-sm hover:bg-muted aria-[current=page]:bg-presence/12 aria-[current=page]:font-semibold aria-[current=page]:text-presence"
            >
              Assembled lab
            </a>
          </nav>
          <div className="mt-8 grid gap-2 border-t border-border pt-5">
            <Button
              variant="outline"
              onClick={() =>
                setScheme((current) => (current === "dark" ? "light" : "dark"))
              }
            >
              {scheme === "dark" ? <Sun /> : <Moon />}
              {scheme === "dark" ? "Light scheme" : "Dark scheme"}
            </Button>
            <ModeSwitch
              value={density === "default" ? "chat" : "plan"}
              onValueChange={(next) =>
                setDensity(next === "chat" ? "default" : "compact")
              }
              className="[&>button:nth-child(2)]:hidden"
            />
          </div>
        </aside>
        <main className="specimen-main p-[clamp(1rem,4vw,3rem)]">
          <header className="mb-8 flex flex-wrap items-end gap-4 border-b border-border pb-6">
            <div className="min-w-0 flex-1">
              <p className="numeric text-[0.65rem] font-semibold tracking-[0.14em] text-presence uppercase">
                {isLab ? "Five assembled states" : "Registry-backed components"}
              </p>
              <h1 className="editorial mt-1 text-4xl tracking-tight">
                {isLab
                  ? "The agent surface, assembled"
                  : "Quiet tools for active runs"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Greys carry structure. Color carries operational meaning. Every
                preview imports the same modules consumers install.
              </p>
            </div>
            {!isLab ? (
              <SearchField
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search components…"
                shortcut="⌘K"
                className="w-full sm:w-64"
              />
            ) : null}
          </header>
          {isLab ? (
            <Lab density={density} />
          ) : (
            <Library density={density} query={query} />
          )}
        </main>
      </div>
    </TooltipProvider>
  );
}

export { App };
