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
        "relative grid min-w-0 gap-4 border-s-2 border-s-presence/55 ps-5",
        className,
      )}
    >
      <header className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-md border border-presence/35 bg-presence/12 text-sm font-bold text-presence"
        >
          {initials}
        </span>
        <span className="min-w-0 flex-1">
          <strong className="block">{familiar}</strong>
          <span className="numeric block truncate text-[0.65rem] tracking-[0.1em] text-muted-foreground uppercase">
            {[role, model, timestamp].filter(Boolean).join(" · ")}
          </span>
        </span>
      </header>
      <div className="editorial min-w-0 max-w-prose break-words text-[1.05rem] leading-7">
        {children}
      </div>
      {artifacts}
      {utilities ? (
        <footer
          aria-label="Message utilities"
          className="flex min-w-0 flex-wrap gap-3 text-xs text-muted-foreground"
        >
          {utilities}
        </footer>
      ) : null}
    </article>
  );
}

export { TranscriptTurn, type TranscriptTurnProps };
