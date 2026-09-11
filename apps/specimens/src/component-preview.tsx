import { Tabs, TabsContent, TabsList, TabsTrigger } from "@opencoven/ui";
import { type ReactNode, useRef, useState } from "react";

import { CodeSnippet } from "./code-snippet";

function ComponentPreview({
  children,
  source,
  title,
  filename,
}: {
  children: ReactNode;
  source: string | undefined;
  title: string;
  filename: string;
}) {
  const [sourceOpen, setSourceOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div
      className="specimen-preview"
      onKeyDown={(event) => {
        if (event.key === "Escape" && sourceOpen) {
          event.preventDefault();
          setSourceOpen(false);
          triggerRef.current?.focus({ preventScroll: true });
        }
      }}
    >
      <Tabs
        value={sourceOpen ? "source" : "preview"}
        onValueChange={(value) => setSourceOpen(value === "source")}
        className="specimen-preview__tabs"
      >
        <TabsList
          variant="line"
          className="specimen-view-tabs"
          aria-label={`${title} view`}
          activateOnFocus
        >
          <TabsTrigger value="preview" ref={triggerRef}>
            Preview
          </TabsTrigger>
          <TabsTrigger value="source">Source</TabsTrigger>
        </TabsList>
        <div className="specimen-preview__canvas">
          {/* Keep the live component's dimensions and state behind its source. */}
          <TabsContent
            value="preview"
            keepMounted
            hidden={false}
            className="specimen-live-panel"
            style={{ visibility: sourceOpen ? "hidden" : undefined }}
            aria-hidden={sourceOpen || undefined}
            inert={sourceOpen}
          >
            <div className="specimen-stage">{children}</div>
          </TabsContent>
          <TabsContent value="source" className="specimen-source-overlay">
            {source ? (
              <CodeSnippet
                code={source}
                language="typescript"
                label={filename}
              />
            ) : (
              <p className="text-destructive">
                Source unavailable for this specimen.
              </p>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export { ComponentPreview };
