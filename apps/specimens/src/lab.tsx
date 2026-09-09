import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  ResourceRow,
  SessionHeader,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TranscriptTurn,
} from "@opencoven/ui";
import { ComposerExample } from "./examples";
import type { Density } from "./catalog";

export function Lab({ density }: { density: Density }) {
  const [notice, setNotice] = useState("");
  return (
    <main className="lab-main" id="main-content" tabIndex={-1}>
      <header className="docs-heading">
        <Badge variant="presence">The component lab</Badge>
        <h1>
          See how it all
          <br />
          <em className="font-serif">comes together.</em>
        </h1>
        <p>
          Five focused compositions. One shared language. A place to try the
          pieces before making them your own.
        </p>
      </header>
      <div className="lab-surface">
        <SessionHeader
          title="Make the next interface yours"
          branch="feat/your-next-idea"
          status="active"
          budget={{ used: 0.41, limit: 5 }}
        />
        <Tabs defaultValue="composer">
          <div className="lab-tabs">
            <TabsList variant="line">
              {["Composer", "Messages", "Context", "Actions", "Cards"].map(
                (name) => (
                  <TabsTrigger key={name} value={name.toLowerCase()}>
                    {name}
                  </TabsTrigger>
                ),
              )}
            </TabsList>
          </div>
          <TabsContent value="composer">
            <div className="lab-stage">
              <TranscriptTurn
                familiar="Cody"
                initials="CO"
                role="Code Familiar"
                timestamp="Just now"
              >
                <p>
                  The component source, registry item, and specimen share one
                  implementation boundary. Ready when you are.
                </p>
              </TranscriptTurn>
              <ComposerExample density={density} />
            </div>
          </TabsContent>
          <TabsContent value="messages">
            <div className="lab-stage">
              <TranscriptTurn
                familiar="Cody"
                initials="CO"
                role="Code Familiar"
                timestamp="Just now"
              >
                <p>
                  Model selection, linked context, and send readiness stay
                  visible without interrupting the writing flow.
                </p>
              </TranscriptTurn>
              <TranscriptTurn
                familiar="Charm"
                initials="CH"
                role="Community Familiar"
                timestamp="2 minutes ago"
              >
                <p>
                  The same primitives carry a different familiar identity
                  without changing their accessibility contract.
                </p>
              </TranscriptTurn>
            </div>
          </TabsContent>
          <TabsContent value="context">
            <div className="lab-stage">
              <ResourceRow
                path="OpenCoven/coven-cave"
                meta="main · src/components/chat-view.tsx · read + write"
              />
              <ResourceRow
                path="Composer polish"
                meta="Linked task · Issue #4621"
              />
              <ResourceRow path="OpenCoven/ui" meta="feat/your-next-idea" />
            </div>
          </TabsContent>
          <TabsContent value="actions">
            <div className="lab-stage">
              <h2>Give your next step a little context.</h2>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() =>
                    setNotice("Demo: changed files attached as context.")
                  }
                >
                  Attach changed files
                </Button>
                <Button
                  onClick={() =>
                    setNotice(
                      "Demo: clarify the intent, keep the scope, and verify the result.",
                    )
                  }
                >
                  Enhance prompt
                </Button>
              </div>
              <p role="status">
                {notice || "Local interaction examples. No files are accessed."}
              </p>
            </div>
          </TabsContent>
          <TabsContent value="cards">
            <div className="lab-card-grid">
              {[
                [
                  "Pull request",
                  "Recover attachment ingestion",
                  "Checks 12 / 12",
                ],
                ["Proposal", "Merge with confidence", "Awaiting your review"],
                [
                  "Attachment",
                  "Components-preview.png",
                  "384 KB · added by Cody",
                ],
                ["Handoff", "Deployment ledger", "7 sections"],
              ].map(([kind, title, meta]) => (
                <Card key={kind}>
                  <CardHeader>
                    <Badge variant="neutral">{kind}</Badge>
                    <strong>{title}</strong>
                    <p className="text-muted-foreground">{meta}</p>
                  </CardHeader>
                  <CardContent>
                    Example {kind?.toLowerCase()} surface composed from public
                    modules.
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() =>
                        setNotice(
                          `${kind}: ${title}. This is sample content in the component lab.`,
                        )
                      }
                    >
                      Inspect example
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              <p role="status">{notice}</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <p className="lab-caption">
        Example data only. These components connect to your own application
        logic.
      </p>
    </main>
  );
}
