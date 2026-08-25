import { readFile } from "node:fs/promises";
import path from "node:path";

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";

import { Composer } from "@opencoven/ui/blocks/composer";
import { AttachmentChip } from "@opencoven/ui/components/attachment-chip";
import { ModeSwitch } from "@opencoven/ui/components/mode-switch";
import { ToolClassBadge } from "@opencoven/ui/components/tool-class-badge";
import { Button } from "@opencoven/ui/components/ui/button";

describe("OpenCoven UI", () => {
  it("renders a Base UI button and handles pointer activation", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Run check</Button>);
    await user.click(screen.getByRole("button", { name: "Run check" }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("exposes typed mode state with a non-color pressed cue", () => {
    const onValueChange = vi.fn();
    render(<ModeSwitch value="chat" onValueChange={onValueChange} />);

    const chat = screen.getByRole("button", { name: "chat" });
    const plan = screen.getByRole("button", { name: "plan" });
    expect(chat).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(plan);
    expect(onValueChange).toHaveBeenCalledWith("plan");
  });

  it("labels attachment progress and failure without color-only state", () => {
    const { rerender } = render(
      <AttachmentChip name="preview.png" state="uploading" progress={62} />,
    );

    expect(
      screen.getByRole("progressbar", { name: "Uploading preview.png" }),
    ).toHaveAttribute("aria-valuenow", "62");

    rerender(
      <AttachmentChip name="preview.png" state="failed" meta="too large" />,
    );
    expect(screen.getByText("too large")).toBeVisible();
  });

  it("keeps tool-class mappings canonical", () => {
    const { container } = render(
      <>
        <ToolClassBadge tool="read" />
        <ToolClassBadge tool="write" />
        <ToolClassBadge tool="exec" />
        <ToolClassBadge tool="net" />
      </>,
    );

    expect(container.querySelector('[data-tool="read"]')).toHaveClass(
      "text-tool-read",
    );
    expect(container.querySelector('[data-tool="write"]')).toHaveClass(
      "text-tool-write",
    );
    expect(container.querySelector('[data-tool="exec"]')).toHaveClass(
      "text-tool-exec",
    );
    expect(container.querySelector('[data-tool="net"]')).toHaveClass(
      "text-tool-net",
    );
  });

  it("keeps the composer to one filled action control", () => {
    const { container } = render(
      <Composer
        value="Review the changed files"
        onValueChange={() => undefined}
        mode="do"
        onModeChange={() => undefined}
      />,
    );

    expect(
      container.querySelectorAll('[data-slot="send-control"]'),
    ).toHaveLength(1);
    expect(
      container.querySelectorAll(
        '[data-variant="primary"]:not([data-slot="send-control"] *)',
      ),
    ).toHaveLength(0);
  });

  it("has no automated accessibility violations in the composer", async () => {
    const { container } = render(
      <Composer
        value="Review the changed files"
        onValueChange={() => undefined}
        mode="do"
        onModeChange={() => undefined}
        attachments={[{ id: "1", name: "spec.md", meta: "4.2 KB" }]}
      />,
    );

    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it("defines both densities, both schemes, exact radii, and reduced motion", async () => {
    const cssPath = path.resolve(process.cwd(), "src/styles/globals.css");
    const css = await readFile(cssPath, "utf8");

    expect(css).toContain('[data-density="compact"]');
    expect(css).toContain(".dark");
    expect(css).toContain("--radius-1: 4px");
    expect(css).toContain("--radius-2: 8px");
    expect(css).toContain("--radius-3: 12px");
    expect(css).toContain("--radius-4: 16px");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
  });
});
