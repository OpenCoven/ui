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
    expect(screen.getByText("No matching specimens")).toBeVisible();
    expect(within(navigation).getAllByRole("link")).toHaveLength(1);
    expect(screen.getAllByRole("option")).toHaveLength(1);
  });

  it("navigates from the mobile picker and follows hash history without remounting previews", async () => {
    const { container } = render(<App />);
    const mode = within(
      container.querySelector("#mode-switch")! as HTMLElement,
    );
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
