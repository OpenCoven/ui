import { ArrowUp, CircleStop, ChevronDown } from "lucide-react";

import { Button } from "@opencoven/ui/components/ui/button";
import { cn } from "@opencoven/ui/lib/utils";

type SendControlProps = {
  running?: boolean;
  disabled?: boolean;
  density?: "default" | "compact";
  onSend?: () => void;
  onStop?: () => void;
  onOpenOptions?: () => void;
  className?: string;
};

function SendControl({
  running = false,
  disabled = false,
  density = "default",
  onSend,
  onStop,
  onOpenOptions,
  className,
}: SendControlProps) {
  if (running) {
    return (
      <Button
        type="button"
        variant="destructive"
        density={density}
        disabled={disabled}
        onClick={onStop}
        className={cn("min-w-24", className)}
      >
        <CircleStop />
        Stop run
      </Button>
    );
  }

  return (
    <div
      data-slot="send-control"
      className={cn(
        "inline-flex overflow-hidden rounded-md bg-presence text-presence-foreground",
        className,
      )}
    >
      <Button
        type="button"
        variant="presence"
        density={density}
        disabled={disabled}
        onClick={onSend}
        className="rounded-e-none"
      >
        Send
        <ArrowUp />
      </Button>
      <Button
        type="button"
        variant="presence"
        density={density}
        size="icon"
        disabled={disabled}
        aria-label="Send options"
        onClick={onOpenOptions}
        className="rounded-s-none border-s border-s-presence-foreground/25"
      >
        <ChevronDown />
      </Button>
    </div>
  );
}

export { SendControl, type SendControlProps };
