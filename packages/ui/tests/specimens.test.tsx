import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";

import { ComposerDemo } from "../../../apps/specimens/src/block-demos";
import {
  CodeSnippet,
  HighlightedCode,
} from "../../../apps/specimens/src/code-snippet";
import { Lab } from "../../../apps/specimens/src/lab";
import { ComponentPreview } from "../../../apps/specimens/src/component-preview";

describe("specimen source and scenes", () => {
  beforeEach(() => window.history.replaceState(null, "", "/lab"));
  afterEach(() => window.history.replaceState(null, "", "/"));

  it("opens a linked Lab scene and exposes its library return path", () => {
    window.history.replaceState(
      { from: "library" },
      "",
      "/lab?view=demo#run-rail",
    );
    render(<Lab density="compact" />);
    expect(screen.getByRole("tab", { name: "Run rail" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByRole("link", { name: "View in library" }),
    ).toHaveAttribute("href", "/#run-rail");
    expect(window.location.search).toBe("?view=demo");
    expect(window.history.state).toEqual({ from: "library" });
  });

  it("keeps scene URLs current without adding history entries", async () => {
    const user = userEvent.setup();
    render(<Lab density="compact" />);
    const length = window.history.length;
    expect(window.location.hash).toBe("#composer");
    await user.click(screen.getByRole("button", { name: "Next scene" }));
    expect(window.location.hash).toBe("#run-rail");
    await user.click(screen.getByRole("tab", { name: "Context" }));
    expect(window.location.hash).toBe("#context");
    expect(window.history.length).toBe(length);
  });

  it("follows scene hash history without replacing a Composer draft", () => {
    render(<Lab density="compact" />);
    const draft = screen.getByRole("textbox", { name: "Message" });
    fireEvent.change(draft, { target: { value: "Keep this local draft" } });
    act(() => {
      window.history.replaceState(null, "", "/lab#run-rail");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(screen.getByRole("tab", { name: "Run rail" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    act(() => {
      window.history.replaceState(null, "", "/lab#composer");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(screen.getByRole("textbox", { name: "Message" })).toBe(draft);
    expect(draft).toHaveValue("Keep this local draft");
  });

  it("canonicalizes unknown scene links to Composer", () => {
    window.history.replaceState(null, "", "/lab#unknown");
    render(<Lab density="compact" />);
    expect(window.location.hash).toBe("#composer");
    act(() => {
      window.history.replaceState(null, "", "/lab#still-unknown");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(window.location.hash).toBe("#composer");
    expect(screen.getByRole("tab", { name: "Composer" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("covers rather than unmounts the preview and returns focus on Escape", async () => {
    const user = userEvent.setup();
    render(
      <ComponentPreview
        source={"const ready = true;"}
        filename="demo.tsx"
        title="Demo"
      >
        <input aria-label="Draft" defaultValue="Keep me" />
      </ComponentPreview>,
    );
    const draft = screen.getByRole("textbox", { name: "Draft" });
    await user.type(draft, " here");
    const toggle = screen.getByRole("tab", { name: "Source" });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "Source" })).toHaveTextContent(
      "const ready = true;",
    );
    expect(draft).toBeInTheDocument();
    expect(draft.closest(".specimen-live-panel")).toHaveAttribute("inert");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    act(() => screen.getByLabelText("demo.tsx").focus());
    await user.keyboard("{Escape}");
    expect(
      screen.queryByRole("tabpanel", { name: "Source" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("Keep me here");
    expect(screen.getByRole("tab", { name: "Preview" })).toHaveFocus();
    expect(toggle).toHaveAttribute("aria-selected", "false");
  });

  it("uses text-only line tabs ahead of the preview canvas", () => {
    const { container } = render(
      <ComponentPreview
        source="const ready = true;"
        filename="demo.tsx"
        title="Demo"
      >
        <button>Try demo</button>
      </ComponentPreview>,
    );
    const tabs = screen.getByRole("tablist", { name: "Demo view" });
    expect(tabs).toHaveAttribute("data-variant", "line");
    expect(tabs.querySelector("svg")).toBeNull();
    expect(tabs.nextElementSibling).toBe(
      container.querySelector(".specimen-preview__canvas"),
    );
  });

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

  it("keeps copy focus during clipboard work so Escape can restore Preview", async () => {
    const user = userEvent.setup();
    let finishCopy!: () => void;
    const copy = vi.spyOn(navigator.clipboard, "writeText").mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishCopy = resolve;
        }),
    );
    render(
      <ComponentPreview
        source="const ready = true;"
        filename="demo.tsx"
        title="Demo"
      >
        <input aria-label="Draft" />
      </ComponentPreview>,
    );
    await user.click(screen.getByRole("tab", { name: "Source" }));
    const button = screen.getByRole("button", { name: "Copy demo.tsx" });
    await user.click(button);
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).not.toHaveAttribute("disabled");
    await act(async () => finishCopy());
    expect(button).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.getByRole("tab", { name: "Preview" })).toHaveFocus();
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
    act(() => screen.getByRole("tab", { name: "Composer" }).focus());
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Run rail" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getAllByRole("tabpanel")).toHaveLength(1);
    await act(async () => {
      expect((await axe(container)).violations).toEqual([]);
    });
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
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(screen.getByRole("status")).toHaveTextContent("Demo run started.");
    await user.click(screen.getByRole("button", { name: /stop/i }));
    expect(screen.getByRole("status")).toHaveTextContent("Demo run stopped.");
    await user.click(
      screen.getByRole("button", { name: "Reset composer demo" }),
    );
    expect(screen.getByRole("textbox")).toHaveValue("");
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  });

  it("applies slash commands and keeps local action results when revisiting scenes", async () => {
    const user = userEvent.setup();
    render(<Lab density="default" />);
    await user.click(screen.getByRole("button", { name: "Commands" }));
    await user.keyboard("{ArrowDown}");
    await user.click(await screen.findByRole("menuitem", { name: /\/plan/ }));
    expect(screen.getByRole("textbox")).toHaveValue(
      "Plan a focused implementation",
    );
    expect(screen.getByRole("button", { name: "plan" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.click(screen.getByRole("tab", { name: "Actions" }));
    await user.click(screen.getByRole("button", { name: /Attach context/ }));
    await user.click(
      screen.getByRole("button", { name: /Clarify the prompt/ }),
    );
    expect(screen.getByText("changes.diff · 8.1 KB")).toBeVisible();
    await user.click(screen.getByRole("tab", { name: "Cards" }));
    const summary = screen.getByText("A smaller composer").closest("summary")!;
    await user.click(summary);
    expect(summary.parentElement).toHaveAttribute("open");
    await user.click(screen.getByRole("tab", { name: "Actions" }));
    expect(screen.getByText("changes.diff · 8.1 KB")).toBeVisible();
    expect(
      screen.getByText(/Review the changed files for behavior regressions/),
    ).toBeVisible();
  });
});
