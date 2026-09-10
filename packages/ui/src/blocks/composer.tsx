"use client";

import * as React from "react";
import { Bot, CornerDownLeft, PenLine } from "lucide-react";

import { AttachmentChip } from "@opencoven/ui/components/attachment-chip";
import {
  ModeSwitch,
  type ComposerMode,
} from "@opencoven/ui/components/mode-switch";
import { SendControl } from "@opencoven/ui/components/send-control";
import { Textarea } from "@opencoven/ui/components/ui/textarea";
import { cn } from "@opencoven/ui/lib/utils";

type ComposerAttachment = {
  id: string;
  name: string;
  meta?: string;
};

type ComposerProps = {
  value: string;
  onValueChange: (value: string) => void;
  mode: ComposerMode;
  onModeChange: (mode: ComposerMode) => void;
  attachments?: ComposerAttachment[];
  onRemoveAttachment?: (id: string) => void;
  onSend?: () => void;
  running?: boolean;
  onStop?: () => void;
  model?: string;
  tools?: React.ReactNode;
  density?: "default" | "compact";
  className?: string;
};

function Composer({
  value,
  onValueChange,
  mode,
  onModeChange,
  attachments = [],
  onRemoveAttachment,
  onSend,
  running = false,
  onStop,
  model = "GPT-5.6 Sol",
  tools,
  density = "default",
  className,
}: ComposerProps) {
  const messageId = React.useId();
  const hintId = React.useId();
  const modeHint = {
    chat: "Explore ideas without changing files.",
    do: "Make changes with the context you provide.",
    plan: "Map the approach before making changes.",
  }[mode];

  return (
    <section
      data-slot="composer"
      data-density={density}
      aria-label="Message composer"
      className={cn(
        "surface grid min-w-0 gap-[var(--density-gap)] border-presence/30 p-[var(--density-panel)]",
        className,
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-semibold text-presence">
          <PenLine aria-hidden="true" className="size-4" />
          Compose
        </span>
        <span className="numeric flex items-center gap-1.5 rounded-md border border-presence/20 bg-presence/5 px-2 py-1 text-[0.65rem] text-presence">
          <Bot aria-hidden="true" className="size-3" />
          {model}
        </span>
      </header>
      <label className="sr-only" htmlFor={messageId}>
        Message
      </label>
      <Textarea
        id={messageId}
        aria-describedby={hintId}
        value={value}
        density={density}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" &&
            (event.metaKey || event.ctrlKey) &&
            !event.nativeEvent.isComposing &&
            !event.repeat &&
            !running &&
            value.trim()
          ) {
            event.preventDefault();
            onSend?.();
          }
        }}
        placeholder="Describe the change, attach context, pick a mode…"
        className="min-h-24 resize-y border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
      />
      {attachments.length > 0 ? (
        <div className="flex flex-wrap gap-2" aria-label="Attachments">
          {attachments.map((attachment) => (
            <AttachmentChip
              key={attachment.id}
              name={attachment.name}
              meta={attachment.meta}
              onRemove={
                onRemoveAttachment
                  ? () => onRemoveAttachment(attachment.id)
                  : undefined
              }
            />
          ))}
        </div>
      ) : null}
      {tools ? (
        <div
          className="flex flex-wrap items-center gap-2"
          aria-label="Composer tools"
        >
          {tools}
        </div>
      ) : null}
      <footer className="flex flex-wrap items-center gap-2 border-t border-presence/15 pt-3">
        <ModeSwitch
          value={mode}
          onValueChange={onModeChange}
          density={density}
        />
        <span
          className="numeric ms-auto flex items-center gap-1 text-[0.65rem] text-muted-foreground"
          aria-hidden="true"
        >
          Ctrl / ⌘ <CornerDownLeft className="size-3" />
        </span>
        <SendControl
          running={running}
          density={density}
          disabled={!running && value.trim().length === 0}
          onSend={onSend}
          onStop={onStop}
        />
      </footer>
      <p id={hintId} className="m-0 text-xs text-muted-foreground">
        {running ? "Running. Stop the run to take back control." : modeHint}{" "}
        <span className="sr-only">
          Press Control or Command and Enter to send.
        </span>
      </p>
    </section>
  );
}

export { Composer, type ComposerAttachment, type ComposerProps };
