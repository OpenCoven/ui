import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import {
  CommandReceipt,
  ConnectionStatus,
  DeveloperSurface,
} from "@opencoven/ui";

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

    expect(screen.getByText("Connected")).toBeInTheDocument();
    expect(screen.getByText("Read only")).toBeInTheDocument();
    expect(screen.getByText("Cave client")).toBeInTheDocument();
  });

  it("keeps invocation evidence explicit", () => {
    render(
      <CommandReceipt
        channel="cli"
        command="coven doctor"
        status="success"
        duration="0.8s"
        exitCode={0}
      />,
    );

    expect(screen.getByText("Complete")).toBeInTheDocument();
    expect(screen.getByText("coven doctor")).toBeInTheDocument();
    expect(screen.getByText("exit 0")).toBeInTheDocument();
  });

  it("assembles integrations and receipts without performing authority work", async () => {
    const { container } = render(
      <DeveloperSurface
        project="OpenCoven/ui"
        branch="feat/developer-surface-system"
        connections={[
          {
            name: "Coven daemon",
            kind: "Daemon",
            state: "connected",
            authority: "local-authority",
            meta: "coven.daemon.v1",
          },
          {
            name: "TypeScript SDK",
            kind: "SDK",
            state: "degraded",
            authority: "read-only",
            detail: "Experimental release surface",
          },
        ]}
        activity={[
          {
            channel: "cli",
            command: "coven doctor",
            status: "success",
            exitCode: 0,
          },
        ]}
      />,
    );

    expect(screen.getByText("OpenCoven/ui")).toBeInTheDocument();
    expect(screen.getByText("2 sources")).toBeInTheDocument();
    expect(screen.getByText("1 receipt")).toBeInTheDocument();
    expect(screen.getByText("Authority rule")).toBeInTheDocument();

    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});
