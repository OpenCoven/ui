import {
  ActivityItem,
  AttachmentChip,
  Badge,
  BudgetPill,
  Button,
  Card,
  CompletionPalette,
  ContextMeter,
  FailureSurface,
  MetricDisplay,
  ModeSwitch,
  PlanRow,
  ResourceRow,
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
import {
  Box,
  Braces,
  Circle,
  Layers3,
  Moon,
  Sparkles,
  Sun,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { ComposerDemo, RunRailDemo } from "./block-demos";
import { CodeSnippet } from "./code-snippet";
import { Lab } from "./lab";

type Density = "default" | "compact";
type Scheme = "light" | "dark";
type SpecimenGroup = "Composer" | "Run rail" | "Blocks";

type Specimen = {
  id: string;
  title: string;
  group: SpecimenGroup;
  primitive: string;
  description: string;
  states: string;
  preview: ReactNode;
};

function preference(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

const groupOrder: SpecimenGroup[] = ["Composer", "Run rail", "Blocks"];

const groupDetails: Record<
  SpecimenGroup,
  { id: string; eyebrow: string; description: string }
> = {
  Composer: {
    id: "group-composer",
    eyebrow: "Input layer",
    description: "Intent, authority, attachments, and send readiness.",
  },
  "Run rail": {
    id: "group-run-rail",
    eyebrow: "Evidence layer",
    description: "Execution evidence, limits, resources, and failure states.",
  },
  Blocks: {
    id: "group-blocks",
    eyebrow: "Complete surfaces",
    description: "Public components assembled into reusable agent workflows.",
  },
};

function SpecimenCard({ specimen }: { specimen: Specimen }) {
  const sourceKind = specimen.group === "Blocks" ? "blocks" : "components";
  const headingId = `${specimen.id}-title`;
  const exportName = specimen.id
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join("");
  const registryUrl = `https://ui.opencoven.ai/r/${specimen.id}.json`;
  const packagePath = `@opencoven/ui/${sourceKind}/${specimen.id}`;
  const importCode = `import { ${exportName} } from "${packagePath}";`;

  return (
    <article
      className="specimen-card"
      id={specimen.id}
      aria-labelledby={headingId}
      data-kind={sourceKind}
    >
      <header className="specimen-card__header">
        <div className="specimen-card__meta">
          <span className="specimen-card__kind numeric">
            {sourceKind === "blocks" ? <Layers3 /> : <Box />}
            {sourceKind === "blocks" ? "Block" : "Component"}
          </span>
          <Badge>{specimen.primitive}</Badge>
        </div>
        <h3 className="specimen-card__title" id={headingId}>
          {specimen.title}
        </h3>
        <p className="specimen-card__description">{specimen.description}</p>
      </header>
      <div className="specimen-preview">
        <div className="specimen-preview__label numeric">
          <span>
            <Circle aria-hidden="true" /> Live preview
          </span>
          <span>Try it out</span>
        </div>
        <div className="specimen-stage">{specimen.preview}</div>
      </div>
      <Tabs defaultValue="cli">
        <TabsList
          variant="line"
          className="specimen-code-tabs"
          aria-label={`${specimen.title} code`}
        >
          <TabsTrigger value="cli">CLI</TabsTrigger>
          <TabsTrigger value="react-api">React API</TabsTrigger>
          <TabsTrigger value="states">States</TabsTrigger>
        </TabsList>
        <TabsContent value="cli" className="specimen-documentation">
          <CodeSnippet
            code={`pnpm dlx shadcn@latest add "${registryUrl}"`}
            language="bash"
            label={`Install ${specimen.title}`}
          />
        </TabsContent>
        <TabsContent value="react-api" className="specimen-documentation">
          <CodeSnippet
            code={importCode}
            language="typescript"
            label={`Import ${specimen.title}`}
          />
        </TabsContent>
        <TabsContent value="states" className="specimen-documentation">
          <p className="specimen-install-meta">
            <span className="numeric">
              <Braces aria-hidden="true" /> Supported states
            </span>
            {specimen.states}
          </p>
        </TabsContent>
      </Tabs>
    </article>
  );
}

function Library({ density, query }: { density: Density; query: string }) {
  const [mode, setMode] = useState<ComposerMode>("do");

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
        preview: <ComposerDemo density={density} />,
      },
      {
        id: "run-rail",
        title: "Run rail block",
        group: "Blocks",
        primitive: "composition",
        description:
          "Metrics, activity, context, and budget as one operational report.",
        states: "populated, loading, empty, error",
        preview: <RunRailDemo density={density} />,
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
    [density, mode],
  );

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = specimens.filter((specimen) =>
    `${specimen.title} ${specimen.group} ${specimen.description} ${specimen.states}`
      .toLowerCase()
      .includes(normalizedQuery),
  );

  if (filtered.length === 0) {
    return (
      <section className="catalog-empty" aria-live="polite">
        <span className="catalog-empty__mark" aria-hidden="true">
          <Sparkles />
        </span>
        <h2>No matching specimens</h2>
        <p>Try a component name, block, state, or operational concept.</p>
      </section>
    );
  }

  return (
    <div className="catalog" aria-label="Component catalog">
      {groupOrder.map((group) => {
        const groupedSpecimens = filtered.filter(
          (specimen) => specimen.group === group,
        );

        if (groupedSpecimens.length === 0) {
          return null;
        }

        const detail = groupDetails[group];

        return (
          <section className="catalog-group" id={detail.id} key={group}>
            <header className="catalog-group__header">
              <div>
                <p className="catalog-group__eyebrow numeric">
                  {detail.eyebrow}
                </p>
                <h2>{group}</h2>
                <p className="catalog-group__summary">{detail.description}</p>
              </div>
              <span className="catalog-group__count numeric">
                {groupedSpecimens.length}{" "}
                {groupedSpecimens.length === 1 ? "specimen" : "specimens"}
              </span>
            </header>
            <div className="specimen-grid">
              {groupedSpecimens.map((specimen) => (
                <SpecimenCard key={specimen.id} specimen={specimen} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function DensityControl({
  density,
  onDensityChange,
}: {
  density: Density;
  onDensityChange: (density: Density) => void;
}) {
  return (
    <div className="density-control" role="group" aria-label="Display density">
      <button
        type="button"
        aria-pressed={density === "default"}
        onClick={() => onDensityChange("default")}
      >
        Cozy
      </button>
      <button
        type="button"
        aria-pressed={density === "compact"}
        onClick={() => onDensityChange("compact")}
      >
        Compact
      </button>
    </div>
  );
}

function App() {
  const [scheme, setScheme] = useState<Scheme>(() =>
    preference("coven-ui:scheme", "dark") === "light" ? "light" : "dark",
  );
  const [density, setDensity] = useState<Density>(() =>
    preference("coven-ui:density", "default") === "compact"
      ? "compact"
      : "default",
  );
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const topbarRef = useRef<HTMLElement>(null);
  const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";
  const isLab = normalizedPath === "/lab";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", scheme === "dark");
    document.documentElement.dataset.density = density;
    try {
      localStorage.setItem("coven-ui:scheme", scheme);
      localStorage.setItem("coven-ui:density", density);
    } catch {
      /* Preferences remain session-local when browser storage is blocked. */
    }
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

  useEffect(() => {
    const topbar = topbarRef.current;
    if (!topbar) return;

    const updateTopbarHeight = () => {
      document.documentElement.style.setProperty(
        "--specimen-topbar-height",
        `${Math.ceil(topbar.getBoundingClientRect().height)}px`,
      );
    };
    const observer = new ResizeObserver(updateTopbarHeight);

    updateTopbarHeight();
    observer.observe(topbar);

    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--specimen-topbar-height");
    };
  }, []);

  return (
    <TooltipProvider>
      <div className={`specimen-app${isLab ? " specimen-app--lab" : ""}`}>
        <a className="skip-link" href="#specimen-main">
          Skip to specimens
        </a>
        <header className="specimen-topbar" ref={topbarRef}>
          <div className="specimen-topbar__inner">
            <a
              href="/"
              className="specimen-brand"
              aria-label="OpenCoven UI home"
            >
              <span className="specimen-brand__mark" aria-hidden="true">
                <span />
              </span>
              <span>
                OpenCoven UI
                <small>Reference lab</small>
              </span>
            </a>
            <nav className="surface-switcher" aria-label="Specimen surfaces">
              <a href="/" aria-current={!isLab ? "page" : undefined}>
                Library
              </a>
              <a href="/lab" aria-current={isLab ? "page" : undefined}>
                Lab
              </a>
            </nav>
            <div className="specimen-topbar__actions">
              {!isLab ? (
                <SearchField
                  ref={searchRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search components…"
                  shortcut="⌘K"
                  className="specimen-search"
                />
              ) : null}
              <DensityControl density={density} onDensityChange={setDensity} />
              <Button
                variant="outline"
                className="scheme-control"
                aria-label={`Use ${scheme === "dark" ? "light" : "dark"} scheme`}
                onClick={() =>
                  setScheme((current) =>
                    current === "dark" ? "light" : "dark",
                  )
                }
              >
                {scheme === "dark" ? <Sun /> : <Moon />}
                <span>{scheme === "dark" ? "Light" : "Dark"}</span>
              </Button>
            </div>
          </div>
        </header>
        <div className="specimen-shell">
          <aside className="specimen-rail">
            <div className="specimen-rail__context">
              <p className="specimen-kicker numeric">
                {isLab ? "Assembled states" : "Component catalog"}
              </p>
              <h2>{isLab ? "Operational scenes" : "Public UI inventory"}</h2>
              <p>
                {isLab
                  ? "Six focused compositions using exported OpenCoven modules."
                  : "Registry-backed primitives and blocks grouped by the job they perform."}
              </p>
            </div>
            <nav className="specimen-rail__nav" aria-label="On this page">
              {isLab ? (
                <a href="#assembled-lab">
                  <span>Workbench</span>
                  <small className="numeric">06</small>
                </a>
              ) : (
                groupOrder.map((group) => (
                  <a href={`#${groupDetails[group].id}`} key={group}>
                    <span>{group}</span>
                    <small className="numeric">
                      {group === "Composer"
                        ? "04"
                        : group === "Run rail"
                          ? "08"
                          : "04"}
                    </small>
                  </a>
                ))
              )}
            </nav>
            <div className="specimen-rail__package">
              <span className="specimen-kicker numeric">Install</span>
              <code className="numeric">@opencoven/ui</code>
              <p>
                Semantic source, package exports, and registry remain aligned.
              </p>
            </div>
          </aside>
          <main className="specimen-main" id="specimen-main" tabIndex={-1}>
            <div className="specimen-main__inner">
              <header className="specimen-hero">
                <div className="specimen-hero__copy">
                  <p className="specimen-kicker numeric">
                    {isLab
                      ? "The component workbench"
                      : "Sixteen public building blocks"}
                  </p>
                  <h1>
                    {isLab ? (
                      <>
                        A little room to <em>experiment.</em>
                      </>
                    ) : (
                      <>
                        Agent surfaces.
                        <br />
                        <em>Made tangible.</em>
                      </>
                    )}
                  </h1>
                  <p>
                    {isLab
                      ? "Six scenes. Real components. One focused canvas."
                      : "Try the interaction, then take the source. Composable inputs, execution evidence, and complete agent workflows."}
                  </p>
                </div>
                <dl className="specimen-stats" aria-label="Library summary">
                  <div>
                    <dt>{isLab ? "Views" : "Specimens"}</dt>
                    <dd className="numeric">{isLab ? "06" : "16"}</dd>
                  </div>
                  <div>
                    <dt>Schemes</dt>
                    <dd className="numeric">02</dd>
                  </div>
                  <div>
                    <dt>Densities</dt>
                    <dd className="numeric">02</dd>
                  </div>
                </dl>
              </header>
              {isLab ? (
                <Lab density={density} />
              ) : (
                <Library density={density} query={query} />
              )}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}

export { App };
