import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const componentIds = [
  "mode-switch",
  "send-control",
  "completion-palette",
  "attachment-chip",
  "metric-display",
  "plan-row",
  "activity-item",
  "resource-row",
  "tool-mix",
  "failure-surface",
  "context-meter",
  "budget-pill",
  "composer",
  "run-rail",
  "transcript-turn",
  "session-header",
];
const featuredIds = [
  "composer",
  "mode-switch",
  "budget-pill",
  "activity-item",
  "run-rail",
  "context-meter",
  "transcript-turn",
];
const navigationPaths = [
  "/docs/introduction",
  "/docs/installation",
  "/docs/components",
  "/lab",
  ...componentIds.map((id) => `/docs/${id}`),
];
const labViews = ["composer", "messages", "context", "actions", "cards"];

class CdpClient {
  constructor(url) {
    this.url = url;
    this.nextId = 0;
    this.pending = new Map();
    this.listeners = new Map();
  }

  async connect() {
    this.socket = new WebSocket(this.url);
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        clearTimeout(pending.timeout);
        this.pending.delete(message.id);
        if (message.error)
          pending.reject(
            new Error(`${pending.method}: ${message.error.message}`),
          );
        else pending.resolve(message.result ?? {});
      } else {
        for (const listener of this.listeners.get(message.method) ?? []) {
          listener(message.params ?? {});
        }
      }
    });
    const rejectPending = () => {
      for (const pending of this.pending.values()) {
        clearTimeout(pending.timeout);
        pending.reject(new Error("Chrome DevTools connection closed"));
      }
      this.pending.clear();
    };
    this.socket.addEventListener("close", rejectPending);
    this.socket.addEventListener("error", rejectPending);
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
  }

  on(method, listener) {
    const listeners = this.listeners.get(method) ?? new Set();
    listeners.add(listener);
    this.listeners.set(method, listeners);
    return () => listeners.delete(listener);
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      if (this.socket?.readyState !== WebSocket.OPEN) {
        reject(new Error("Chrome DevTools connection is not open"));
        return;
      }
      const id = ++this.nextId;
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`${method} timed out`));
      }, 15_000);
      this.pending.set(id, { method, resolve, reject, timeout });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      throw new Error(
        result.exceptionDetails.exception?.description ??
          result.exceptionDetails.text,
      );
    }
    return result.result?.value;
  }

  async waitFor(expression, label = expression) {
    const deadline = Date.now() + 15_000;
    while (Date.now() < deadline) {
      if (await this.evaluate(expression)) return;
      await sleep(80);
    }
    throw new Error(`Timed out waiting for ${label}`);
  }

  async navigate(url) {
    const loaded = new Promise((resolve, reject) => {
      const remove = this.on("Page.loadEventFired", () => {
        clearTimeout(timeout);
        remove();
        resolve();
      });
      const timeout = setTimeout(() => {
        remove();
        reject(new Error(`Navigation timed out: ${url}`));
      }, 15_000);
    });
    const response = await this.send("Page.navigate", { url });
    await loaded;
    if (response.errorText)
      throw new Error(`Navigation failed: ${response.errorText}`);
    await this.waitFor(
      'Boolean(document.querySelector("#specimen-main"))',
      "site main",
    );
  }

  async settle() {
    await this.evaluate(`(async () => {
      await document.fonts.ready;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    })()`);
  }

  async key(key, code, virtualKey, modifiers = 0) {
    for (const type of ["keyDown", "keyUp"]) {
      await this.send("Input.dispatchKeyEvent", {
        type,
        key,
        code,
        windowsVirtualKeyCode: virtualKey,
        modifiers,
      });
    }
    await this.settle();
  }

  async click(selector) {
    const point = await this.evaluate(`(async () => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!element) throw new Error("Missing click target: " + ${JSON.stringify(selector)});
      element.scrollIntoView({block: "center", inline: "center"});
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const r = element.getBoundingClientRect();
      if (!r.width || !r.height) throw new Error("Hidden click target");
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      if (!element.contains(document.elementFromPoint(x, y))) throw new Error("Obscured click target: " + ${JSON.stringify(selector)} + " at " + JSON.stringify({
        x, y, hit: document.elementFromPoint(x, y)?.outerHTML.slice(0, 180),
        parent: {scrollLeft: element.parentElement.scrollLeft, clientWidth: element.parentElement.clientWidth, scrollWidth: element.parentElement.scrollWidth, left: element.parentElement.getBoundingClientRect().left},
        scrollMargin: getComputedStyle(element).scrollMargin, scale: visualViewport.scale,
      }));
      return {x, y};
    })()`);
    for (const type of ["mousePressed", "mouseReleased"]) {
      await this.send("Input.dispatchMouseEvent", {
        type,
        ...point,
        button: "left",
        clickCount: 1,
      });
    }
    await this.settle();
  }

  close() {
    this.socket?.close();
  }
}

