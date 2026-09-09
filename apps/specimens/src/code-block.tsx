import { useState } from "react";
import { Button } from "@opencoven/ui";
import { Check, Copy, Terminal } from "lucide-react";

export function CodeBlock({
  code,
  label = "Terminal",
  compact = false,
}: {
  code: string;
  label?: string;
  compact?: boolean;
}) {
  const [status, setStatus] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus("Copied");
    } catch {
      setStatus("Copy unavailable. Select the code to copy it.");
    }
  }
  return (
    <div className={compact ? "code-block code-block--compact" : "code-block"}>
      <div className="code-block__bar">
        <span>
          <Terminal aria-hidden="true" />
          {label}
        </span>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Copy ${label}`}
          onClick={copy}
        >
          {status === "Copied" ? <Check /> : <Copy />}
        </Button>
      </div>
      <pre tabIndex={0} aria-label={label}>
        <code className="font-mono">{code}</code>
      </pre>
      <span
        className={
          status.startsWith("Copy unavailable") ? "copy-feedback" : "sr-only"
        }
        role="status"
      >
        {status}
      </span>
    </div>
  );
}
