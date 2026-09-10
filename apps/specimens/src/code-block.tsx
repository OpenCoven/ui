import { CodeSnippet, type CodeLanguage } from "./code-snippet";

export function CodeBlock({
  code,
  label = "Terminal",
  compact = false,
  language = "bash",
}: {
  code: string;
  label?: string;
  compact?: boolean;
  language?: CodeLanguage;
}) {
  return (
    <div className={compact ? "code-block code-block--compact" : "code-block"}>
      <CodeSnippet key={code} code={code} language={language} label={label} />
    </div>
  );
}
