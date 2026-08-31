import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import {
  CommandReceipt,
  ConnectionStatus,
  DeveloperSurface,
} from "@opencoven/ui";

const daemonConnection = {
  id: "daemon-primary",
  name: "Coven daemon",
  kind: "Daemon" as const,
  state: "connected" as const,
  authority: "local-authority" as const,
  meta: "coven.daemon.v1",
};

const successfulReceipt = {
  id: "receipt-doctor",
  channel: "cli" as const,
  displayCommand: "coven doctor",
  status: "succeeded" as const,
  receiptId: "rcpt-doctor-1",
  exitCode: 0,
};

describe("developer surface components", () => {
  it("renders connection state and authority as text, not color alone", () => {
    render(
      <ConnectionStatus
        name="Cave client"
        kind="SDK"
        state="connected"
        authority="read-only"
        version="0.1"
        detail="Canonical reads through the experimental SDK surface."
      />,
    );

    expect(
      screen.getByRole("article", {
        name: "SDK Cave client: Connected; Read only",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Connected")).toBeInTheDocument();
    expect(screen.getByText("Read only")).toBeInTheDocument();
    expect(screen.getByText("Cave client")).toBeInTheDocument();
  });

  it("keeps presentation-safe invocation evidence explicit", () => {
    render(
      <CommandReceipt
        channel="cli"
        displayCommand="coven doctor"
        status="succeeded"
        receiptId="rcpt-doctor-1"
        duration="0.8s"
        exitCode={0}
        timestamp="2026-08-30T12:00:00Z"
      />,
    );

    expect(
      screen.getByRole("article", { name: "CLI invocation: Succeeded" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Succeeded")).toBeInTheDocument();
    expect(screen.getByText("coven doctor")).toBeInTheDocument();
    expect(screen.getByText("receipt rcpt-doctor-1")).toBeInTheDocument();
    expect(screen.getByText("exit 0")).toBeInTheDocument();
  });

  it("assembles integrations and receipts without performing authority work", async () => {
    const { container } = render(
      <DeveloperSurface
        project="OpenCoven/ui"
        branch="feat/developer-surface-system"
        connections={[
          daemonConnection,
          {
            id: "sdk-primary",
            name: "TypeScript SDK",
            kind: "SDK",
            state: "degraded",
            authority: "read-only",
            detail: "Experimental release surface",
          },
        ]}
        activity={[successfulReceipt]}
      />,
    );

    expect(screen.getByText("OpenCoven/ui")).toBeInTheDocument();
    expect(screen.getByText("2 sources")).toBeInTheDocument();
    expect(screen.getByText("1 receipt")).toBeInTheDocument();
    expect(screen.getByText("Authority rule")).toBeInTheDocument();

    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it("uses unique heading relationships for repeated surfaces", () => {
    const { container } = render(
      <>
        <DeveloperSurface
          title="Primary project"
          project="OpenCoven/ui"
          connections={[daemonConnection]}
          activity={[successfulReceipt]}
        />
        <DeveloperSurface
          title="Secondary project"
          project="OpenCoven/chat"
          headingLevel={3}
          connections={[]}
          activity={[]}
        />
      </>,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "Primary project" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Secondary project" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "No integration state is available. Do not infer connectivity or authority from an empty response.",
      ),
    ).toBeInTheDocument();

    const ids = [...container.querySelectorAll("[id]")].map(
      (element) => element.id,
    );
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
