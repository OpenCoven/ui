import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Composer,
  ResourceRow,
  SessionHeader,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TranscriptTurn,
  type ComposerMode,
} from "@opencoven/ui";
import { ArrowRight, Sparkles } from "lucide-react";
import { type ReactNode, useState } from "react";
import { CopyCodeButton } from "./code-block";
import {
  groupOrder,
  groupDetails,
  matchesSpecimen,
  type Density,
  type Specimen,
} from "./use-specimens";

export function SpecimenCard({
  specimen,
  detail = false,
}: {
  specimen: Specimen;
  detail?: boolean;
}) {
  const sourceKind = specimen.group === "Blocks" ? "blocks" : "components";
  const headingId = `${specimen.id}-title`;
  const exportName = specimen.id
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join("");
  const registryUrl = `https://ui.opencoven.ai/r/${specimen.id}.json`;
  const packagePath = `@opencoven/ui/${sourceKind}/${specimen.id}`;

  return (
    <article
      className="specimen-card"
      id={specimen.id}
      aria-labelledby={headingId}
    >
      {!detail && (
        <header className="specimen-card__header">
          <div className="specimen-card__meta">
            <span className="specimen-card__index">{specimen.group}</span>
            <Badge>{specimen.primitive}</Badge>
          </div>
          <h3 className="specimen-card__title" id={headingId}>
            <a href={`/docs/${specimen.id}`}>{specimen.title}</a>
          </h3>
          <p className="specimen-card__description">{specimen.description}</p>
        </header>
      )}
      <Tabs defaultValue="preview">
        <TabsList variant="line" className="mx-4 mt-3">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="install">Install</TabsTrigger>
          <TabsTrigger value="react-api">React API</TabsTrigger>
        </TabsList>
        <TabsContent value="preview">
          <div className="specimen-stage">{specimen.preview}</div>
        </TabsContent>
        <TabsContent value="install" className="specimen-documentation">
          <div className="specimen-install-grid">
            <section className="specimen-code-snippet">
              <header className="specimen-code-snippet__header">
                <div>
                  <span>CLI</span>
                  <small>shadcn registry</small>
                </div>
                <CopyCodeButton
                  label={`${specimen.title} install command`}
                  text={`pnpm dlx shadcn@latest add ${registryUrl}`}
                />
              </header>
              <pre
                className="specimen-command numeric"
                aria-label={`CLI install command for ${specimen.title}`}
              >
                <code>
                  <span className="syntax-command">pnpm</span>{" "}
                  <span className="syntax-keyword">dlx</span>{" "}
                  <span className="syntax-package">shadcn@latest</span>{" "}
                  <span className="syntax-keyword">add</span>{" "}
                  <span className="syntax-string">{registryUrl}</span>
                </code>
              </pre>
            </section>
          </div>
          <p className="specimen-install-meta">
            <span className="numeric">States</span>
            {specimen.states}
          </p>
          <p>
            <a href="/docs/installation">Set up your project</a> before adding
            components.
          </p>
        </TabsContent>
        <TabsContent value="react-api" className="specimen-documentation">
          <section className="specimen-code-snippet">
            <header className="specimen-code-snippet__header">
              <div>
                <span>TypeScript</span>
                <small>package API</small>
              </div>
              <CopyCodeButton
                label={`${specimen.title} React import`}
                text={`import { ${exportName} } from "${packagePath}";`}
              />
            </header>
            <pre
              className="specimen-command numeric"
              aria-label={`TypeScript import for ${specimen.title}`}
            >
              <code>
                <span className="syntax-keyword">import</span>{" "}
                <span className="syntax-punctuation">{"{ "}</span>
                <span className="syntax-symbol">{exportName}</span>
                <span className="syntax-punctuation">{" }"}</span>{" "}
                <span className="syntax-keyword">from</span>{" "}
                <span className="syntax-string">&quot;{packagePath}&quot;</span>
                <span className="syntax-punctuation">;</span>
              </code>
            </pre>
          </section>
          <p className="text-muted-foreground">
            Uses semantic tokens, visible focus, non-color state cues, logical
            properties, and reduced-motion-safe feedback. Compact density is an
            explicit prop, never a global compression shortcut.
          </p>
        </TabsContent>
      </Tabs>
    </article>
  );
}

export function Library({
  specimens,
  query,
}: {
  specimens: Specimen[];
  query: string;
}) {
  const filtered = specimens.filter((specimen) =>
    matchesSpecimen(specimen, query),
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
              {groupedSpecimens.map((specimen) => {
                return <SpecimenCard key={specimen.id} specimen={specimen} />;
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function Lab({ density }: { density: Density }) {
  const [view, setView] = useState("composer");
  const [mode, setMode] = useState<ComposerMode>("do");
  const [message, setMessage] = useState(
    "Ask Cody to review the changed files",
  );

  const views: Record<string, ReactNode> = {
    composer: (
      <div className="lab-composer">
        <TranscriptTurn
          familiar="Cody"
          initials="CO"
          role="Code Familiar"
          model="GPT-5.6 Sol"
          timestamp="now"
        >
          <p>
            I found two visual regressions in the specimen shell and kept the
            package boundary intact.
          </p>
        </TranscriptTurn>
        <Composer
          value={message}
          onValueChange={setMessage}
          mode={mode}
          onModeChange={setMode}
          density={density}
          attachments={[
            { id: "diff", name: "specimen-shell.diff", meta: "8.1 KB" },
          ]}
        />
      </div>
    ),
    messages: (
      <div className="lab-message-stack">
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
              <span className="numeric">1.2K tokens</span>
            </>
          }
        >
          <p>
            Model selection, linked context, and send readiness remain visible
            without interrupting the writing flow.
          </p>
        </TranscriptTurn>
        <TranscriptTurn
          familiar="Charm"
          initials="CH"
          role="Community Familiar"
          timestamp="2m"
        >
          <p>
            The same primitives can carry a different familiar identity without
            changing their authority or accessibility contract.
          </p>
        </TranscriptTurn>
      </div>
    ),
    context: (
      <Card>
        <ResourceRow
          path="OpenCoven/coven-cave"
          meta="main · src/components/chat-view.tsx · read + write"
        />
        <ResourceRow path="Composer polish" meta="Issue #4621 · linked task" />
        <ResourceRow
          path="OpenCoven/ui"
          meta="fix/specimen-browser-shell · proposal"
        />
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
      <div className="lab-card-grid">
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
    <section className="assembled-lab" id="assembled-lab">
      <SessionHeader
        title="Restore the OpenCoven UI specimen browser"
        branch="fix/specimen-browser-shell"
        status="active"
        budget={{ used: 0.41, limit: 5 }}
      />
      <Tabs value={view} onValueChange={(next) => setView(String(next))}>
        <div className="assembled-lab__nav">
          <TabsList className="assembled-lab__tabs">
            {Object.keys(views).map((name) => (
              <TabsTrigger key={name} value={name} className="capitalize">
                {name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {Object.entries(views).map(([name, content]) => (
          <TabsContent key={name} value={name}>
            <div className="assembled-lab__stage">{content}</div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}

export function DensityControl({
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
