import { AlertCircle, File, LoaderCircle, X } from "lucide-react";

import { Button } from "@opencoven/ui/components/ui/button";
import { Progress } from "@opencoven/ui/components/ui/progress";
import { cn } from "@opencoven/ui/lib/utils";

type AttachmentState = "ready" | "uploading" | "failed";

type AttachmentChipProps = {
  name: string;
  meta?: string;
  state?: AttachmentState;
  progress?: number;
  onRemove?: () => void;
  className?: string;
};

function AttachmentChip({
  name,
  meta,
  state = "ready",
  progress = 0,
  onRemove,
  className,
}: AttachmentChipProps) {
  const Icon =
    state === "uploading"
      ? LoaderCircle
      : state === "failed"
        ? AlertCircle
        : File;

  return (
    <span
      data-slot="attachment-chip"
      data-state={state}
      className={cn(
        "inline-grid max-w-72 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5 rounded-md border bg-card px-2 py-1 text-xs",
        state === "uploading" && "border-dashed",
        state === "failed" && "border-destructive/45",
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          "size-3.5 text-muted-foreground",
          state === "uploading" && "animate-spin motion-reduce:animate-none",
          state === "failed" && "text-destructive",
        )}
      />
      <span className="min-w-0">
        <span className="block truncate font-medium">{name}</span>
        {state === "uploading" ? (
          <Progress
            value={progress}
            label={`Uploading ${name}`}
            className="mt-1 h-1"
          />
        ) : (
          <span
            className={cn(
              "numeric block text-[0.68rem] text-muted-foreground",
              state === "failed" && "font-semibold text-destructive",
            )}
          >
            {meta}
          </span>
        )}
      </span>
      {state !== "uploading" && onRemove ? (
        <Button
          type="button"
          variant="ghost"
          density="compact"
          size="icon"
          aria-label={`Remove ${name}`}
          onClick={onRemove}
        >
          <X />
        </Button>
      ) : null}
    </span>
  );
}

export { AttachmentChip, type AttachmentChipProps, type AttachmentState };
