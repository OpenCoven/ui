import * as React from "react";

import { cn } from "@opencoven/ui/lib/utils";

type TextareaProps = React.ComponentProps<"textarea"> & {
  density?: "default" | "compact";
};

function Textarea({ className, density = "default", ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      data-density={density}
      className={cn(
        "min-h-20 w-full resize-y rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-[var(--elevation-1)] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        density === "compact" && "min-h-16 px-2 py-1.5 text-xs",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea, type TextareaProps };
