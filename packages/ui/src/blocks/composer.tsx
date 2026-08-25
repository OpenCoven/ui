"use client";

import * as React from "react";

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
  density = "default",
  className,
}: ComposerProps) {
  return (
    <section
      data-slot="composer"
      data-density={density}
      aria-label="Message composer"
      className={cn(
        "surface grid gap-[var(--density-gap)] p-[var(--density-panel)]",
        className,
      )}
    >
      <label className="sr-only" htmlFor="coven-composer-message">
        Message
      </label>
      <Textarea
        id="coven-composer-message"
        value={value}
        density={density}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder="Describe the change, attach context, pick a mode…"
        className="min-h-24 resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
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
      <footer className="flex flex-wrap items-center gap-2">
        <ModeSwitch
          value={mode}
          onValueChange={onModeChange}
          density={density}
        />
        <span className="numeric ms-auto text-xs text-muted-foreground">
          {model}
        </span>
        <SendControl
          running={running}
          density={density}
          disabled={!running && value.trim().length === 0}
          onSend={onSend}
          onStop={onStop}
        />
      </footer>
    </section>
  );
}

export { Composer, type ComposerAttachment, type ComposerProps };
