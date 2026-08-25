import { cn } from "@opencoven/ui/lib/utils";

type MetricTone = "neutral" | "success" | "warning" | "information";

const toneStyles: Record<MetricTone, string> = {
  neutral: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  information: "text-information",
};

type MetricDisplayProps = {
  value: string | number;
  label: string;
  unit?: string;
  tone?: MetricTone;
  density?: "default" | "compact";
  className?: string;
};

function MetricDisplay({
  value,
  label,
  unit,
  tone = "neutral",
  density = "default",
  className,
}: MetricDisplayProps) {
  return (
    <div
      data-slot="metric-display"
      data-density={density}
      className={cn(
        "grid min-w-0 gap-0.5 px-3 py-2",
        density === "compact" && "px-2 py-1.5",
        className,
      )}
    >
      <strong
        className={cn(
          "numeric truncate text-xl leading-none",
          density === "compact" && "text-base",
          toneStyles[tone],
        )}
      >
        {value}
        {unit ? (
          <span className="ms-0.5 text-xs font-medium text-muted-foreground">
            {unit}
          </span>
        ) : null}
      </strong>
      <span className="numeric truncate text-[0.62rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        {label}
      </span>
    </div>
  );
}

export { MetricDisplay, type MetricDisplayProps, type MetricTone };
