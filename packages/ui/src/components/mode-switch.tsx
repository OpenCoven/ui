"use client";

import { cn } from "@opencoven/ui/lib/utils";

const MODES = ["chat", "do", "plan"] as const;
type ComposerMode = (typeof MODES)[number];

type ModeSwitchProps = {
  value: ComposerMode;
  onValueChange: (value: ComposerMode) => void;
  density?: "default" | "compact";
  disabled?: boolean;
  className?: string;
};

function ModeSwitch({
  value,
  onValueChange,
  density = "default",
  disabled = false,
  className,
}: ModeSwitchProps) {
  return (
    <div
      data-slot="mode-switch"
      data-density={density}
      role="group"
      aria-label="Composer mode"
      className={cn(
        "inline-flex rounded-md border border-border bg-card p-[3px]",
        className,
      )}
    >
      {MODES.map((mode) => {
        const selected = value === mode;
        return (
          <button
            key={mode}
            type="button"
            aria-pressed={selected}
            disabled={disabled}
            onClick={() => onValueChange(mode)}
            className={cn(
              "rounded-sm border border-transparent px-2.5 text-sm font-medium capitalize text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50",
              density === "compact" ? "h-6 text-xs" : "h-7",
              selected &&
                "border-presence/25 bg-presence/12 font-semibold text-presence shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--presence)_22%,transparent)]",
            )}
          >
            {mode}
          </button>
        );
      })}
    </div>
  );
}

export { ModeSwitch, type ComposerMode, type ModeSwitchProps };
