import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";

import { App } from "../../../apps/specimens/src/app";

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
      unobserve() {}
    },
  );
});

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  localStorage.clear();
});

afterAll(() => vi.unstubAllGlobals());

describe("OpenCoven library site", () => {
  it("provides the showcase home and real component destinations", () => {
    render(<App />);
    const main = screen.getByRole("main");
    expect(within(main).getByRole("heading", { level: 1 })).toHaveTextContent(
      "Thoughtful UI components",
    );
    expect(
      within(main).getByRole("link", { name: "Get started" }),
    ).toHaveAttribute("href", "/docs/introduction");
    expect(
      within(main).getByRole("link", { name: "Components" }),
    ).toHaveAttribute("href", "/docs/components");
    expect(main.querySelectorAll(".showcase-tile")).toHaveLength(7);
    expect(
      within(main).getByRole("link", { name: "Composer" }),
    ).toHaveAttribute("href", "/docs/composer");
  });

  it("retains all sixteen specimens in the component catalog", () => {
    window.history.replaceState(null, "", "/docs/components");
    render(<App />);
    expect(
      screen.getByRole("main").querySelectorAll(".specimen-card"),
    ).toHaveLength(16);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Components",
    );
  });

  it("separates direct-page preview, registry install, and React imports", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/docs/session-header/");
    render(<App />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Session header",
    );
    await user.click(screen.getByRole("tab", { name: "Install" }));
    const install = screen.getByRole("tabpanel", { name: "Install" });
    expect(install).toHaveTextContent(
      "pnpm dlx shadcn@latest add https://ui.opencoven.ai/r/session-header.json",
    );
    expect(install).not.toHaveTextContent("import {");
    await user.click(screen.getByRole("tab", { name: "React API" }));
    expect(
      screen.getByRole("tabpanel", { name: "React API" }),
    ).toHaveTextContent(
      'import { SessionHeader } from "@opencoven/ui/blocks/session-header";',
    );
  });

  it("copies the exact registry command and package import from a component page", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/docs/mode-switch");
    render(<App />);
    const write = vi.spyOn(navigator.clipboard, "writeText");
    await user.click(screen.getByRole("tab", { name: "Install" }));
    await user.click(
      screen.getByRole("button", { name: "Copy Mode switch install command" }),
    );
    expect(write).toHaveBeenLastCalledWith(
      "pnpm dlx shadcn@latest add https://ui.opencoven.ai/r/mode-switch.json",
    );
    await user.click(screen.getByRole("tab", { name: "React API" }));
    await user.click(
      screen.getByRole("button", { name: "Copy Mode switch React import" }),
    );
    expect(write).toHaveBeenLastCalledWith(
      'import { ModeSwitch } from "@opencoven/ui/components/mode-switch";',
    );
    write.mockRestore();
  });

  it("opens keyboard search on docs, matches states, and restores focus on Escape", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/docs/introduction");
    render(<App />);
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    const search = screen.getByRole("searchbox", {
      name: "Search documentation",
    });
    expect(search).toHaveFocus();
    await user.type(search, "uploading");
    const results = screen.getByRole("navigation", { name: "Search results" });
    expect(within(results).getAllByRole("link")).toHaveLength(1);
    const result = within(results).getByRole("link", {
      name: /Attachment chip/,
    });
    expect(result).toHaveAttribute("href", "/docs/attachment-chip");
    await user.keyboard("{ArrowDown}");
    expect(result).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(search).toHaveFocus();
    expect(
      screen.queryByRole("navigation", { name: "Search results" }),
    ).not.toBeInTheDocument();
  });

  it("reports empty search results without fabricating a destination", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole("searchbox"), "no-such-component");
    expect(screen.getByRole("status")).toHaveTextContent("0 results");
    expect(
      screen.queryByRole("navigation", { name: "Search results" }),
    ).not.toBeInTheDocument();
  });

  it("prevents native search-field Escape from clearing and reopening results", async () => {
    const user = userEvent.setup();
    render(<App />);
    const search = screen.getByRole("searchbox");
    await user.type(search, "budget");
    const escape = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    fireEvent(search, escape);
    expect(escape.defaultPrevented).toBe(true);
    expect(search).toHaveValue("budget");
    expect(
      screen.queryByRole("navigation", { name: "Search results" }),
    ).not.toBeInTheDocument();
  });

  it("moves through search results with arrow keys, Home, and End", async () => {
    const user = userEvent.setup();
    render(<App />);
    const search = screen.getByRole("searchbox");
    await user.click(search);
    const links = within(
      screen.getByRole("navigation", { name: "Search results" }),
    ).getAllByRole("link");
    await user.keyboard("{ArrowDown}");
    expect(links[0]).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(links[1]).toHaveFocus();
    await user.keyboard("{End}");
    expect(links.at(-1)).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(links.at(-1)).toHaveFocus();
    await user.keyboard("{Home}{ArrowUp}");
    expect(search).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(
      screen.queryByRole("navigation", { name: "Search results" }),
    ).not.toBeInTheDocument();
  });

  it("keeps catalog section links consistent with filtered components", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/docs/components");
    render(<App />);
    await user.type(screen.getByRole("searchbox"), "uploading");
    const toc = screen.getByRole("navigation", { name: "On this page" });
    const anchors = within(toc)
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href")?.startsWith("#"));
    expect(anchors).toHaveLength(1);
    for (const anchor of anchors) {
      expect(
        document.querySelector(anchor.getAttribute("href")!),
      ).toBeInTheDocument();
    }
  });

  it("retains all five assembled lab views", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/lab");
    render(<App />);
    for (const name of [
      "composer",
      "messages",
      "context",
      "actions",
      "cards",
    ]) {
      await user.click(screen.getByRole("tab", { name }));
      expect(screen.getByRole("tabpanel", { name })).toBeVisible();
    }
  });

  it("persists scheme and density and exposes the mobile navigation state", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/docs/composer");
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Use light scheme" }));
    await user.click(screen.getByRole("button", { name: "Compact" }));
    expect(localStorage.getItem("coven-ui:scheme")).toBe("light");
    expect(localStorage.getItem("coven-ui:density")).toBe("compact");
    expect(document.documentElement).toHaveAttribute("data-density", "compact");
    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(
      screen.getByRole("button", { name: "Close navigation" }),
    ).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Escape}");
    expect(
      screen.getByRole("button", { name: "Open navigation" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("copies setup commands and reports a clipboard failure explicitly", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/docs/installation");
    render(<App />);
    const write = vi.spyOn(navigator.clipboard, "writeText");
    await user.click(
      screen.getByRole("button", { name: "Copy Registry install" }),
    );
    expect(write).toHaveBeenCalledWith(
      "pnpm dlx shadcn@latest add @opencoven/composer",
    );
    write.mockRejectedValueOnce(
      new DOMException("Clipboard access denied", "NotAllowedError"),
    );
    await user.click(
      screen.getByRole("button", { name: "Copy Package install" }),
    );
    expect(
      screen.getByText("Could not copy. Select and copy the code manually."),
    ).toBeVisible();
    write.mockRestore();
  });

  it("keeps unknown routes distinct from the library home", () => {
    window.history.replaceState(null, "", "/docs/not-a-component");
    render(<App />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Page not found",
    );
    expect(
      within(screen.getByRole("main")).getByRole("link", {
        name: "Browse components",
      }),
    ).toHaveAttribute("href", "/docs/components");
  });

  it("has no automated accessibility violations with search open", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/docs/composer");
    const { container } = render(<App />);
    await user.click(screen.getByRole("searchbox"));
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});
