import { FileCode2 } from "lucide-react";

import { cn } from "@opencoven/ui/lib/utils";

type FileOperation = "M" | "A" | "D" | "R";

const operationStyles: Record<FileOperation, string> = {
  M: "text-tool-exec",
  A: "text-tool-write",
  D: "text-tool-net",
  R: "text-tool-read",
};

type ResourceRowProps = {
  path: string;
  operation?: FileOperation;
  additions?: number;
  deletions?: number;
  meta?: string;
  density?: "default" | "compact";
  onSelect?: () => void;
  className?: string;
};

function ResourceRow({
  path,
  operation,
  additions,
  deletions,
  meta,
  density = "default",
  onSelect,
  className,
}: ResourceRowProps) {
  const content = (
    <>
      {operation ? (
        <span
          className={cn("numeric w-4 font-bold", operationStyles[operation])}
        >
          {operation}
        </span>
      ) : (
        <FileCode2
          aria-hidden="true"
          className="size-4 text-muted-foreground"
        />
      )}
      <span className="min-w-0">
        <bdi className="numeric block truncate text-start text-sm" dir="rtl">
          {path}
        </bdi>
        {meta ? (
          <span className="block truncate text-xs text-muted-foreground">
            {meta}
          </span>
        ) : null}
      </span>
      {additions !== undefined || deletions !== undefined ? (
        <span className="numeric flex gap-1 text-xs">
          <span className="text-tool-write">+{additions ?? 0}</span>
          <span className="text-tool-net">−{deletions ?? 0}</span>
        </span>
      ) : null}
    </>
  );

  const classes = cn(
    "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-3 py-2 text-start last:border-b-0",
    density === "compact" && "px-2 py-1.5",
    onSelect && "hover:bg-muted",
    className,
  );

  return onSelect ? (
    <button
      type="button"
      data-slot="resource-row"
      data-density={density}
      className={classes}
      onClick={onSelect}
    >
      {content}
    </button>
  ) : (
    <div data-slot="resource-row" data-density={density} className={classes}>
      {content}
    </div>
  );
}

export { ResourceRow, type FileOperation, type ResourceRowProps };
