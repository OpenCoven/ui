import { AlertTriangle } from "lucide-react";

import { Button } from "@opencoven/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@opencoven/ui/components/ui/card";
import { cn } from "@opencoven/ui/lib/utils";

type FailureAction = {
  label: string;
  onSelect: () => void;
};

type FailureSurfaceProps = {
  command: string;
  exitCode: number;
  output: string;
  actions?: FailureAction[];
  className?: string;
};

function FailureSurface({
  command,
  exitCode,
  output,
  actions = [],
  className,
}: FailureSurfaceProps) {
  return (
    <Card
      data-slot="failure-surface"
      role="alert"
      className={cn(
        "border-destructive/45 border-s-4 border-s-destructive",
        className,
      )}
    >
      <CardHeader className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
        <span className="numeric inline-flex items-center gap-1 rounded-sm border border-destructive/40 bg-destructive/12 px-1.5 py-0.5 text-xs font-semibold text-destructive uppercase">
          <AlertTriangle aria-hidden="true" className="size-3" />
          exit {exitCode}
        </span>
        <strong className="truncate text-sm">{command}</strong>
      </CardHeader>
      <CardContent>
        <pre className="numeric max-h-52 overflow-auto rounded-sm bg-muted p-3 text-xs whitespace-pre-wrap text-foreground">
          {output}
        </pre>
      </CardContent>
      {actions.length > 0 ? (
        <CardFooter>
          {actions.map((action) => (
            <Button
              key={action.label}
              type="button"
              variant="ghost"
              density="compact"
              onClick={action.onSelect}
            >
              {action.label}
            </Button>
          ))}
        </CardFooter>
      ) : null}
    </Card>
  );
}

export { FailureSurface, type FailureAction, type FailureSurfaceProps };
