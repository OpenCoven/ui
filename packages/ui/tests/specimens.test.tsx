import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";

import { ComposerDemo } from "../../../apps/specimens/src/block-demos";
import {
  CodeSnippet,
  HighlightedCode,
} from "../../../apps/specimens/src/code-snippet";
import { Lab } from "../../../apps/specimens/src/lab";

describe("specimen source and scenes", () => {
  it("highlights TypeScript, JSX and shell source without interpreting HTML", () => {
    const source =
      'const label = "<img src=x onerror=alert(1)>";\n<Composer running={true} />';
    const { container } = render(<HighlightedCode code={source} />);
    expect(container.textContent).toBe(source);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector(".hljs-keyword")).toHaveTextContent("const");
    expect(container.querySelector(".hljs-string")).toHaveTextContent("<img");
    expect(container.querySelector(".hljs-name")).toHaveTextContent("Composer");
  });

  it("copies exactly the source, announces success, and exposes failure", async () => {
    const user = userEvent.setup();
    const copy = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    const code =
      'pnpm dlx shadcn@latest add "https://ui.opencoven.ai/r/composer.json"';
    render(
      <CodeSnippet code={code} language="bash" label="Install composer" />,
    );
    await user.click(
      screen.getByRole("button", { name: "Copy Install composer" }),
    );
    expect(copy).toHaveBeenCalledWith(code);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Copied to clipboard.",
    );
    copy.mockRejectedValueOnce(new Error("Permission denied"));
    await user.click(
      screen.getByRole("button", { name: "Copy Install composer" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent("Could not copy.");
    expect(screen.getByLabelText("Install composer")).toHaveTextContent(code);
    copy.mockRestore();
  });

  it("supports carousel wraparound, keyboard tabs, and persistent drafts", async () => {
    const user = userEvent.setup();
    const { container } = render(<Lab density="compact" />);
    const carousel = screen.getByRole("region", { name: "Component scenes" });
    const input = within(carousel).getByRole("textbox", { name: "Message" });
    fireEvent.change(input, { target: { value: "Keep this draft" } });
    await user.click(screen.getByRole("button", { name: "Previous scene" }));
    expect(screen.getByRole("tab", { name: "Cards" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await user.click(screen.getByRole("button", { name: "Next scene" }));
    expect(screen.getByRole("textbox")).toHaveValue("Keep this draft");
    screen.getByRole("tab", { name: "Composer" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Run rail" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getAllByRole("tabpanel")).toHaveLength(1);
    expect((await axe(container)).violations).toHaveLength(0);
  });

  it("keeps demo send, stop, attachment and reset controls functional", async () => {
    const user = userEvent.setup();
    render(<ComposerDemo density="default" />);
    await user.click(screen.getByRole("button", { name: "Attach sample" }));
    expect(screen.getByText("changes.diff")).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: /remove changes.diff/i }),
    );
    expect(screen.queryByText("changes.diff")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /send/i }));
    expect(screen.getByRole("status")).toHaveTextContent("Demo run started.");
    await user.click(screen.getByRole("button", { name: /stop/i }));
    expect(screen.getByRole("status")).toHaveTextContent("Demo run stopped.");
    await user.click(
      screen.getByRole("button", { name: "Reset composer demo" }),
    );
    expect(screen.getByRole("textbox")).toHaveValue("");
    expect(screen.getByRole("button", { name: /send/i })).toBeDisabled();
  });
});
