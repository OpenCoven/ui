import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

import { App } from "../../../apps/specimens/src/app";

describe("catalog navigation", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
    localStorage.clear();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        disconnect() {}
        unobserve() {}
      },
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    window.history.replaceState(null, "", "/");
  });

  it("defaults to dark and retains an explicitly chosen light scheme", () => {
    const { unmount } = render(<App />);
    expect(document.documentElement).toHaveClass("dark");
    fireEvent.click(screen.getByRole("button", { name: "Use light scheme" }));
    expect(document.documentElement).not.toHaveClass("dark");
    expect(localStorage.getItem("coven-ui:scheme")).toBe("light");
    unmount();
    render(<App />);
    expect(document.documentElement).not.toHaveClass("dark");
    expect(
      screen.getByRole("button", { name: "Use dark scheme" }),
    ).toBeVisible();
  });

  it("keeps the catalog header free of decorative stats and framework badges", () => {
    const { container } = render(<App />);
    expect(container.querySelector(".specimen-hero dl")).toBeNull();
    expect(
      container.querySelector(".specimen-card__meta [data-slot=badge]"),
    ).toBeNull();
    expect(container.querySelectorAll(".specimen-card")).toHaveLength(16);
  });

  it("keeps documentation headings free of repeated decorative labels", () => {
    const { container } = render(<App />);
    expect(screen.queryByText("Reference lab")).toBeNull();
    expect(screen.queryByText("Input layer")).toBeNull();
    expect(screen.queryByText("Evidence layer")).toBeNull();
    expect(screen.queryByText("Complete surfaces")).toBeNull();
    expect(container.querySelector(".catalog-group__count")).toBeNull();
    expect(container.querySelector(".specimen-rail__nav small")).toBeNull();
    expect(container.querySelectorAll(".catalog-group h2")).toHaveLength(3);
  });

  it.each([
    ["/", "Component library"],
    ["/lab", "Component lab"],
  ])("uses a task-focused page title on %s", (path, title) => {
    window.history.replaceState(null, "", path);
    render(<App />);
    expect(
      screen.getByRole("heading", { level: 1, name: title }),
    ).toBeVisible();
  });

  it("names the installation and import actions accurately", () => {
    render(<App />);
    const specimen = within(
      screen.getByRole("article", { name: "Mode switch" }),
    );
    expect(specimen.getByRole("tab", { name: "Install" })).toBeVisible();
    fireEvent.click(specimen.getByRole("tab", { name: "Import" }));
    expect(specimen.getByLabelText("Import Mode switch")).toHaveTextContent(
      'import { ModeSwitch } from "@opencoven/ui/components/mode-switch";',
    );
    expect(specimen.queryByRole("tab", { name: "React API" })).toBeNull();
  });

  it("keeps search clearing beside the query and restores input focus", () => {
    render(<App />);
    const input = screen.getByRole("searchbox", { name: "Search components" });
    fireEvent.change(input, { target: { value: "metric" } });
    const search = within(
      screen.getByRole("search", { name: "Component search" }),
    );
    fireEvent.click(search.getByRole("button", { name: "Clear search" }));
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    expect(document.querySelectorAll(".specimen-card")).toHaveLength(16);
    expect(search.queryByRole("button", { name: "Clear search" })).toBeNull();
  });

  it("places search between navigation and an accessible icon-only theme action", () => {
    render(<App />);
    const search = screen.getByRole("search", { name: "Component search" });
    expect(search.previousElementSibling).toHaveClass(
      "specimen-topbar__leading",
    );
    expect(search.nextElementSibling).toHaveClass("specimen-topbar__actions");
    const theme = screen.getByRole("button", { name: "Use light scheme" });
    expect(theme.textContent).toBe("");
    expect(theme).toHaveAttribute("title", "Use light scheme");
    fireEvent.click(theme);
    expect(
      screen.getByRole("button", { name: "Use dark scheme" }),
    ).toBeVisible();
  });

  it("links each assembled example to its matching Lab scene", () => {
    render(<App />);
    for (const [name, scene] of [
      ["Composer block", "composer"],
      ["Run rail block", "run-rail"],
      ["Transcript turn", "messages"],
      ["Resource row", "context"],
      ["Completion palette", "actions"],
      ["Session header", "cards"],
    ]) {
      const specimen = within(screen.getByRole("article", { name }));
      expect(
        specimen.getByRole("link", { name: "Open in Lab" }),
      ).toHaveAttribute("href", `/lab#${scene}`);
    }
    expect(screen.getAllByRole("link", { name: "Open in Lab" })).toHaveLength(
      6,
    );
  });

  it("keeps the linked Lab scene when skipping to its main content", () => {
    window.history.replaceState(null, "", "/lab#run-rail");
    render(<App />);
    fireEvent.click(screen.getByRole("link", { name: "Skip to specimens" }));
    expect(screen.getByRole("main")).toHaveFocus();
    expect(window.location.hash).toBe("#run-rail");
    expect(screen.getByRole("tab", { name: "Run rail" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it.each([
    ["/", "default"],
    ["/", "compact"],
    ["/lab", "default"],
    ["/lab", "compact"],
  ])(
    "uses only compact sizing on %s with a saved %s preference",
    (path, savedDensity) => {
      window.history.replaceState(null, "", path);
      localStorage.setItem("coven-ui:density", savedDensity);
      render(<App />);
      expect(document.documentElement).toHaveAttribute(
        "data-density",
        "compact",
      );
      expect(
        screen.queryByRole("group", { name: "Display density" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /^(Cozy|Compact)$/ }),
      ).not.toBeInTheDocument();
      expect(screen.queryByText("Densities")).not.toBeInTheDocument();
      expect(localStorage.getItem("coven-ui:density")).toBeNull();
    },
  );

  it("lists every rendered component and block once, in the same groups", () => {
    const { container } = render(<App />);
    const navigation = screen.getByRole("navigation", {
      name: "Component navigation",
    });
    const cards = [...container.querySelectorAll(".specimen-card")];
    expect(cards).toHaveLength(16);
    expect(within(navigation).getAllByRole("link")).toHaveLength(17);
    for (const card of cards) {
      const title = card.querySelector("h3")!.textContent!;
      expect(
        within(navigation).getByRole("link", { name: title }),
      ).toHaveAttribute("href", `#${card.id}`);
    }
    for (const [name, count] of [
      ["Composer", 4],
      ["Run rail", 8],
      ["Blocks", 4],
    ] as const) {
      expect(
        within(within(navigation).getByRole("list", { name })).getAllByRole(
          "link",
        ),
      ).toHaveLength(count);
    }
    expect(
      screen.getByRole("combobox", { name: "Jump to component" }),
    ).toHaveValue("library-overview");
    expect(screen.getAllByRole("option")).toHaveLength(17);
  });

  it("keeps sidebar, mobile choices and context links aligned with search results", () => {
    const { container } = render(<App />);
    fireEvent.change(screen.getByPlaceholderText("Search components…"), {
      target: { value: "Completion palette" },
    });
    expect(container.querySelectorAll(".specimen-card")).toHaveLength(1);
    const navigation = screen.getByRole("navigation", {
      name: "Component navigation",
    });
    expect(within(navigation).getAllByRole("link")).toHaveLength(2);
    expect(screen.getAllByRole("option")).toHaveLength(2);
    for (const link of container.querySelectorAll(
      '.specimen-rail a[href^="#"], .specimen-toc a[href^="#"]',
    )) {
      expect(
        document.getElementById(link.getAttribute("href")!.slice(1)),
      ).not.toBeNull();
    }
    fireEvent.change(screen.getByPlaceholderText("Search components…"), {
      target: { value: "no-such-specimen" },
    });
    expect(screen.getByText("No matches found")).toBeVisible();
    expect(within(navigation).getAllByRole("link")).toHaveLength(1);
    expect(screen.getAllByRole("option")).toHaveLength(1);
  });

  it("announces search results and restores the inventory and focus when cleared", () => {
    const { container } = render(<App />);
    const search = screen.getByPlaceholderText("Search components…");
    const status = screen.getByRole("status", { name: "Search results" });
    expect(status).toHaveTextContent("All 16 components");
    fireEvent.change(search, { target: { value: "Completion palette" } });
    expect(status).toHaveTextContent("1 result");
    fireEvent.change(search, { target: { value: "no-such-component" } });
    expect(status).toHaveTextContent("0 results");
    expect(screen.getByText("No matches found")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(search).toHaveValue("");
    expect(search).toHaveFocus();
    expect(container.querySelectorAll(".specimen-card")).toHaveLength(16);
    expect(status).toHaveTextContent("All 16 components");
    expect(
      screen.queryByRole("button", { name: "Clear search" }),
    ).not.toBeInTheDocument();
  });

  it("clears search with Escape while retaining keyboard focus", () => {
    render(<App />);
    const search = screen.getByPlaceholderText("Search components…");
    act(() => search.focus());
    fireEvent.change(search, { target: { value: "Context meter" } });
    fireEvent.keyDown(search, { key: "Escape" });
    expect(search).toHaveValue("");
    expect(search).toHaveFocus();
    expect(
      screen.getByRole("status", { name: "Search results" }),
    ).toHaveTextContent("All 16 components");
  });

  it("does not clear an in-progress text composition with Escape", () => {
    render(<App />);
    const search = screen.getByPlaceholderText("Search components…");
    fireEvent.change(search, { target: { value: "Context" } });
    fireEvent.keyDown(search, { key: "Escape", isComposing: true });
    expect(search).toHaveValue("Context");
  });

  it("provides a permalink from every component heading without changing its name", () => {
    const { container } = render(<App />);
    const articles = [
      ...container.querySelectorAll<HTMLElement>(".specimen-card"),
    ];
    expect(articles).toHaveLength(16);
    for (const article of articles) {
      const heading = within(article).getByRole("heading", { level: 3 });
      expect(
        within(heading).getByRole("link", { name: heading.textContent! }),
      ).toHaveAttribute("href", `#${article.id}`);
    }
    expect(screen.getByRole("article", { name: "Mode switch" })).toBeVisible();
  });

  it("clears a stale catalog fragment when filtering removes its target", () => {
    window.history.replaceState({ retained: true }, "", "/?navigation=keep");
    render(<App />);
    act(() => {
      window.history.replaceState(window.history.state, "", "#mode-switch");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    fireEvent.change(screen.getByPlaceholderText("Search components…"), {
      target: { value: "Context meter" },
    });
    expect(window.location.hash).toBe("");
    expect(window.location.search).toBe("?navigation=keep");
    expect(window.history.state).toEqual({ retained: true });
    fireEvent.change(screen.getByPlaceholderText("Search components…"), {
      target: { value: "" },
    });
    expect(window.location.hash).toBe("");
    expect(
      screen.getByRole("combobox", { name: "Jump to component" }),
    ).toHaveValue("library-overview");
  });

  it("navigates from the mobile picker and follows hash history without remounting previews", async () => {
    render(<App />);
    const mode = within(screen.getByRole("article", { name: "Mode switch" }));
    const composer = screen.getByRole("article", { name: "Composer block" });
    const draft = within(composer).getByRole("textbox", { name: "Message" });
    fireEvent.change(draft, { target: { value: "Keep this preview draft" } });
    fireEvent.click(within(composer).getByRole("tab", { name: "Source" }));
    fireEvent.click(mode.getByRole("button", { name: "chat" }));
    fireEvent.change(
      screen.getByRole("combobox", { name: "Jump to component" }),
      {
        target: { value: "send-control" },
      },
    );
    expect(window.location.hash).toBe("#send-control");
    const navigation = screen.getByRole("navigation", {
      name: "Component navigation",
    });
    await waitFor(() =>
      expect(
        within(navigation).getByRole("link", { name: "Send control" }),
      ).toHaveAttribute("aria-current", "location"),
    );
    act(() => {
      window.history.replaceState(null, "", "#mode-switch");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(
      screen.getByRole("combobox", { name: "Jump to component" }),
    ).toHaveValue("mode-switch");
    expect(mode.getByRole("button", { name: "chat" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("article", { name: "Composer block" })).toBe(
      composer,
    );
    expect(
      within(composer).getByRole("tab", { name: "Source" }),
    ).toHaveAttribute("aria-selected", "true");
    fireEvent.click(within(composer).getByRole("tab", { name: "Preview" }));
    expect(within(composer).getByRole("textbox", { name: "Message" })).toBe(
      draft,
    );
    expect(draft).toHaveValue("Keep this preview draft");
  });

  it("keeps the selected link in step with manual page scrolling", async () => {
    let scrollOffset = 0;
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function (this: HTMLElement) {
        const top =
          ({
            "library-overview": 100,
            "mode-switch": 500,
            "send-control": 1000,
          }[this.id] ?? 1500) - scrollOffset;
        return new DOMRect(0, top, 832, 200);
      },
    );
    render(<App />);
    scrollOffset = 1000;
    fireEvent.scroll(window);
    await waitFor(() =>
      expect(
        within(
          screen.getByRole("navigation", { name: "Component navigation" }),
        ).getByRole("link", { name: "Send control" }),
      ).toHaveAttribute("aria-current", "location"),
    );
    expect(window.location.hash).toBe("");
  });

  it("resolves an initial fragment after the client-rendered catalog mounts", async () => {
    window.history.replaceState(null, "", "#session-header");
    render(<App />);
    const target = screen.getByRole("article", { name: "Session header" });
    target.scrollIntoView = vi.fn();
    await waitFor(() =>
      expect(target.scrollIntoView).toHaveBeenCalledWith({ block: "start" }),
    );
    expect(target).toHaveFocus();
  });

  it("selects the last component at the page end even when it cannot reach the top", async () => {
    vi.stubGlobal("innerHeight", 1000);
    vi.stubGlobal("scrollY", 2000);
    vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(
      3000,
    );
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(
      new DOMRect(0, 250, 832, 635),
    );
    render(<App />);
    fireEvent.scroll(window);
    await waitFor(() =>
      expect(
        within(
          screen.getByRole("navigation", { name: "Component navigation" }),
        ).getByRole("link", { name: "Session header" }),
      ).toHaveAttribute("aria-current", "location"),
    );
  });
});