// Shared measurements keep mobile/text-resize checks identical across both entry points.
function measurePage() {
  const { document, location } = globalThis;
  const getComputedStyle = (element) => globalThis.getComputedStyle(element);
  const matchMedia = (query) => globalThis.matchMedia(query);
  const root = document.documentElement;
  const visible = (element) => {
    if (!element?.getClientRects().length) return false;
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.visibility !== "hidden" &&
      style.display !== "none"
    );
  };
  const all = (selector) =>
    [...document.querySelectorAll(selector)].filter(visible);
  const overflow = (element) =>
    Math.max(0, element.scrollWidth - element.clientWidth);
  const blockOverflow = (element) =>
    Math.max(0, element.scrollHeight - element.clientHeight);
  const clipsBlockOverflow = (element) =>
    blockOverflow(element) > 1 &&
    ["hidden", "clip"].includes(getComputedStyle(element).overflowY);
  const viewportOverflow = (element) => {
    const r = element.getBoundingClientRect();
    return Math.max(0, -r.left, r.right - root.clientWidth);
  };
  const label = (element) =>
    `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${element.dataset.slot ? `[data-slot="${element.dataset.slot}"]` : ""}.${[...element.classList].slice(0, 2).join(".")}`;
  const header = document.querySelector(".site-header");
  const sidebar = document.querySelector("#site-navigation");
  const controls = all(
    ".site-header .site-brand, .site-links, .site-search, .site-scheme, .site-menu-toggle, .site-github",
  );
  const overlaps = controls.flatMap((a, index) =>
    controls.slice(index + 1).flatMap((b) => {
      const ar = a.getBoundingClientRect(),
        br = b.getBoundingClientRect();
      return ar.left < br.right - 1 &&
        ar.right > br.left + 1 &&
        ar.top < br.bottom - 1 &&
        ar.bottom > br.top + 1
        ? [`${label(a)} / ${label(b)}`]
        : [];
    }),
  );
  const surfaces = all(
    [
      ".site-header__inner",
      ".site-footer__inner",
      ".site-footer__brand",
      ".site-footer__note",
      ".site-footer nav",
      ".home-hero",
      ".home-actions",
      ".home-showcase",
      ".showcase-tile",
      ".showcase-tile__stage",
      ".docs-content",
      ".docs-heading",
      ".docs-prose",
      ".specimen-card",
      ".specimen-stage",
      ".specimen-documentation",
      ".specimen-command",
      ".assembled-lab",
      ".assembled-lab__stage",
      '[data-slot="session-header"]',
      '[data-slot="transcript-turn"]',
      '[data-slot="composer"]',
      '[data-slot="run-rail"]',
      '[data-slot="mode-switch"]',
      '[data-slot="mode-switch"] > button',
      '[data-slot="context-meter"]',
      '[data-slot="context-meter"] > :first-child',
    ].join(", "),
  );
  const clippedSurfaces = surfaces
    .filter(
      (el) =>
        overflow(el) > 1 || clipsBlockOverflow(el) || viewportOverflow(el) > 1,
    )
    .map((el) => ({
      label: label(el),
      overflow: overflow(el),
      blockOverflow: blockOverflow(el),
      viewportOverflow: viewportOverflow(el),
      surface:
        el.closest(".showcase-tile")?.getAttribute("aria-label") ??
        el.closest(".specimen-card")?.id,
    }));
  const clippedText = all(
    "h1, h2, h3, p, strong, small, code, .docs-nav-group a, .showcase-tile__link",
  )
    .filter(
      (el) =>
        ["hidden", "clip"].includes(getComputedStyle(el).overflowX) &&
        overflow(el) > 1,
    )
    .map((el) => ({
      label: label(el),
      surface:
        el
          .closest(".showcase-tile, .specimen-card, .assembled-lab")
          ?.getAttribute("id") ??
        el.closest(".showcase-tile")?.getAttribute("aria-label"),
      text: el.textContent.trim().slice(0, 100),
      overflow: overflow(el),
    }));
  const tabRoots = all('.specimen-card > [data-slot="tabs"]');
  const tabs = tabRoots.map((el) => {
    const list = el.querySelector(':scope > [role="tablist"]');
    const triggers = [...(list?.querySelectorAll('[role="tab"]') ?? [])];
    const panels = [
      ...el.querySelectorAll(':scope > [role="tabpanel"]'),
    ].filter(visible);
    return {
      id: el.closest(".specimen-card").id,
      labels: triggers.map((tab) => tab.textContent.trim()),
      panelCount: panels.length,
      selectedCount: triggers.filter(
        (tab) => tab.getAttribute("aria-selected") === "true",
      ).length,
      linked:
        triggers.every((tab) => tab.id) &&
        panels.every(
          (panel) =>
            panel.getAttribute("aria-labelledby") ===
              triggers.find(
                (tab) => tab.getAttribute("aria-selected") === "true",
              )?.id &&
            panel.id ===
              triggers
                .find((tab) => tab.getAttribute("aria-selected") === "true")
                ?.getAttribute("aria-controls"),
        ),
      minWidth: Math.min(
        ...triggers.map((tab) => tab.getBoundingClientRect().width),
      ),
      minHeight: Math.min(
        ...triggers.map((tab) => tab.getBoundingClientRect().height),
      ),
      contentOverflow: Math.max(0, ...triggers.map(overflow)),
      rootOverflow: overflow(el),
      listOverflow: list ? overflow(list) : null,
      scrollable: list
        ? ["auto", "scroll"].includes(getComputedStyle(list).overflowX)
        : false,
      stacked:
        panels.length === 1 &&
        list &&
        panels[0].getBoundingClientRect().top >=
          list.getBoundingClientRect().bottom - 1,
      fullWidth:
        list &&
        Math.abs(
          list.getBoundingClientRect().width - el.getBoundingClientRect().width,
        ) <= 1,
    };
  });
  const navLinks = all("#site-navigation a");
  const sessionTitles = all('[data-slot="session-header"] strong');
  const durations = all(".home-button, .specimen-card, .site-scheme").flatMap(
    (el) => {
      const style = getComputedStyle(el);
      return [style.transitionDuration, style.animationDuration].flatMap(
        (value) =>
          value
            .split(",")
            .map(
              (duration) =>
                parseFloat(duration) *
                (duration.trim().endsWith("ms") ? 1 : 1000),
            ),
      );
    },
  );
  return {
    pathname: location.pathname,
    heading: document.querySelector("main h1")?.textContent.trim(),
    title: document.title,
    viewportWidth: root.clientWidth,
    horizontalOverflow: Math.max(0, root.scrollWidth - root.clientWidth),
    headerVisible: visible(header),
    headerHeight: header?.getBoundingClientRect().height,
    mainVisible: visible(document.querySelector("main#specimen-main")),
    footerVisible: visible(document.querySelector(".site-footer")),
    sidebarVisible: visible(sidebar),
    menuVisible: visible(document.querySelector(".site-menu-toggle")),
    menuExpanded: document
      .querySelector(".site-menu-toggle")
      ?.getAttribute("aria-expanded"),
    menuOpen: document.querySelector(".site-layout")?.dataset.menuOpen,
    navPaths: navLinks.map((link) => link.getAttribute("href")),
    navOverflow: Math.max(
      0,
      ...navLinks.map(overflow),
      ...navLinks.map(viewportOverflow),
    ),
    currentNav: all('#site-navigation a[aria-current="page"]').map((el) =>
      el.getAttribute("href"),
    ),
    controlsOverflow: Math.max(0, ...controls.map(viewportOverflow)),
    overlaps,
    clippedSurfaces,
    clippedText,
    tabs,
    cards: all(".specimen-card").map((el) => el.id),
    groups: all(".catalog-group").map((el) => el.id),
    featured: all(".showcase-tile").map((el) => ({
      href: el.querySelector(".showcase-tile__link")?.getAttribute("href"),
      label: el.getAttribute("aria-label"),
      preview: visible(el.querySelector(".showcase-tile__stage [data-slot]")),
    })),
    ctas: all(".home-actions a").map((el) => el.getAttribute("href")),
    heroCentered: (() => {
      const hero = document.querySelector(".home-hero");
      return hero
        ? getComputedStyle(hero).textAlign === "center" &&
            Math.abs(
              hero.getBoundingClientRect().left +
                hero.getBoundingClientRect().width / 2 -
                root.clientWidth / 2,
            ) < 2
        : null;
    })(),
    tocLinks: [...document.querySelectorAll('.docs-toc a[href^="#"]')].map(
      (el) => ({
        href: el.getAttribute("href"),
        target: Boolean(document.getElementById(el.hash.slice(1))),
      }),
    ),
    tocVisible: visible(document.querySelector(".docs-toc")),
    labTabs: all('.assembled-lab__tabs [role="tab"]').map((el) =>
      el.textContent.trim(),
    ),
    densityVisible: visible(document.querySelector(".density-control")),
    density: root.dataset.density,
    scheme: root.classList.contains("dark") ? "dark" : "light",
    direction: root.dir,
    fontSize: parseFloat(getComputedStyle(root).fontSize),
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    maxMotionDuration: Math.max(0, ...durations),
    sessionTitleEllipsized: sessionTitles.some(
      (el) =>
        getComputedStyle(el).textOverflow === "ellipsis" && overflow(el) > 1,
    ),
  };
}

