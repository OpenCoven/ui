import {
  Badge,
  Button,
  Card,
  ResourceRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TranscriptTurn,
} from "@opencoven/ui";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  FileCode2,
  Layers3,
  MessageSquare,
  PenLine,
  Wand2,
} from "lucide-react";
import { useRef, useState } from "react";

import { ComposerDemo, RunRailDemo } from "./block-demos";
import { CodeSnippet, HighlightedCode } from "./code-snippet";

const scenes = [
  {
    id: "composer",
    title: "Composer",
    subtitle: "From intent to action",
    icon: PenLine,
    source: "composer",
    tone: "presence",
  },
  {
    id: "run-rail",
    title: "Run rail",
    subtitle: "Every step, accounted for",
    icon: Activity,
    source: "run-rail",
    tone: "information",
  },
  {
    id: "messages",
    title: "Messages",
    subtitle: "A familiar voice, with evidence",
    icon: MessageSquare,
    source: "transcript-turn",
    tone: "presence",
  },
  {
    id: "context",
    title: "Context",
    subtitle: "The right files, within reach",
    icon: FileCode2,
    source: "resource-row",
    tone: "success",
  },
  {
    id: "actions",
    title: "Actions",
    subtitle: "Small controls, clear intent",
    icon: Wand2,
    source: "completion-palette",
    tone: "warning",
  },
  {
    id: "cards",
    title: "Cards",
    subtitle: "Outcomes you can open",
    icon: Layers3,
    source: "session-header",
    tone: "information",
  },
] as const;

