import * as React from "react";

import { cn } from "@opencoven/ui/lib/utils";

type InputProps = React.ComponentProps<"input"> & {
  density?: "default" | "compact";
};

function Input({ className, density = "default", type, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      data-density={density}
      className={cn(
        "w-full min-w-0 rounded-md border border-input bg-card px-3 text-sm text-foreground shadow-[var(--elevation-1)] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        density === "compact" ? "h-7 px-2 text-xs" : "h-8",
        className,
      )}
      {...props}
    />
  );
}

export { Input, type InputProps };
