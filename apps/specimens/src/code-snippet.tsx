import { Button } from "@opencoven/ui";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import typescript from "highlight.js/lib/languages/typescript";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import { Check, Copy, Terminal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

hljs.registerLanguage("bash", (api) => {
  const grammar = bash(api);
  grammar.contains?.push(
    { scope: "built_in", begin: /\b(?:pnpm|npm|npx)\b/ },
    { scope: "keyword", begin: /\b(?:dlx|add|init|install)\b/ },
    { scope: "title", begin: /\bshadcn@latest\b/ },
  );
  return grammar;
});
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("css", css);

type CodeLanguage = "bash" | "typescript" | "css";

function HighlightedCode({
  code,
  language = "typescript",
}: {
  code: string;
  language?: CodeLanguage;
}) {
  const html = useMemo(
    () => hljs.highlight(code, { language }).value,
    [code, language],
  );

  // highlight.js escapes source text before adding its own token markup.
  return (
    <code
      className={`hljs language-${language}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function CodeSnippet({
  code,
  language,
  label,
}: {
  code: string;
  language: CodeLanguage;
  label: string;
}) {
  const [copyState, setCopyState] = useState<
    "idle" | "copying" | "copied" | "failed"
  >("idle");

  useEffect(() => {
    if (copyState !== "copied") return;
    const timeout = window.setTimeout(() => setCopyState("idle"), 2500);
    return () => window.clearTimeout(timeout);
  }, [copyState]);

  async function copy() {
    setCopyState("copying");
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <section className="specimen-code-snippet">
      <header className="specimen-code-snippet__header">
        <span>
          <Terminal aria-hidden="true" />
          {label}
        </span>
        <Button
          variant="ghost"
          aria-label={`Copy ${label}`}
          disabled={copyState === "copying"}
          focusableWhenDisabled
          onClick={copy}
        >
          {copyState === "copied" ? <Check /> : <Copy />}
          {copyState === "copied" ? "Copied" : "Copy"}
        </Button>
      </header>
      <pre className="specimen-command numeric" aria-label={label} tabIndex={0}>
        <HighlightedCode code={code} language={language} />
      </pre>
      <span
        className={copyState === "failed" ? "code-copy-error" : "sr-only"}
        role="status"
      >
        {copyState === "failed"
          ? "Could not copy. Select the code and copy it manually."
          : copyState === "copied"
            ? "Copied to clipboard."
            : ""}
      </span>
    </section>
  );
}

export { CodeSnippet, HighlightedCode, type CodeLanguage };
