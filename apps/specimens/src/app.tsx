/// <reference types="vite/client" />

import {
  ActivityItem,
  AttachmentChip,
  BudgetPill,
  Button,
  Card,
  ContextMeter,
  MetricDisplay,
  ModeSwitch,
  PlanRow,
  ResourceRow,
  SearchField,
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
import { ArrowUpRight, Link2, Moon, SearchX, Sun, X } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { ComposerDemo, RunRailDemo } from "./block-demos";
import { CodeSnippet } from "./code-snippet";
import { ComponentPreview } from "./component-preview";
import { Lab } from "./lab";
import { labScenes } from "./lab-scenes";
import {
  CompletionPaletteExample,
  FailureSurfaceExample,
  SendControlExample,
} from "./examples";

const density = "compact";
type Scheme = "light" | "dark";
type SpecimenGroup = "Composer" | "Run rail" | "Blocks";

type Specimen = {
  id: string;
  title: string;
  group: SpecimenGroup;
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
const componentSources = import.meta.glob<string>(
  "../../../packages/ui/src/{components,blocks}/*.tsx",
  { query: "?raw", import: "default", eager: true },
);

const groupDetails: Record<SpecimenGroup, { id: string; description: string }> =
  {
    Composer: {
      id: "group-composer",
      description: "Intent, authority, attachments, and send readiness.",
    },
    "Run rail": {
      id: "group-run-rail",
      description: "Execution evidence, limits, resources, and failure states.",
    },
    Blocks: {
      id: "group-blocks",
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
  const labScene = labScenes.find((scene) => scene.source === specimen.id);
  const source =
    componentSources[
      `../../../packages/ui/src/${sourceKind}/${specimen.id}.tsx`
    ];

  return (
    <article
      className="specimen-card"
      id={specimen.id}
      aria-labelledby={headingId}
      data-kind={sourceKind}
      tabIndex={-1}
    >
      <header className="specimen-card__header">
        <div className="specimen-card__meta">
          <h3 className="specimen-card__title" id={headingId}>
            <a
              className="specimen-permalink"
              href={`#${specimen.id}`}
              title={`Link to ${specimen.title}`}
            >
              <span>{specimen.title}</span>
              <Link2 aria-hidden="true" />
            </a>
          </h3>
          <span className="specimen-card__kind numeric">
            {sourceKind === "blocks" ? "Block" : "Component"}
          </span>
        </div>
        {labScene ? (
          <a className="specimen-lab-link" href={`/lab#${labScene.id}`}>
            Open in Lab <ArrowUpRight aria-hidden="true" />
          </a>
        ) : null}
        <p className="specimen-card__description">{specimen.description}</p>
      </header>
      <ComponentPreview
        source={source}
        title={specimen.title}
        filename={`${specimen.id}.tsx`}
      >
        {specimen.preview}
      </ComponentPreview>
      <Tabs defaultValue="cli">
        <TabsList
          variant="line"
          className="specimen-code-tabs"
          aria-label={`${specimen.title} code`}
        >
          <TabsTrigger value="cli">Install</TabsTrigger>
          <TabsTrigger value="react-api">Import</TabsTrigger>
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
      </Tabs>
      <footer className="specimen-states">
        <span>Supported states</span>
        <ul aria-label={`${specimen.title} supported states`}>
          {specimen.states.split(", ").map((state) => (
            <li key={state}>{state}</li>
          ))}
        </ul>
      </footer>
    </article>
  );
}

function useSpecimens() {
  const [mode, setMode] = useState<ComposerMode>("do");

  return useMemo<Specimen[]>(
    () => [
      {
        id: "mode-switch",
        title: "Mode switch",
        group: "Composer",
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
        description:
          "The surface's one filled action, with a stable stop state.",
        states: "ready, running, disabled",
        preview: <SendControlExample density={density} />,
      },
      {
        id: "completion-palette",
        title: "Completion palette",
        group: "Composer",
        description:
          "Keyboard-ready slash commands in a collision-aware overlay.",
        states: "closed, open, focused, disabled",
        preview: <CompletionPaletteExample />,
      },
      {
        id: "attachment-chip",
        title: "Attachment chip",
        group: "Composer",
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
        description:
          "A durable failure receipt with quiet output and explicit next moves.",
        states: "failed, retried",
        preview: <FailureSurfaceExample />,
      },
      {
        id: "context-meter",
        title: "Context meter",
        group: "Run rail",
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
        description:
          "The full intent-taking surface, built only from public modules.",
        states: "empty, ready, running, disabled",
        preview: <ComposerDemo density={density} />,
      },
      {
        id: "run-rail",
        title: "Run rail block",
        group: "Blocks",
        description:
          "Metrics, activity, context, and budget as one operational report.",
        states: "populated, loading, empty, error",
        preview: <RunRailDemo density={density} />,
      },
      {
        id: "transcript-turn",
        title: "Transcript turn",
        group: "Blocks",
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
    [mode],
  );
}

function Library({ specimens }: { specimens: Specimen[] }) {
  if (specimens.length === 0) {
    return (
      <section className="catalog-empty" id="component-catalog">
        <span className="catalog-empty__mark" aria-hidden="true">
          <SearchX />
        </span>
        <h2>No matches found</h2>
        <p>Try a component like Composer, or a state like running.</p>
      </section>
    );
  }

  return (
    <div
      className="catalog"
      id="component-catalog"
      aria-label="Component catalog"
    >
      {groupOrder.map((group) => {
        const groupedSpecimens = specimens.filter(
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
                <h2>{group}</h2>
                <p className="catalog-group__summary">{detail.description}</p>
              </div>
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

function useCatalogLocation(specimens: Specimen[], enabled: boolean) {
  const [activeId, setActiveId] = useState("library-overview");
  const initialHash = useRef<string | null>(window.location.hash.slice(1));

  useEffect(() => {
    if (!enabled) return;

    let frame = 0;
    const onHashChange = () => {
      const id = window.location.hash.slice(1);
      const target = document.getElementById(id);
      if (id && !target) {
        window.history.replaceState(
          window.history.state,
          "",
          `${window.location.pathname}${window.location.search}`,
        );
      }
      setActiveId(
        target?.matches("#library-overview, .catalog-group, .specimen-card")
          ? id
          : "library-overview",
      );
    };
    const updateLocation = () => {
      frame = 0;
      const top =
        (parseFloat(
          getComputedStyle(document.documentElement).scrollPaddingTop,
        ) || 0) + 4;
      const targets = [
        ...document.querySelectorAll<HTMLElement>(
          "#library-overview, .catalog-group, .specimen-card",
        ),
      ].filter((target) => target.getBoundingClientRect().height > 0);
      if (targets.length === 0) return;
      let current = "library-overview";
      for (const target of targets) {
        if (target.getBoundingClientRect().top <= top) current = target.id;
      }
      const root = document.documentElement;
      if (
        root.scrollHeight > window.innerHeight &&
        window.scrollY + window.innerHeight >= root.scrollHeight - 1
      ) {
        current = targets.at(-1)?.id ?? current;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(() => {
          // The initial fragment can arrive before React creates its target.
          if (initialHash.current !== null) {
            const id = initialHash.current;
            initialHash.current = null;
            if (id && window.location.hash.slice(1) === id) {
              const target = document.getElementById(id);
              target?.scrollIntoView({ block: "start" });
              target?.focus({ preventScroll: true });
            }
          }
          updateLocation();
        });
      }
    };

    onHashChange();
    onScroll();
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [enabled, specimens]);

  return activeId;
}

function CatalogNavigation({
  specimens,
  activeId,
}: {
  specimens: Specimen[];
  activeId: string;
}) {
  const groups = groupOrder.map((group) => ({
    group,
    items: specimens.filter((specimen) => specimen.group === group),
  }));

  return (
    <>
      <nav className="specimen-rail__nav" aria-label="Component navigation">
        <div className="specimen-rail__group">
          <h2>Getting started</h2>
          <a
            href="#library-overview"
            aria-current={
              activeId === "library-overview" ? "location" : undefined
            }
          >
            Overview
          </a>
        </div>
        {groups.map(({ group, items }) =>
          items.length ? (
            <div
              className="specimen-rail__group"
              data-group={group}
              key={group}
            >
              <h2>{group}</h2>
              <ul aria-label={group}>
                {items.map((specimen) => (
                  <li key={specimen.id}>
                    <a
                      href={`#${specimen.id}`}
                      aria-current={
                        activeId === specimen.id ? "location" : undefined
                      }
                    >
                      {specimen.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null,
        )}
      </nav>
      <div className="specimen-mobile-nav">
        <label className="sr-only" htmlFor="component-picker">
          Jump to component
        </label>
        <select
          id="component-picker"
          value={
            specimens.some((specimen) => specimen.id === activeId)
              ? activeId
              : "library-overview"
          }
          onChange={(event) => {
            window.location.hash = event.target.value;
          }}
        >
          <option value="library-overview">Overview</option>
          {groups.map(({ group, items }) =>
            items.length ? (
              <optgroup label={group} key={group}>
                {items.map((specimen) => (
                  <option value={specimen.id} key={specimen.id}>
                    {specimen.title}
                  </option>
                ))}
              </optgroup>
            ) : null,
          )}
        </select>
      </div>
      <div className="specimen-rail__package">
        <span className="specimen-kicker numeric">Install</span>
        <code className="numeric">@opencoven/ui</code>
      </div>
    </>
  );
}

function App() {
  const [scheme, setScheme] = useState<Scheme>(() =>
    preference("coven-ui:scheme", "dark") === "light" ? "light" : "dark",
  );
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const topbarRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";
  const isLab = normalizedPath === "/lab";
  const specimens = useSpecimens();
  const normalizedQuery = query.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;
  const filteredSpecimens = useMemo(() => {
    return specimens.filter((specimen) =>
      `${specimen.title} ${specimen.group} ${specimen.description} ${specimen.states}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [normalizedQuery, specimens]);
  const activeId = useCatalogLocation(filteredSpecimens, !isLab);
  const activeGroup = filteredSpecimens.find(
    (specimen) => specimen.id === activeId,
  )?.group;

  function clearSearch() {
    setQuery("");
    searchRef.current?.focus();
  }

  useEffect(() => {
    document.documentElement.classList.toggle("dark", scheme === "dark");
    document.documentElement.dataset.density = density;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        "content",
        getComputedStyle(document.documentElement)
          .getPropertyValue("--oc-bg")
          .trim(),
      );
    try {
      localStorage.setItem("coven-ui:scheme", scheme);
      localStorage.removeItem("coven-ui:density");
    } catch {
      /* Preferences remain session-local when browser storage is blocked. */
    }
  }, [scheme]);

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
        <a
          className="skip-link"
          href="#specimen-main"
          onClick={(event) => {
            if (isLab) {
              event.preventDefault();
              mainRef.current?.focus({ preventScroll: true });
            }
          }}
        >
          Skip to specimens
        </a>
        <header className="specimen-topbar" ref={topbarRef}>
          <div className="specimen-topbar__inner">
            <div className="specimen-topbar__leading">
              <a
                href="/"
                className="specimen-brand"
                aria-label="OpenCoven UI home"
              >
                <span className="specimen-brand__mark" aria-hidden="true">
                  <span />
                </span>
                <span>OpenCoven UI</span>
              </a>
              <nav className="surface-switcher" aria-label="Specimen surfaces">
                <a href="/" aria-current={!isLab ? "page" : undefined}>
                  Library
                </a>
                <a href="/lab" aria-current={isLab ? "page" : undefined}>
                  Lab
                </a>
              </nav>
            </div>
            {!isLab ? (
              <div
                role="search"
                aria-label="Component search"
                className="specimen-search"
              >
                <SearchField
                  ref={searchRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Escape" &&
                      !event.nativeEvent.isComposing &&
                      query
                    ) {
                      event.preventDefault();
                      clearSearch();
                    }
                  }}
                  aria-label="Search components"
                  aria-controls="component-catalog"
                  aria-keyshortcuts="Control+K Meta+K"
                  placeholder="Search components…"
                  shortcut={query ? undefined : "⌘K"}
                />
                {query ? (
                  <Button
                    variant="ghost"
                    className="catalog-clear-search"
                    aria-label="Clear search"
                    title="Clear search"
                    onClick={clearSearch}
                  >
                    <X aria-hidden="true" />
                  </Button>
                ) : null}
              </div>
            ) : null}
            <div className="specimen-topbar__actions">
              <Button
                variant="ghost"
                className="scheme-control"
                aria-label={`Use ${scheme === "dark" ? "light" : "dark"} scheme`}
                title={`Use ${scheme === "dark" ? "light" : "dark"} scheme`}
                onClick={() =>
                  setScheme((current) =>
                    current === "dark" ? "light" : "dark",
                  )
                }
              >
                {scheme === "dark" ? <Sun /> : <Moon />}
              </Button>
            </div>
          </div>
        </header>
        <div className="specimen-shell">
          {!isLab ? (
            <aside className="specimen-rail">
              <CatalogNavigation
                specimens={filteredSpecimens}
                activeId={activeId}
              />
            </aside>
          ) : null}
          <main
            ref={mainRef}
            className="specimen-main"
            id="specimen-main"
            tabIndex={-1}
          >
            <div className="specimen-main__inner">
              <header
                className="specimen-hero"
                id={!isLab ? "library-overview" : undefined}
                tabIndex={-1}
              >
                <div className="specimen-hero__copy">
                  <h1>{isLab ? "Component lab" : "Component library"}</h1>
                  <p>
                    {isLab
                      ? `${labScenes.length} interactive scenes, built from the library.`
                      : `${specimens.length} components and blocks. Preview, inspect, and reuse.`}
                  </p>
                </div>
              </header>
              {isLab ? (
                <Lab density={density} />
              ) : (
                <>
                  <div
                    className="catalog-results"
                    data-active={isSearching || undefined}
                  >
                    <p
                      role="status"
                      aria-label="Search results"
                      className={
                        isSearching ? "catalog-results__count" : "sr-only"
                      }
                    >
                      {isSearching
                        ? `${filteredSpecimens.length} ${filteredSpecimens.length === 1 ? "result" : "results"}`
                        : `All ${specimens.length} components`}
                    </p>
                  </div>
                  <Library specimens={filteredSpecimens} />
                </>
              )}
            </div>
          </main>
          {!isLab ? (
            <aside className="specimen-toc">
              <nav aria-label="On this page">
                <p className="specimen-kicker numeric">On this page</p>
                <a
                  href="#library-overview"
                  aria-current={
                    activeId === "library-overview" ? "location" : undefined
                  }
                >
                  Overview
                </a>
                {groupOrder.map((group) =>
                  filteredSpecimens.some(
                    (specimen) => specimen.group === group,
                  ) ? (
                    <a
                      key={group}
                      href={`#${groupDetails[group].id}`}
                      aria-current={
                        activeGroup === group ||
                        activeId === groupDetails[group].id
                          ? "location"
                          : undefined
                      }
                    >
                      {group}
                    </a>
                  ) : null,
                )}
              </nav>
            </aside>
          ) : null}
        </div>
      </div>
    </TooltipProvider>
  );
}

export { App };