function Lab({ density }: { density: "default" | "compact" }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [actionStatus, setActionStatus] = useState(
    "Choose an action to try its local preview.",
  );
  const [attached, setAttached] = useState(false);
  const [prompt, setPrompt] = useState("Review this change.");
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const scene = scenes[activeIndex]!;
  const SceneIcon = scene.icon;
  const navigate = (offset: number) =>
    setActiveIndex((index) => (index + offset + scenes.length) % scenes.length);

  const views = {
    composer: <ComposerDemo density={density} />,
    "run-rail": <RunRailDemo density={density} />,
    messages: (
      <div className="lab-message-stack">
        <TranscriptTurn
          familiar="Cody"
          initials="CO"
          role="Code Familiar"
          model="GPT-5.6 Sol"
          timestamp="now"
        >
          <p>
            The draft stays yours. Use <HighlightedCode code="onValueChange" />{" "}
            to keep it in sync with your application.
          </p>
          <CodeSnippet
            label="Controlled draft"
            language="typescript"
            code={
              'const [draft, setDraft] = useState("");\nconst [mode, setMode] = useState<ComposerMode>("do");\n\n<Composer\n  value={draft}\n  onValueChange={setDraft}\n  mode={mode}\n  onModeChange={setMode}\n/>'
            }
          />
        </TranscriptTurn>
      </div>
    ),
    context: (
      <div className="lab-context">
        <div className="lab-context__heading">
          <FileCode2 aria-hidden="true" />
          <h3>Linked to this session</h3>
          <Badge>3 resources</Badge>
        </div>
        <Card>
          <ResourceRow path="OpenCoven/ui" meta="main · component library" />
          <ResourceRow
            path="src/blocks/composer.tsx"
            operation="M"
            additions={24}
            deletions={8}
          />
          <ResourceRow
            path="tests/composer.test.tsx"
            operation="A"
            additions={18}
          />
        </Card>
        <p className="demo-status">
          Context stays explicit. File operations keep their own color and
          label.
        </p>
      </div>
    ),
    actions: (
      <div className="lab-actions">
        <div className="lab-action-grid">
          <Button
            variant="outline"
            onClick={() => {
              setAttached((value) => !value);
              setActionStatus(
                attached
                  ? "Sample context removed."
                  : "Sample changes.diff attached.",
              );
            }}
          >
            <FileCode2 />
            <span>
              <strong>{attached ? "Remove context" : "Attach context"}</strong>
              <small>A sample diff, ready to reference</small>
            </span>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setPrompt(
                "Review the changed files for behavior regressions. Suggest the smallest fix and explain the tradeoff.",
              );
              setActionStatus(
                "Prompt expanded. Your scope stays focused on the changed files.",
              );
            }}
          >
            <Wand2 />
            <span>
              <strong>Clarify the prompt</strong>
              <small>Make the next step more specific</small>
            </span>
          </Button>
        </div>
        <Card className="lab-action-result">
          <span className="specimen-kicker numeric">Your draft</span>
          <p>{prompt}</p>
          {attached ? (
            <Badge variant="presence">changes.diff · 8.1 KB</Badge>
          ) : null}
        </Card>
        <p className="demo-status" role="status">
          {actionStatus}
        </p>
      </div>
    ),
    cards: (
      <div className="lab-card-grid">
        {[
          {
            kind: "Pull request",
            title: "Recover attachment ingestion",
            meta: "12 checks passed",
            detail:
              "The sample change keeps attachment metadata intact across retries.",
          },
          {
            kind: "Proposal",
            title: "A smaller composer",
            meta: "Ready for your review",
            detail:
              "Keep the draft visible, group supporting controls, and retain one primary send action.",
          },
          {
            kind: "Attachment",
            title: "Component preview",
            meta: "384 KB · added by Cody",
            detail:
              "A sample image artifact associated with the current review.",
          },
          {
            kind: "Handoff",
            title: "Deployment notes",
            meta: "Source, registry, package",
            detail:
              "Build the package and publish the same component source through the registry.",
          },
        ].map((card) => (
          <Card key={card.kind} className="lab-artifact">
            <details>
              <summary>
                <Badge
                  variant={card.kind === "Proposal" ? "presence" : "neutral"}
                >
                  {card.kind}
                </Badge>
                <strong>{card.title}</strong>
                <small>{card.meta}</small>
                <span className="lab-artifact__open">
                  Read details <ArrowRight aria-hidden="true" />
                </span>
              </summary>
              <p>{card.detail}</p>
            </details>
          </Card>
        ))}
      </div>
    ),
  };

  return (
    <section
      className="assembled-lab"
      id="assembled-lab"
      aria-label="Component scenes"
      aria-roledescription="carousel"
      data-tone={scene.tone}
    >
      <header className="lab-scene-header">
        <div className="lab-scene-heading">
          <span className="lab-scene-icon">
            <SceneIcon aria-hidden="true" />
          </span>
          <div>
            <h2>{scene.title}</h2>
            <p>{scene.subtitle}</p>
          </div>
        </div>
        <div className="lab-carousel-controls">
          <span className="numeric" role="status" aria-atomic="true">
            <span className="sr-only">{scene.title}, scene </span>
            {String(activeIndex + 1).padStart(2, "0")} / 06
          </span>
          <Button
            variant="outline"
            aria-label="Previous scene"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft />
          </Button>
          <Button
            variant="outline"
            aria-label="Next scene"
            onClick={() => navigate(1)}
          >
            <ArrowRight />
          </Button>
        </div>
      </header>
      <Tabs
        value={scene.id}
        onValueChange={(value) => {
          const index = scenes.findIndex((item) => item.id === value);
          if (index !== -1) setActiveIndex(index);
        }}
        className="lab-carousel"
      >
        <div
          className="lab-carousel__viewport"
          onPointerDown={(event) => {
            pointerStart.current = null;
            if (
              event.pointerType !== "touch" ||
              (event.target instanceof Element &&
                event.target.closest(
                  "button, input, textarea, a, summary, pre, code, [role=tab]",
                ))
            )
              return;
            pointerStart.current = { x: event.clientX, y: event.clientY };
          }}
          onPointerCancel={() => {
            pointerStart.current = null;
          }}
          onPointerUp={(event) => {
            const start = pointerStart.current;
            pointerStart.current = null;
            if (!start || window.getSelection()?.toString()) return;
            const dx = event.clientX - start.x;
            const dy = event.clientY - start.y;
            if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5)
              navigate(dx < 0 ? 1 : -1);
          }}
        >
          {scenes.map((item) => (
            <TabsContent
              key={item.id}
              value={item.id}
              keepMounted
              hidden={item.id !== scene.id}
              className="lab-scene-panel"
            >
              <div className="assembled-lab__stage" data-scene={item.id}>
                <div className="lab-scene-surface">{views[item.id]}</div>
              </div>
            </TabsContent>
          ))}
        </div>
        <div className="assembled-lab__nav">
          <TabsList
            className="assembled-lab__tabs"
            aria-label="Choose a scene"
            activateOnFocus
          >
            {scenes.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                data-scene-id={item.id}
              >
                <item.icon aria-hidden="true" />
                <span>{item.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>
      <footer className="lab-footer">
        <span>Interactive examples · Swipe or use the tabs</span>
        <a href={`/#${scene.source}`}>
          Component & code <ArrowRight aria-hidden="true" />
        </a>
      </footer>
    </section>
  );
}

export { Lab };
