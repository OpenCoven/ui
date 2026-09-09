import { useState } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyState,
  ErrorState,
  FailureSurface,
  Input,
  MetricDisplay,
  ModeSwitch,
  PlanRow,
  Progress,
  ResourceRow,
  RunRail,
  SearchField,
  SendControl,
  Separator,
  SessionHeader,
  StatusIndicator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  ToolClassBadge,
  ToolMix,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TranscriptTurn,
} from "@opencoven/ui";

export function ButtonExample() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="presence" onClick={() => setSaved(!saved)}>
        {saved ? "Changes saved" : "Save changes"}
      </Button>
      <Button variant="outline" onClick={() => setSaved(false)}>
        Reset
      </Button>
      <Button disabled>Disabled</Button>
    </div>
  );
}

export function BadgeExample() {
  return (
    <div className="flex flex-wrap gap-3">
      <Badge>Default</Badge>
      <Badge variant="presence">In progress</Badge>
      <Badge variant="neutral">Draft</Badge>
    </div>
  );
}

export function CardExample() {
  const [saved, setSaved] = useState(false);
  return (
    <Card className="w-full">
      <CardHeader>
        <strong>A space for your next idea.</strong>
        <p className="text-muted-foreground">
          Composable surfaces. Nothing more than you need.
        </p>
      </CardHeader>
      <CardContent>
        Your next project starts with a small building block.
      </CardContent>
      <CardFooter>
        <Button onClick={() => setSaved(!saved)}>
          {saved ? "Added to this demo" : "Try this component"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export function DropdownMenuExample() {
  const [selected, setSelected] = useState("Choose an action");
  return (
    <div className="flex flex-col items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button>Open menu</Button>} />
        <DropdownMenuContent>
          <div role="group" aria-label="Actions">
            <DropdownMenuItem onClick={() => setSelected("Duplicate selected")}>
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelected("Archive selected")}>
              Archive
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      <p role="status">{selected}</p>
    </div>
  );
}

export function InputExample({
  density = "default",
}: {
  density?: "default" | "compact";
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor="example-name">Project name</label>
      <Input
        id="example-name"
        placeholder="Something worth making"
        density={density}
      />
    </div>
  );
}

export function ProgressExample() {
  const [value, setValue] = useState(40);
  return (
    <div className="flex w-full flex-col gap-4">
      <Progress value={value} label="Demo completion" />
      <Button onClick={() => setValue(value === 100 ? 0 : value + 20)}>
        {value === 100 ? "Start again" : `Advance · ${value}%`}
      </Button>
    </div>
  );
}

export function SeparatorExample() {
  return (
    <div className="flex w-full flex-col gap-4">
      <p>Intent</p>
      <Separator />
      <p>Execution</p>
      <Separator />
      <p>Evidence</p>
    </div>
  );
}

export function TabsExample() {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        A little structure makes everything easier to find.
      </TabsContent>
      <TabsContent value="activity">
        All caught up. Your next action will appear here.
      </TabsContent>
    </Tabs>
  );
}

export function TextareaExample({
  density = "default",
}: {
  density?: "default" | "compact";
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor="example-notes">Your instructions</label>
      <Textarea
        id="example-notes"
        density={density}
        placeholder="Make room for a bigger thought…"
      />
    </div>
  );
}

export function TooltipExample() {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button>Hover or focus me</Button>} />
      <TooltipContent>A little context, right when you need it.</TooltipContent>
    </Tooltip>
  );
}

export function ModeSwitchExample({
  density = "default",
}: {
  density?: "default" | "compact";
}) {
  const [mode, setMode] = useState<"chat" | "do" | "plan">("do");
  return <ModeSwitch value={mode} onValueChange={setMode} density={density} />;
}

export function SendControlExample({
  density = "default",
}: {
  density?: "default" | "compact";
}) {
  const [running, setRunning] = useState(false);
  return (
    <div className="flex items-center gap-4">
      <SendControl
        density={density}
        running={running}
        onSend={() => setRunning(true)}
        onStop={() => setRunning(false)}
      />
      <span role="status">
        {running ? "Demo running — press stop" : "Ready to try"}
      </span>
    </div>
  );
}

export function CompletionPaletteExample() {
  const [selected, setSelected] = useState("Pick a slash command");
  return (
    <div className="flex flex-col items-center gap-4">
      <CompletionPalette
        trigger={<Button>Open slash commands</Button>}
        commands={[
          { id: "plan", label: "/plan", description: "Think before acting" },
          {
            id: "handoff",
            label: "/handoff",
            description: "Prepare a continuation",
          },
        ]}
        onSelect={(command) => setSelected(command.label)}
      />
      <span role="status">{selected}</span>
    </div>
  );
}

export function AttachmentChipExample() {
  const [attached, setAttached] = useState(true);
  return (
    <div className="flex flex-wrap items-center gap-3">
      {attached ? (
        <AttachmentChip
          name="design-system.md"
          meta="4.2 KB"
          onRemove={() => setAttached(false)}
        />
      ) : (
        <Button onClick={() => setAttached(true)}>Restore attachment</Button>
      )}
      <AttachmentChip name="preview.png" state="uploading" progress={62} />
    </div>
  );
}

export function SearchFieldExample() {
  const [query, setQuery] = useState("");
  return (
    <div className="flex w-full flex-col gap-4">
      <SearchField
        aria-label="Example search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search your workspace…"
      />
      <p role="status">
        {query
          ? `Searching for “${query}” in this demo`
          : "Start typing to try the search field."}
      </p>
    </div>
  );
}

