import * as React from "react";

import { cn } from "@opencoven/ui/lib/utils";

type TranscriptTurnProps = {
  familiar: string;
  initials: string;
  role: string;
  model?: string;
  timestamp: string;
  children: React.ReactNode;
  utilities?: React.ReactNode;
  artifacts?: React.ReactNode;
  className?: string;
};

function TranscriptTurn({
  familiar,
  initials,
  role,
  model,
  timestamp,
  children,
  utilities,
  artifacts,
  className,
}: TranscriptTurnProps) {
  return (
    <article
      data-slot="transcript-turn"
      className={cn(
        "relative grid min-w-0 gap-3 border-s-2 border-s-presence/55 ps-3 sm:gap-4 sm:ps-5",
        className,
      )}
    >
      <header className="flex min-w-0 items-start gap-3 sm:items-center">
        <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-md border border-presence/35 bg-presence/12 text-sm font-bold text-presence">{initials}</span>
        <span className="min-w-0 flex-1">
          <strong className="block leading-5">{familiar}</strong>
          <span className="numeric block min-w-0 break-words text-[0.625rem] leading-4 tracking-[0.08em] text-muted-foreground uppercase sm:truncate sm:text-[0.65rem] sm:tracking-[0.1em]">{[role, model, timestamp].filter(Boolean).join(" · ")}</span>
        </span>
      </header>
      <div className="editorial min-w-0 max-w-prose break-words text-base leading-6 sm:text-[1.05rem] sm:leading-7">{children}</div>
      {artifacts}
      {utilities ? <footer aria-label="Message utilities" className="flex min-w-0 flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground">{utilities}</footer> : null}
    </article>
  );
}

export { TranscriptTurn, type TranscriptTurnProps };