function checkLayout(layout, scenario, failures, label = "page") {
  const require = (condition, message) => {
    if (!condition) failures.push(`${label}: ${message}`);
  };
  require(layout.headerVisible &&
    layout.mainVisible &&
    layout.footerVisible, "missing visible header/main/footer");
  require(layout.horizontalOverflow <=
    1, `document overflow ${layout.horizontalOverflow}px`);
  require(layout.controlsOverflow <=
    1, `header controls overflow ${layout.controlsOverflow}px`);
  require(!layout.overlaps
    .length, `overlapping header controls: ${layout.overlaps.join(", ")}`);
  require(!layout.clippedSurfaces
    .length, `clipped surfaces: ${JSON.stringify(layout.clippedSurfaces)}`);
  require(!layout.clippedText
    .length, `clipped text: ${JSON.stringify(layout.clippedText)}`);
  require(!layout.sessionTitleEllipsized, "session title is ellipsized");
  require(layout.reducedMotion &&
    layout.maxMotionDuration <=
      1, `reduced motion not honored (${layout.maxMotionDuration}ms)`);
  require(layout.scheme === scenario.scheme &&
    layout.density === scenario.density, "theme/density preference drift");
  require(layout.direction ===
    (scenario.rtl ? "rtl" : "ltr"), "direction mismatch");
  require(Math.abs(layout.fontSize - 16 * (scenario.textScale ?? 1)) <
    0.1, "text resize was not applied");
  if (scenario.mobile && !scenario.textScale)
    require(layout.headerHeight <=
      200, `mobile header too tall: ${layout.headerHeight}px`);
  for (const tab of layout.tabs) {
    require(JSON.stringify(tab.labels) ===
      JSON.stringify([
        "Preview",
        "Install",
        "React API",
      ]), `${tab.id}: wrong tabs`);
    require(tab.panelCount === 1 &&
      tab.selectedCount === 1 &&
      tab.linked, `${tab.id}: tab/panel selection or ARIA linkage broken`);
    require(tab.rootOverflow <= 1 &&
      tab.contentOverflow <= 1, `${tab.id}: tab content clipped`);
    if (scenario.mobile) {
      require(tab.minHeight >= 44 &&
        tab.minWidth >=
          44, `${tab.id}: tab target ${tab.minWidth}×${tab.minHeight}px < 44px`);
      require(tab.stacked &&
        tab.fullWidth, `${tab.id}: mobile tabs must span the card above the panel`);
      require(tab.listOverflow <= 1 ||
        tab.scrollable, `${tab.id}: overflowing tabs have no scroll access`);
    }
  }
}

