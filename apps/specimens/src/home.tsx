import { useState } from "react";
import {
  Asterisk,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Braces,
  Check,
  Code2,
  GitBranch,
  Layers,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  Badge,
  Button,
  Composer,
  PlanRow,
  ResourceRow,
  Separator,
  TranscriptTurn,
  buttonVariants,
  cn,
} from "@opencoven/ui";
import { catalog, componentHref, installCommand } from "./catalog";
import { CodeBlock } from "./code-block";

function AgentShowcase() {
  const [mode, setMode] = useState<"chat" | "do" | "plan">("do");
  const [message, setMessage] = useState(
    "Build a little less. Make it mean a little more.",
  );
  const [sent, setSent] = useState(false);
  const [attached, setAttached] = useState(true);
  return (
    <div className="agent-showcase">
      <div className="showcase-title">
        <span>
          <Asterisk className="coven-glyph" aria-hidden="true" /> Your next
          great interface
        </span>
        <Badge variant="neutral">Interactive demo</Badge>
      </div>
      <div className="showcase-workspace">
        <div className="showcase-conversation">
          <div className="showcase-context">
            <GitBranch aria-hidden="true" /> feat / something-good{" "}
            <span>OpenCoven</span>
          </div>
          <TranscriptTurn
            familiar="Cody"
            initials="CO"
            role="Code familiar"
            timestamp="Just now"
          >
            <p>
              {sent
                ? "Got it. Your intent is clear. In your app, this is where your agent takes over."
                : "Good interfaces make complex things feel simple. Let’s start with the parts that matter."}
            </p>
          </TranscriptTurn>
          <div className="showcase-plan">
            <PlanRow title="Understand the intent" status="complete" />
            <PlanRow
              title="Compose the right building blocks"
              status={sent ? "complete" : "active"}
            />
            <PlanRow
              title="Make it unmistakably yours"
              status={sent ? "active" : "pending"}
            />
          </div>
          <div className="showcase-composer">
            <Composer
              value={message}
              onValueChange={setMessage}
              mode={mode}
              onModeChange={setMode}
              model="Your model"
              attachments={
                attached ? [{ id: "brief", name: "design-brief.md" }] : []
              }
              onRemoveAttachment={() => setAttached(false)}
              onSend={() => {
                setSent(true);
                setMessage("");
              }}
            />
          </div>
          <div className="showcase-footnote">
            <span role="status">
              {sent
                ? "Received locally. No model connected."
                : "Your intent. Your model. Your interface."}
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Reset showcase"
              onClick={() => {
                setSent(false);
                setAttached(true);
                setMessage("Build a little less. Make it mean a little more.");
              }}
            >
              <RotateCcw />
            </Button>
          </div>
        </div>
        <aside className="showcase-evidence">
          <span className="eyebrow">Behind the interface</span>
          <h3>
            Nothing hidden.
            <br />
            Everything yours.
          </h3>
          <p className="evidence-ownership">
            Readable source, thoughtful defaults, and room for your own point of
            view.
          </p>
          <Separator />
          <div className="evidence-files">
            <span>Made of small things</span>
            <ResourceRow path="composer.tsx" />
            <ResourceRow path="plan-row.tsx" />
            <ResourceRow path="transcript-turn.tsx" />
          </div>
          <div className="evidence-note">
            <Braces aria-hidden="true" />
            <p>
              Real components.
              <br />
              Not a screenshot.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function Home() {
  const featured = [
    "mode-switch",
    "plan-row",
    "attachment-chip",
    "context-meter",
    "resource-row",
    "status-indicator",
  ].map((id) => catalog.find((entry) => entry.name === id)!);
  return (
    <main id="main-content" className="home-main" tabIndex={-1}>
      <section className="home-hero">
        <a className="release-note" href="/docs">
          <span className="release-dot" /> An open source beginning{" "}
          <span className="release-divider" /> Meet Coven UI{" "}
          <ArrowUpRight aria-hidden="true" />
        </a>
        <h1>
          Built for agents.
          <br />
          <em className="font-serif">Made for humans.</em>
        </h1>
        <p className="hero-description">
          Thoughtful components for the next generation of interfaces.
          <br className="desktop-break" /> Accessible. Composable. A little more
          familiar.
        </p>
        <div className="hero-actions">
          <a
            className={cn(buttonVariants({ variant: "presence" }), "hero-cta")}
            href="/docs/installation"
          >
            Start building <ArrowRight data-icon="inline-end" />
          </a>
          <a
            className={cn(buttonVariants({ variant: "outline" }), "hero-cta")}
            href="/docs/components"
          >
            Explore components <Boxes data-icon="inline-end" />
          </a>
        </div>
        <div className="hero-install">
          <CodeBlock
            compact
            code={installCommand("composer")}
            label="Install composer"
          />
        </div>
        <div className="hero-foundations">
          <span>
            <Check /> Open source
          </span>
          <span>
            <Check /> Built on Base UI
          </span>
          <span>
            <Check /> shadcn compatible
          </span>
        </div>
      </section>
      <section
        className="showcase-section"
        aria-label="Interactive component showcase"
      >
        <div className="section-overline">
          <span>A familiar feeling. A different kind of UI.</span>
          <span>
            Go on, try it <ArrowDown aria-hidden="true" />
          </span>
        </div>
        <AgentShowcase />
        <div className="showcase-caption">
          <span>Less chrome. More clarity.</span>
          <a href="/lab">
            Open the component lab <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </section>
      <section className="home-library" id="components">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Small pieces. Real possibilities.</p>
            <h2>A considered collection.</h2>
            <p>
              From the first prompt to the final detail. Make every state feel
              right.
            </p>
          </div>
          <a href="/docs/components">
            All {catalog.length} components <ArrowRight aria-hidden="true" />
          </a>
        </div>
        <div className="home-component-grid">
          {featured.map((entry) => (
            <article className="home-component" key={entry.name}>
              <div className="home-component-preview">
                <entry.Component />
              </div>
              <a href={componentHref(entry.name)}>
                <span>{entry.title}</span>
                <ArrowUpRight aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
      </section>
      <section className="principles">
        <div>
          <Layers aria-hidden="true" />
          <h3>Compose, don’t compromise.</h3>
          <p>
            Small, focused primitives that work beautifully together. Start with
            one. Build your own system.
          </p>
        </div>
        <div>
          <Code2 aria-hidden="true" />
          <h3>Your code. Your call.</h3>
          <p>
            Copy the source into your project. Change the details, own the
            behavior, and skip the black box.
          </p>
        </div>
        <div>
          <Sparkles aria-hidden="true" />
          <h3>Familiar, by design.</h3>
          <p>
            Clear intent, visible progress, thoughtful defaults. Interfaces that
            keep people in the loop.
          </p>
        </div>
      </section>
      <section className="home-closing">
        <p className="eyebrow">A foundation, not a formula.</p>
        <h2>
          The next interface
          <br />
          is <em className="font-serif">yours to make.</em>
        </h2>
        <a
          href="/docs/installation"
          className={cn(buttonVariants({ variant: "presence" }), "hero-cta")}
        >
          Make yourself at home <ArrowRight data-icon="inline-end" />
        </a>
      </section>
    </main>
  );
}
