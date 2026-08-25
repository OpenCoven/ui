import { cn } from "@opencoven/ui/lib/utils";

type ProgressProps = {
  value: number;
  max?: number;
  label: string;
  className?: string;
  indicatorClassName?: string;
};

function Progress({
  value,
  max = 100,
  label,
  className,
  indicatorClassName,
}: ProgressProps) {
  const boundedValue = Math.min(Math.max(value, 0), max);
  const percentage = max > 0 ? (boundedValue / max) * 100 : 0;

  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={boundedValue}
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-sm bg-muted",
        className,
      )}
    >
      <span
        data-slot="progress-indicator"
        className={cn(
          "block h-full rounded-sm bg-presence transition-[width]",
          indicatorClassName,
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export { Progress, type ProgressProps };