async function exercisePage(client, scenario, layout, failures, capture) {
  const require = (condition, message) => {
    if (!condition) failures.push(message);
  };
  const pathname = scenario.pathname;
  const home = pathname === "/";
  const catalog = pathname === "/docs/components";
  const lab = pathname === "/lab";
  const guide = ["/docs/introduction", "/docs/installation"].includes(pathname);
  const component =
    !home && !catalog && !lab && !guide ? pathname.split("/").pop() : null;
  require(layout.pathname === pathname, "wrong route");
  require(layout.menuExpanded === "false" &&
    layout.menuOpen === "false", "navigation must initially be closed");
  require(layout.sidebarVisible ===
    (!scenario.mobile &&
      !home), "sidebar visibility does not match route/viewport");
  require(layout.menuVisible ===
    scenario.mobile, "mobile navigation trigger visibility is wrong");
  require(layout.densityVisible ===
    (catalog ||
      lab ||
      Boolean(component)), "density belongs only to component/lab previews");
  if (!home) {
    require(layout.tocLinks.length > 0 &&
      layout.tocLinks.every((link) => link.target), "TOC has missing targets");
    if (!scenario.mobile && !scenario.textScale && scenario.width > 1280)
      require(layout.tocVisible, "desktop TOC missing");
  }
  if (home) {
    require(layout.heroCentered, "home hero is not centered");
    require(JSON.stringify(layout.ctas) ===
      JSON.stringify([
        "/docs/introduction",
        "/docs/components",
      ]), "home CTA destinations drifted");
    require(layout.featured.length === featuredIds.length &&
      layout.featured.every(
        (item, index) =>
          item.href === `/docs/${featuredIds[index]}` &&
          item.label &&
          item.preview,
      ), "home must expose seven named live previews with exact docs destinations");
    require(layout.cards.length === 0 &&
      layout.groups.length === 0, "home must not render the full catalog");
  } else if (catalog) {
    require(JSON.stringify(layout.cards) ===
      JSON.stringify(
        componentIds,
      ), "catalog component identities/order drifted");
    require(JSON.stringify(layout.groups) ===
      JSON.stringify([
        "group-composer",
        "group-run-rail",
        "group-blocks",
      ]), "catalog groups drifted");
  } else if (component) {
    require(JSON.stringify(layout.cards) ===
      JSON.stringify([
        component,
      ]), `direct route must render only ${component}`);
    require(await client.evaluate(`(() => {
      const card = document.getElementById(${JSON.stringify(component)});
      const heading = document.getElementById(card?.getAttribute("aria-labelledby"));
      return Boolean(heading?.textContent.trim() && document.querySelector("#states"));
    })()`), "direct specimen heading/states are not accessible");
  } else if (guide) {
    require(layout.cards.length === 0 &&
      Boolean(
        layout.heading?.includes(
          pathname.endsWith("installation") ? "Installation" : "Introduction",
        ),
      ), "guide route content is wrong");
    require(await client.evaluate(`(() => {
      const text = document.querySelector(".docs-prose")?.textContent ?? "";
      return text.includes("https://ui.opencoven.ai/r/{name}.json") &&
        text.includes("pnpm dlx shadcn@latest add @opencoven/composer") &&
        text.includes("pnpm add @opencoven/ui") &&
        text.includes("@opencoven/ui/globals.css") &&
        text.includes("@opencoven/ui/blocks/composer");
    })()`), "guide registry/package setup instructions missing");
  }

  const readLayout = () => client.evaluate(`(${measurePage.toString()})()`);
  if (home && scenario.captureHomeDetails) {
    for (const [selector, suffix] of [
      [".showcase-tile--composer .showcase-tile__stage", "composer-stage"],
      [".showcase-tile--mode-switch", "mode-switch"],
      [".site-footer", "footer"],
    ]) {
      await client.evaluate(
        `document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block: "center"})`,
      );
      await client.settle();
      await capture(suffix);
    }
    await client.evaluate("scrollTo(0, 0)");
    await client.settle();
  }
  if (scenario.mobile) {
    await client.click(".site-menu-toggle");
    const opened = await readLayout();
    require(opened.sidebarVisible &&
      opened.menuExpanded === "true" &&
      opened.menuOpen === "true", "mobile menu did not open");
    require(JSON.stringify(opened.navPaths) ===
      JSON.stringify(
        navigationPaths,
      ), "opened mobile menu omits/reorders destinations");
    require(opened.navOverflow <=
      1, `navigation text/links overflow ${opened.navOverflow}px`);
    checkLayout(opened, scenario, failures, "menu open");
    if (scenario.captureMenu) await capture("navigation-open");
    await client.click(".site-menu-toggle");
    require(!(await readLayout())
      .sidebarVisible, "menu toggle did not close navigation");
    await client.click(".site-menu-toggle");
    await client.evaluate(
      'document.querySelector("#site-navigation a").focus()',
    );
    await client.key("Escape", "Escape", 27);
    require(await client.evaluate(
      'document.activeElement === document.querySelector(".site-menu-toggle") && document.querySelector(".site-menu-toggle").getAttribute("aria-expanded") === "false"',
    ), "Escape must close mobile navigation and restore trigger focus");
    await client.click(".site-menu-toggle");
    await client.click('#site-navigation a[href="/docs/installation"]');
    await client.waitFor(
      'location.pathname === "/docs/installation" && document.querySelector(".docs-heading h1")?.textContent === "Installation"',
      "mobile docs link navigation",
    );
    require(await client.evaluate(
      'document.querySelector(".site-menu-toggle").getAttribute("aria-expanded") === "false"',
    ), "destination must not inherit an open menu");
    await client.navigate(new URL(pathname, scenario.baseUrl).href);
    await applyScenario(client, scenario);
  } else if (!home) {
    require(JSON.stringify(layout.navPaths) ===
      JSON.stringify(navigationPaths), "desktop sidebar omits destinations");
    require(JSON.stringify(layout.currentNav) ===
      JSON.stringify([pathname]), "active docs navigation is wrong");
    const clearance = await client.evaluate(`(async () => {
      const sidebar = document.querySelector(".docs-sidebar");
      const header = document.querySelector(".site-header");
      const room = document.querySelector(".site-layout").getBoundingClientRect().bottom -
        sidebar.getBoundingClientRect().height - header.getBoundingClientRect().bottom;
      scrollTo(0, Math.max(0, Math.min(500, room - 1)));
      await new Promise(resolve => requestAnimationFrame(resolve));
      const value = document.querySelector(".docs-sidebar").getBoundingClientRect().top -
        document.querySelector(".site-header").getBoundingClientRect().bottom;
      scrollTo(0, 0);
      return value;
    })()`);
    require(clearance >=
      -1, `sticky sidebar overlaps header by ${-clearance}px`);
  }

  // Both keyboard shortcuts must work on every surface, not only the catalog.
  for (const modifiers of [2, 4]) {
    await client.key("k", "KeyK", 75, modifiers);
    require(await client.evaluate(
      'document.activeElement === document.querySelector(".site-search input") && Boolean(document.querySelector("#site-search-results"))',
    ), "Ctrl/Cmd+K must focus and open search");
    await client.key("Escape", "Escape", 27);
  }
  await client.key("k", "KeyK", 75, 2);
  await client.send("Input.insertText", { text: "budget" });
  await client.settle();
  require(await client.evaluate(
    "Boolean(document.querySelector('#site-search-results a[href=\"/docs/budget-pill\"]'))",
  ), "search cannot find Budget pill");
  await client.key("ArrowDown", "ArrowDown", 40);
  require(await client.evaluate(
    'document.activeElement?.getAttribute("href") === "/docs/budget-pill"',
  ), "search ArrowDown must focus the matching route");
  await client.key("Escape", "Escape", 27);
  require(await client.evaluate(
    '!document.querySelector("#site-search-results") && document.activeElement === document.querySelector(".site-search input")',
  ), "search Escape must dismiss results and restore input focus");
  // CDP key events do not supply the platform's native select-all editing command.
  await client.evaluate(
    'document.querySelector(".site-search input").select()',
  );
  await client.send("Input.insertText", {
    text: "no-such-component-oc-review",
  });
  await client.settle();
  require(await client.evaluate(
    'document.querySelector("#site-search-results [role=status]")?.textContent.trim() === "0 results" && !document.querySelector("#site-search-results a")',
  ), "search empty state missing");
  await client.evaluate(
    'document.querySelector(".site-search input").select()',
  );
  await client.key("Backspace", "Backspace", 8);
  await client.waitFor(
    'document.querySelector(".site-search input").value === ""',
    "search query cleared",
  );
  await client.key("Escape", "Escape", 27);

  const oppositeScheme = scenario.scheme === "dark" ? "light" : "dark";
  await client.click(".site-scheme");
  require(await client.evaluate(
    `localStorage.getItem("coven-ui:scheme") === ${JSON.stringify(oppositeScheme)} && document.documentElement.classList.contains("dark") === ${oppositeScheme === "dark"}`,
  ), "theme toggle must update and persist");
  await client.click(".site-scheme");
  if (layout.densityVisible) {
    const oppositeDensity =
      scenario.density === "default" ? "compact" : "default";
    const index = oppositeDensity === "compact" ? 2 : 1;
    await client.click(`.density-control button:nth-child(${index})`);
    require(await client.evaluate(
      `document.documentElement.dataset.density === ${JSON.stringify(oppositeDensity)} && localStorage.getItem("coven-ui:density") === ${JSON.stringify(oppositeDensity)} && document.querySelector(".density-control button:nth-child(${index})").getAttribute("aria-pressed") === "true"`,
    ), "density toggle must update pressed state and persist");
    await client.click(
      `.density-control button:nth-child(${index === 1 ? 2 : 1})`,
    );
  }

  if (component || catalog) {
    const ids = component ? [component] : componentIds;
    for (const id of ids) {
      const kind = [
        "composer",
        "run-rail",
        "transcript-turn",
        "session-header",
      ].includes(id)
        ? "blocks"
        : "components";
      const name = id
        .split("-")
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join("");
      for (const [index, title, text, roles] of [
        [
          2,
          "Install",
          `pnpm dlx shadcn@latest add https://ui.opencoven.ai/r/${id}.json`,
          [
            "syntax-command",
            "syntax-keyword",
            "syntax-package",
            "syntax-string",
          ],
        ],
        [
          3,
          "React API",
          `import { ${name} } from "@opencoven/ui/${kind}/${id}";`,
          [
            "syntax-keyword",
            "syntax-punctuation",
            "syntax-symbol",
            "syntax-string",
          ],
        ],
      ]) {
        const selector = `#${id} > [data-slot="tabs"] > [role="tablist"] > [role="tab"]:nth-child(${index})`;
        await client.click(selector);
        const panel = await client.evaluate(`(() => {
          const card = document.getElementById(${JSON.stringify(id)});
          const tab = card.querySelector(${JSON.stringify(`:scope > [data-slot="tabs"] > [role="tablist"] > [role="tab"]:nth-child(${index})`)});
          const panel = document.getElementById(tab.getAttribute("aria-controls"));
          const commands = [...(panel?.querySelectorAll(".specimen-command") ?? [])];
          const r = tab.getBoundingClientRect(), list = tab.parentElement.getBoundingClientRect();
          return {
            selected: tab.getAttribute("aria-selected") === "true",
            visible: Boolean(panel?.getClientRects().length),
            commands: commands.map(el => el.textContent.trim()),
            snippets: panel?.querySelectorAll(".specimen-code-snippet").length,
            roles: [...(panel?.querySelectorAll('[class^="syntax-"]') ?? [])].map(el => el.className),
            copy: Boolean(panel?.querySelector('button[aria-label^="Copy"]')),
            reachable: r.left >= list.left - 1 && r.right <= list.right + 1,
            commandOverflow: Math.max(0, ...commands.map(el => el.scrollWidth - el.clientWidth)),
          };
        })()`);
        require(panel.selected &&
          panel.visible &&
          panel.snippets === 1 &&
          JSON.stringify(panel.commands) === JSON.stringify([text]) &&
          roles.every((role) => panel.roles.includes(role)) &&
          panel.copy &&
          panel.reachable &&
          panel.commandOverflow <=
            1, `${id} ${title} must expose only its own readable, syntax-marked, copyable snippet: ${JSON.stringify(panel)}`);
        if (scenario.captureCode && id === ids[0])
          await capture(title === "Install" ? "install" : "react-api");
      }
      await client.click(
        `#${id} > [data-slot="tabs"] > [role="tablist"] > [role="tab"]:first-child`,
      );
    }
  }
  if (lab) {
    require(JSON.stringify(layout.labTabs) ===
      JSON.stringify(labViews), "lab must retain its five named views");
    for (const [index, name] of labViews.entries()) {
      await client.click(
        `.assembled-lab__tabs [role="tab"]:nth-child(${index + 1})`,
      );
      const state = await client.evaluate(`(() => {
        const tab = document.querySelector('.assembled-lab__tabs [aria-selected="true"]');
        const panel = document.getElementById(tab?.getAttribute("aria-controls"));
        const stage = panel?.querySelector(".assembled-lab__stage");
        const r = tab?.getBoundingClientRect();
        return {
          name: tab?.textContent.trim(), content: Boolean(stage?.textContent.trim() && stage.getClientRects().length),
          height: r?.height, width: r?.width, labelOverflow: tab ? tab.scrollWidth - tab.clientWidth : null,
        };
      })()`);
      require(state.name === name &&
        state.content, `${name} lab view does not activate real content`);
      if (scenario.mobile)
        require(state.height >= 44 &&
          state.width >= 44 &&
          state.labelOverflow <=
            1, `${name} lab tab target is too small or clipped: ${JSON.stringify(state)}`);
      checkLayout(await readLayout(), scenario, failures, `lab ${name}`);
    }
    await client.click(".assembled-lab__tabs [role=tab]:first-child");
  }

  checkLayout(await readLayout(), scenario, failures, "after interactions");
  await client.navigate(new URL(pathname, scenario.baseUrl).href);
  await applyScenario(client, scenario);
  const persisted = await readLayout();
  require(persisted.scheme === scenario.scheme &&
    persisted.density ===
      scenario.density, "theme/density must survive navigation");
  await client.key("Tab", "Tab", 9);
  require(await client.evaluate(
    'document.activeElement === document.querySelector(".skip-link") && document.activeElement.matches(":focus-visible")',
  ), "skip link must be the first visible keyboard focus target");
  await client.key("Enter", "Enter", 13);
  const skip = await client.evaluate(`(() => {
    const main = document.querySelector("#specimen-main");
    return {
      focused: document.activeElement === main,
      clearance: main.getBoundingClientRect().top - Math.max(0, document.querySelector(".site-header").getBoundingClientRect().bottom),
    };
  })()`);
  require(skip.focused &&
    skip.clearance >=
      -1, `skip link must focus main below sticky header: ${JSON.stringify(skip)}`);
  await client.evaluate("scrollTo(0, 0)");

  if (persisted.tocVisible) {
    await client.click('.docs-toc a[href^="#"]');
    const clearance = await client.evaluate(`(() => {
      const link = document.querySelector('.docs-toc a[href^="#"]');
      return document.getElementById(link.hash.slice(1)).getBoundingClientRect().top -
        Math.max(0, document.querySelector(".site-header").getBoundingClientRect().bottom);
    })()`);
    require(clearance >=
      -1, `TOC anchor is hidden beneath header (${clearance}px)`);
    await client.evaluate("scrollTo(0, 0)");
  }

  if (home && scenario.verifyFeaturedDestinations) {
    for (const id of featuredIds) {
      await client.click(`.showcase-tile__link[href="/docs/${id}"]`);
      await client.waitFor(
        `location.pathname === "/docs/${id}" && Boolean(document.querySelector(".docs-content > #${id}"))`,
        `${id} showcase destination`,
      );
      require(await client.evaluate(
        `document.querySelectorAll(".specimen-card").length === 1 && Boolean(document.querySelector("#${id} .specimen-stage [data-slot]"))`,
      ), `${id} demo destination has no direct live specimen`);
      await client.navigate(new URL("/", scenario.baseUrl).href);
      await applyScenario(client, scenario);
    }
  }
  checkLayout(await readLayout(), scenario, failures, "after interactions");
}

