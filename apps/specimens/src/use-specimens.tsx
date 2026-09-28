import {
  ActivityItem,
  AttachmentChip,
  BudgetPill,
  Button,
  Card,
  CompletionPalette,
  Composer,
  ContextMeter,
  FailureSurface,
  MetricDisplay,
  ModeSwitch,
  PlanRow,
  ResourceRow,
  RunRail,
  SendControl,
  SessionHeader,
  ToolMix,
  TranscriptTurn,
  type ComposerMode,
} from "@opencoven/ui";
import { type ReactNode, useMemo, useState } from "react";

export type Density = "default" | "compact";
type SpecimenGroup = "Composer" | "Run rail" | "Blocks";
export type Specimen = {
  id: string;
  title: string;
  group: SpecimenGroup;
  primitive: string;
  description: string;
  states: string;
  preview: ReactNode;
};

export const groupOrder: SpecimenGroup[] = ["Composer", "Run rail", "Blocks"];
export const groupDetails: Record<
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

export function matchesSpecimen(specimen: Specimen, query: string) {
  return `${specimen.title} ${specimen.group} ${specimen.description} ${specimen.states}`
    .toLowerCase()
    .includes(query.trim().toLowerCase());
}

export function useSpecimens(density: Density) {
  const [mode, setMode] = useState<ComposerMode>("do");
  const [message, setMessage] = useState("Review the changed files");

  return useMemo<Specimen[]>(
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
}
