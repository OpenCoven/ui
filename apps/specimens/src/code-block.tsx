import { Button } from "@opencoven/ui";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

export function CopyCodeButton({
  text,
  label,
}: {
  text: string;
  label: string;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    if (status !== "copied") return;
    const timeout = window.setTimeout(() => setStatus("idle"), 2000);
    return () => window.clearTimeout(timeout);
  }, [status]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="copy-code">
      <Button
        variant="ghost"
        density="compact"
        onClick={copy}
        aria-label={`Copy ${label}`}
      >
        {status === "copied" ? <Check /> : <Copy />}
        {status === "copied" ? "Copied" : "Copy"}
      </Button>
      <span
        role="status"
        className={status === "error" ? "copy-code__error" : "sr-only"}
      >
        {status === "error"
          ? "Could not copy. Select and copy the code manually."
          : status === "copied"
            ? "Copied to clipboard."
            : ""}
      </span>
    </div>
  );
}

export function CodeBlock({
  children,
  label,
}: {
  children: string;
  label: string;
}) {
  return (
    <div className="docs-code">
      <div className="docs-code__header">
        <span>{label}</span>
        <CopyCodeButton text={children} label={label} />
      </div>
      <pre tabIndex={0}>
        <code>{children}</code>
      </pre>
    </div>
  );
}
