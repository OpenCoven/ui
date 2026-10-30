import {
  Button,
  CompletionPalette,
  Composer,
  RunRail,
  type ComposerAttachment,
  type ComposerMode,
} from "@opencoven/ui";
import { Paperclip, RotateCcw, Slash } from "lucide-react";
import { useState } from "react";

function ComposerDemo({ density }: { density: "default" | "compact" }) {
  const [mode, setMode] = useState<ComposerMode>("do");
  const [message, setMessage] = useState(
    "Review the changed files and suggest a focused fix.",
  );
  const [running, setRunning] = useState(false);
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([
    { id: "spec", name: "spec.md", meta: "4.2 KB" },
  ]);
  const [status, setStatus] = useState("Local preview. No requests are sent.");

  return (
    <div className="composer-demo">
      <Composer
        value={message}
        onValueChange={setMessage}
        mode={mode}
        onModeChange={setMode}
        density={density}
        running={running}
        onSend={() => {
          setRunning(true);
          setStatus("Demo run started. Use Stop to return to editing.");
        }}
        onStop={() => {
          setRunning(false);
          setStatus("Demo run stopped. Your draft is preserved.");
        }}
        attachments={attachments}
        onRemoveAttachment={(id) =>
          setAttachments((items) => items.filter((item) => item.id !== id))
        }
        tools={
          <>
            <Button
              variant="ghost"
              disabled={attachments.some((item) => item.id === "diff")}
              onClick={() => {
                setAttachments((items) => [
                  ...items,
                  { id: "diff", name: "changes.diff", meta: "8.1 KB" },
                ]);
                setStatus("Sample diff attached.");
              }}
            >
              <Paperclip /> Attach sample
            </Button>
            <CompletionPalette
              trigger={
                <Button variant="ghost">
                  <Slash /> Commands
                </Button>
              }
              commands={[
                {
                  id: "review",
                  label: "/review",
                  description: "Review the changed files",
                },
                {
                  id: "test",
                  label: "/test",
                  description: "Find missing test coverage",
                },
                {
                  id: "plan",
                  label: "/plan",
                  description: "Plan a focused implementation",
                },
              ]}
              onSelect={(command) => {
                setMessage(command.description);
                if (command.id === "plan") setMode("plan");
                setStatus(`${command.label} added to your draft.`);
              }}
            />
            <Button
              variant="ghost"
              aria-label="Reset composer demo"
              onClick={() => {
                setMessage("");
                setAttachments([]);
                setRunning(false);
                setMode("do");
                setStatus("Demo reset. Write a message to begin.");
              }}
            >
              <RotateCcw />
            </Button>
          </>
        }
      />
      <p className="demo-status" role="status">
        {status}
      </p>
    </div>
  );
}

function RunRailDemo({ density }: { density: "default" | "compact" }) {
  return (
    <RunRail
      density={density}
      metrics={[
        { value: "12.4", unit: "k", label: "Tokens" },
        { value: 2, label: "Files", tone: "success" },
        { value: "2:14", label: "Elapsed" },
      ]}
      plan={[
        {
          title: "Inspect the changed files",
          status: "complete",
          duration: "0:12",
        },
        { title: "Refine the component", status: "active" },
        { title: "Check keyboard behavior", status: "pending" },
      ]}
      activity={[
        { tool: "read", target: "src/composer.tsx", duration: "0.3s" },
        { tool: "exec", target: "pnpm test", running: true },
      ]}
      resources={[
        {
          path: "src/composer.tsx",
          operation: "M",
          additions: 24,
          deletions: 8,
        },
        { path: "tests/composer.test.tsx", operation: "A", additions: 18 },
      ]}
      context={{ used: 82_000, total: 200_000 }}
      budget={{ used: 0.41, limit: 5 }}
    />
  );
}

export { ComposerDemo, RunRailDemo };