export function ActivityItemExample() {
  return (
    <div className="flex w-full flex-col gap-3">
      <ActivityItem
        tool="read"
        target="src/components/button.tsx"
        duration="0.3s"
      />
      <ActivityItem tool="exec" target="pnpm test" duration="2.1s" />
      <ActivityItem
        tool="write"
        target="src/styles/globals.css"
        duration="0.2s"
      />
    </div>
  );
}

export function BudgetPillExample() {
  return (
    <div className="flex flex-wrap gap-3">
      <BudgetPill used={0.41} limit={5} />
      <BudgetPill used={4.12} limit={5} />
      <BudgetPill used={5.37} limit={5} />
    </div>
  );
}

export function ContextMeterExample() {
  return (
    <div className="flex w-full flex-col gap-6">
      <ContextMeter used={82000} total={200000} />
      <ContextMeter used={172000} total={200000} />
    </div>
  );
}

export function EmptyStateExample() {
  return (
    <EmptyState
      title="A fresh start"
      description="No activity yet. Your next run will appear here."
    />
  );
}

export function ErrorStateExample() {
  const [retry, setRetry] = useState(false);
  return retry ? (
    <p role="status">Demo retry received. No network request was made.</p>
  ) : (
    <ErrorState
      title="Connection interrupted"
      description="Your work is safe. Try connecting again."
      action={<Button onClick={() => setRetry(true)}>Try again</Button>}
    />
  );
}

export function FailureSurfaceExample() {
  const [retried, setRetried] = useState(false);
  return retried ? (
    <p role="status">Demo retry received. No command was executed.</p>
  ) : (
    <FailureSurface
      command="pnpm test"
      exitCode={1}
      output="AssertionError: expected 3 cells, got 4"
      actions={[{ label: "Retry demo", onSelect: () => setRetried(true) }]}
    />
  );
}

export function MetricDisplayExample() {
  return (
    <div className="grid w-full grid-cols-3">
      <MetricDisplay value="12.4" unit="k" label="Tokens" />
      <MetricDisplay value={8} label="Files" />
      <MetricDisplay value="2:14" label="Elapsed" />
    </div>
  );
}

export function PlanRowExample() {
  return (
    <div className="w-full">
      <PlanRow
        title="Understand the requirements"
        status="complete"
        duration="0:12"
      />
      <PlanRow title="Build something considered" status="active" />
      <PlanRow title="Check the details" status="pending" />
    </div>
  );
}

export function ResourceRowExample() {
  return (
    <div className="w-full">
      <ResourceRow
        path="src/components/button.tsx"
        operation="M"
        additions={24}
        deletions={6}
      />
      <ResourceRow
        path="src/styles/tokens.css"
        operation="A"
        additions={48}
        deletions={0}
      />
    </div>
  );
}

export function StatusIndicatorExample() {
  return (
    <div className="flex flex-wrap gap-5">
      <StatusIndicator status="pending" />
      <StatusIndicator status="active" />
      <StatusIndicator status="complete" />
      <StatusIndicator status="blocked" />
    </div>
  );
}

export function ToolClassBadgeExample() {
  return (
    <div className="flex flex-wrap gap-3">
      <ToolClassBadge tool="read" />
      <ToolClassBadge tool="exec" />
      <ToolClassBadge tool="write" />
      <ToolClassBadge tool="net" />
    </div>
  );
}

export function ToolMixExample() {
  return (
    <ToolMix
      values={[
        { tool: "read", value: 38 },
        { tool: "exec", value: 27 },
        { tool: "write", value: 24 },
        { tool: "net", value: 11 },
      ]}
    />
  );
}

export function ComposerExample({
  density = "default",
}: {
  density?: "default" | "compact";
}) {
  const [mode, setMode] = useState<"chat" | "do" | "plan">("do");
  const [message, setMessage] = useState("Make something that feels like us.");
  const [sent, setSent] = useState(false);
  return (
    <div className="flex w-full flex-col gap-3">
      <Composer
        value={message}
        onValueChange={setMessage}
        mode={mode}
        onModeChange={setMode}
        density={density}
        model="Your model"
        onSend={() => {
          setSent(true);
          setMessage("");
        }}
      />
      <span className="text-muted-foreground" role="status">
        {sent
          ? "Message received locally. This is an interactive UI demo."
          : "Interactive demo · no model connected"}
      </span>
    </div>
  );
}

export function RunRailExample({
  density = "default",
}: {
  density?: "default" | "compact";
}) {
  return (
    <RunRail
      density={density}
      metrics={[
        { value: "12.4", unit: "k", label: "Tokens" },
        { value: 8, label: "Files" },
        { value: "2:14", label: "Elapsed" },
      ]}
      activity={[
        { tool: "read", target: "src/button.tsx", duration: "0.3s" },
        { tool: "exec", target: "pnpm test", duration: "2.1s" },
      ]}
      context={{ used: 82000, total: 200000 }}
      budget={{ used: 0.41, limit: 5 }}
    />
  );
}

export function SessionHeaderExample() {
  return (
    <SessionHeader
      title="Build the next good thing"
      branch="feat/considered-interfaces"
      status="complete"
      budget={{ used: 0.41, limit: 5 }}
    />
  );
}

export function TranscriptTurnExample() {
  return (
    <TranscriptTurn
      familiar="Cody"
      initials="CO"
      role="Code Familiar"
      timestamp="Just now"
    >
      <p>
        The small details are the interface. I kept the structure simple, made
        every state explicit, and left the source in your hands.
      </p>
    </TranscriptTurn>
  );
}