async function applyScenario(client, scenario) {
  await client.evaluate(`document.documentElement.dir = ${JSON.stringify(scenario.rtl ? "rtl" : "ltr")};
    document.documentElement.style.fontSize = ${JSON.stringify(`${100 * (scenario.textScale ?? 1)}%`)};`);
  await client.settle();
}

export async function runReview({
  scenarios,
  outputDir,
  port,
  baseUrl,
  chromePath,
  name,
}) {
  if (!chromePath) throw new Error("CHROME_PATH is required");
  const response = await fetch(baseUrl, { signal: AbortSignal.timeout(5_000) });
  if (!response.ok)
    throw new Error(
      `Local preview is not responding successfully: ${response.status} ${baseUrl}`,
    );
  await mkdir(outputDir, { recursive: true });
  const profile = await mkdtemp(path.join(outputDir, ".chrome-profile-"));
  const chromeOutput = [];
  let spawnError;
  const chrome = spawn(
    chromePath,
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-background-networking",
      "--disable-component-update",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      `--disk-cache-dir=${path.join(profile, "cache")}`,
      "about:blank",
    ],
    {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, TMPDIR: profile, TMP: profile, TEMP: profile },
    },
  );
  chrome.stdout.on("data", (chunk) => chromeOutput.push(String(chunk)));
  chrome.stderr.on("data", (chunk) => chromeOutput.push(String(chunk)));
  chrome.on("error", (error) => {
    spawnError = error;
  });
  let client;
  const results = [];
  try {
    const deadline = Date.now() + 30_000;
    let target, lastError;
    while (!target && Date.now() < deadline) {
      if (spawnError) throw spawnError;
      if (chrome.exitCode !== null)
        throw new Error(
          `Chrome exited with ${chrome.exitCode}: ${chromeOutput.join("")}`,
        );
      try {
        const response = await fetch(`http://127.0.0.1:${port}/json/list`, {
          signal: AbortSignal.timeout(1_000),
        });
        if (!response.ok) throw new Error(`CDP HTTP ${response.status}`);
        target = (await response.json()).find(
          (page) => page.type === "page" && page.webSocketDebuggerUrl,
        );
      } catch (error) {
        lastError = error;
      }
      if (!target) await sleep(150);
    }
    if (!target)
      throw new Error(
        `Chrome page target did not become ready: ${lastError ?? "no page"}`,
      );
    client = new CdpClient(target.webSocketDebuggerUrl);
    await client.connect();
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    });
    for (const input of scenarios) {
      const scenario = {
        height: 900,
        scheme: "dark",
        density: "default",
        mobile: false,
        ...input,
        baseUrl,
      };
      const failures = [],
        runtimeErrors = [],
        screenshots = [];
      const removeException = client.on(
        "Runtime.exceptionThrown",
        ({ exceptionDetails }) =>
          runtimeErrors.push(
            exceptionDetails.exception?.description ?? exceptionDetails.text,
          ),
      );
      const removeConsole = client.on(
        "Runtime.consoleAPICalled",
        ({ type, args = [] }) => {
          if (type === "error")
            runtimeErrors.push(
              args.map((arg) => arg.value ?? arg.description).join(" "),
            );
        },
      );
      let layout;
      const capture = async (suffix = "") => {
        const screenshot = `${scenario.name}${suffix ? `-${suffix}` : ""}.png`;
        const image = await client.send("Page.captureScreenshot", {
          format: "png",
          fromSurface: true,
          captureBeyondViewport: false,
        });
        await writeFile(
          path.join(outputDir, screenshot),
          Buffer.from(image.data, "base64"),
        );
        screenshots.push(screenshot);
      };
      try {
        await client.send("Emulation.setDeviceMetricsOverride", {
          width: scenario.width,
          height: scenario.height,
          deviceScaleFactor: 1,
          mobile: scenario.mobile,
          screenWidth: scenario.width,
          screenHeight: scenario.height,
        });
        await client.navigate(new URL("/", baseUrl).href);
        await client.evaluate(`localStorage.setItem("coven-ui:scheme", ${JSON.stringify(scenario.scheme)});
          localStorage.setItem("coven-ui:density", ${JSON.stringify(scenario.density)});`);
        await client.navigate(new URL(scenario.pathname, baseUrl).href);
        await applyScenario(client, scenario);
        layout = await client.evaluate(`(${measurePage.toString()})()`);
        checkLayout(layout, scenario, failures);
        await capture();
        await exercisePage(client, scenario, layout, failures, capture);
      } catch (error) {
        failures.push(error.stack ?? String(error));
      } finally {
        removeException();
        removeConsole();
      }
      failures.push(...runtimeErrors.map((error) => `runtime: ${error}`));
      results.push({ ...scenario, layout, failures, screenshots });
      console.log(
        `${failures.length ? "FAIL" : "PASS"} ${scenario.name}${failures.length ? ` (${failures.length} failures)` : ""}`,
      );
    }
    const summary = {
      generatedAt: new Date().toISOString(),
      name,
      baseUrl,
      passed: results.every((result) => !result.failures.length),
      scenarios: results,
    };
    await writeFile(
      path.join(outputDir, "summary.json"),
      `${JSON.stringify(summary, null, 2)}\n`,
    );
    const failures = results.flatMap((result) =>
      result.failures.map((failure) => `${result.name}: ${failure}`),
    );
    if (failures.length)
      throw new Error(`${name} failed:\n- ${failures.join("\n- ")}`);
    console.log(
      `Captured ${results.reduce((sum, result) => sum + result.screenshots.length, 0)} screenshots across ${results.length} passing ${name} scenarios.`,
    );
  } catch (error) {
    await writeFile(path.join(outputDir, "chrome.log"), chromeOutput.join(""));
    throw error;
  } finally {
    client?.close();
    const waitForExit = async () => {
      if (chrome.exitCode !== null || chrome.signalCode !== null || spawnError)
        return;
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          chrome.off("exit", exited);
          resolve();
        }, 2_000);
        const exited = () => {
          clearTimeout(timeout);
          resolve();
        };
        chrome.once("exit", exited);
      });
    };
    chrome.kill("SIGTERM");
    await waitForExit();
    if (chrome.exitCode === null && chrome.signalCode === null && !spawnError) {
      chrome.kill("SIGKILL");
      await waitForExit();
    }
    await rm(profile, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 100,
    });
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await runReview({
    name: "visual review",
    baseUrl: process.env.BASE_URL ?? "http://127.0.0.1:4173",
    chromePath: process.env.CHROME_PATH,
    outputDir: path.resolve(
      process.env.VISUAL_OUTPUT_DIR ?? "artifacts/visual-review",
    ),
    port: Number(process.env.CHROME_DEBUGGING_PORT ?? 9222),
    scenarios: [
      {
        name: "home-dark-desktop",
        pathname: "/",
        width: 1440,
        verifyFeaturedDestinations: true,
      },
      {
        name: "home-light-mobile",
        pathname: "/",
        width: 390,
        mobile: true,
        scheme: "light",
        captureMenu: true,
        verifyFeaturedDestinations: true,
      },
      {
        name: "docs-introduction-desktop",
        pathname: "/docs/introduction",
        width: 1440,
      },
      {
        name: "docs-installation-mobile",
        pathname: "/docs/installation",
        width: 390,
        mobile: true,
      },
      {
        name: "catalog-light-desktop",
        pathname: "/docs/components",
        width: 1440,
        scheme: "light",
        density: "compact",
      },
      {
        name: "catalog-dark-mobile",
        pathname: "/docs/components",
        width: 390,
        mobile: true,
      },
      {
        name: "component-mode-switch-desktop",
        pathname: "/docs/mode-switch",
        width: 1440,
        captureCode: true,
      },
      {
        name: "component-session-mobile",
        pathname: "/docs/session-header",
        width: 320,
        mobile: true,
        textScale: 2,
        captureCode: true,
      },
      { name: "lab-dark-desktop", pathname: "/lab", width: 1440 },
      {
        name: "lab-light-mobile",
        pathname: "/lab",
        width: 390,
        mobile: true,
        scheme: "light",
        density: "compact",
      },
    ],
  });
}
