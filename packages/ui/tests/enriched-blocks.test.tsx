import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";

import { Composer, type ComposerProps } from "@opencoven/ui/blocks/composer";
import { RunRail } from "@opencoven/ui/blocks/run-rail";

const composerProps: ComposerProps = {
  value: "Review the diff",
  onValueChange: () => undefined,
  mode: "do",
  onModeChange: () => undefined,
};

describe("enriched blocks", () => {
  it("gives each composer an independent label and mode description", () => {
    render(
      <>
        <Composer {...composerProps} />
        <Composer {...composerProps} mode="plan" />
      </>,
    );
    const inputs = screen.getAllByRole("textbox", { name: "Message" });
    expect(inputs[0]!.id).not.toBe(inputs[1]!.id);
    expect(inputs[0]).toHaveAccessibleDescription(
      "Make changes with the context you provide.",
    );
    expect(inputs[1]).toHaveAccessibleDescription(
      "Map the approach before making changes.",
    );
  });

  it("only submits a ready draft with the modifier shortcut", () => {
    const onSend = vi.fn();
    const { rerender } = render(
      <Composer {...composerProps} onSend={onSend} />,
    );
    const input = screen.getByRole("textbox");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: "Enter", ctrlKey: true });
    fireEvent.keyDown(input, { key: "Enter", metaKey: true });
    expect(onSend).toHaveBeenCalledTimes(2);
    fireEvent.keyDown(input, {
      key: "Enter",
      metaKey: true,
      isComposing: true,
    });
    rerender(<Composer {...composerProps} onSend={onSend} running />);
    fireEvent.keyDown(input, { key: "Enter", metaKey: true });
    rerender(<Composer {...composerProps} onSend={onSend} value="  " />);
    fireEvent.keyDown(input, { key: "Enter", ctrlKey: true });
    expect(onSend).toHaveBeenCalledTimes(2);
  });

  it("renders functional supporting tools without another primary action", async () => {
    const user = userEvent.setup();
    const onAttach = vi.fn();
    render(
      <Composer
        {...composerProps}
        tools={<button onClick={onAttach}>Attach context</button>}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Attach context" }));
    expect(onAttach).toHaveBeenCalledOnce();
  });

  it("adds plan and resource sections only when provided", async () => {
    const props = {
      metrics: [{ value: 2, label: "Files" }],
      activity: [{ tool: "read" as const, target: "composer.tsx" }],
      context: { used: 100, total: 1000 },
      budget: { used: 1, limit: 5 },
    };
    const { container, rerender } = render(<RunRail {...props} />);
    expect(screen.queryByText("Plan")).not.toBeInTheDocument();
    expect(screen.queryByText("Changed files")).not.toBeInTheDocument();
    expect(screen.getByText("Idle")).toBeVisible();
    rerender(
      <RunRail
        {...props}
        activity={[{ tool: "exec", target: "pnpm test", running: true }]}
        plan={[
          { title: "Inspect files", status: "complete" },
          { title: "Test changes", status: "active" },
        ]}
        resources={[
          { path: "composer.tsx", operation: "M", additions: 12, deletions: 2 },
        ]}
      />,
    );
    expect(screen.getByText("1 / 2")).toBeVisible();
    expect(screen.getByText("Running")).toBeVisible();
    expect(screen.getByText("Changed files")).toBeVisible();
    expect(screen.getByText("composer.tsx")).toBeVisible();
    expect((await axe(container)).violations).toHaveLength(0);
  });
});
