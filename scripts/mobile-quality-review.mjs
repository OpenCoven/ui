import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const chromePath = process.env.CHROME_PATH;
const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:4173";
const outputDir = path.resolve(
  process.env.MOBILE_OUTPUT_DIR ?? "artifacts/mobile-quality",
);
const port = Number(process.env.MOBILE_CHROME_PORT ?? 9233);
const cases = [
  {
    name: "mobile-320-dark-cozy",
    width: 320,
    scheme: "dark",
    density: "default",
  },
  {
    name: "mobile-375-light-compact",
    width: 375,
    scheme: "light",
    density: "compact",
  },
  {
    name: "mobile-390-dark-cozy",
    width: 390,
    scheme: "dark",
    density: "default",
  },
  {
    name: "mobile-430-light-cozy",
    width: 430,
    scheme: "light",
    density: "default",
  },
  {
    name: "mobile-390-dark-rtl",
    width: 390,
    scheme: "dark",
    density: "compact",
    rtl: true,
  },
  {
    name: "mobile-390-dark-text-200",
    width: 390,
    scheme: "dark",
    density: "default",
    textScale: 2,
  },
  {
    name: "mobile-320-dark-text-200",
    width: 320,
    scheme: "dark",
    density: "default",
    textScale: 2,
  },
];

if (!chromePath) throw new Error("CHROME_PATH is required");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const waitForPageTarget = async (url, timeoutMs = 30_000) => {
  const deadline = Date.now() + timeoutMs;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const targets = await response.json();
        const page = targets.find((entry) => entry.type === "page");
        if (page?.webSocketDebuggerUrl) return page;
        lastError = new Error("Chrome has not exposed a page target");
      } else {
        lastError = new Error(`${response.status} ${response.statusText}`);
      }
    } catch (error) {
      lastError = error;
    }
    await sleep(150);
  }

  throw new Error(`Chrome page target unavailable: ${lastError}`);
};
const profile = await mkdtemp(path.join(tmpdir(), "opencoven-mobile-quality-"));
await mkdir(outputDir, { recursive: true });

const chromeOutput = [];
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
    "about:blank",
  ],
  {
    stdio: ["ignore", "pipe", "pipe"],
  },
);

chrome.stdout.on("data", (chunk) => chromeOutput.push(String(chunk)));
chrome.stderr.on("data", (chunk) => chromeOutput.push(String(chunk)));

let socket;
try {
  const target = await waitForPageTarget(`http://127.0.0.1:${port}/json/list`);

  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  let id = 0;
  const pending = new Map();
  const listeners = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(String(event.data));
    if (message.id) {
      const waiter = pending.get(message.id);
      if (!waiter) return;
      pending.delete(message.id);
      clearTimeout(waiter.timeout);
      if (message.error) waiter.reject(new Error(message.error.message));
      else waiter.resolve(message.result ?? {});
      return;
    }

    for (const handler of listeners.get(message.method) ?? []) {
      handler(message.params ?? {});
    }
  });

  const rejectPending = (error) => {
    for (const waiter of pending.values()) {
      clearTimeout(waiter.timeout);
      waiter.reject(error);
    }
    pending.clear();
  };

  socket.addEventListener(
    "close",
    () => rejectPending(new Error("Chrome DevTools connection closed")),
    { once: true },
  );
  socket.addEventListener(
    "error",
    () => rejectPending(new Error("Chrome DevTools connection failed")),
    { once: true },
  );

  const on = (method, handler) => {
    const handlers = listeners.get(method) ?? [];
    handlers.push(handler);
    listeners.set(method, handlers);

    return () => {
      listeners.set(
        method,
        (listeners.get(method) ?? []).filter(
          (candidate) => candidate !== handler,
        ),
      );
    };
  };

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      if (socket.readyState !== WebSocket.OPEN) {
        reject(new Error("Chrome DevTools connection is not open"));
        return;
      }

      const requestId = ++id;
      const timeout = setTimeout(() => {
        pending.delete(requestId);
        reject(new Error(`${method} timed out`));
      }, 15_000);
      pending.set(requestId, { resolve, reject, timeout });
      socket.send(JSON.stringify({ id: requestId, method, params }));
    });

  const waitForEvent = (method, timeoutMs = 15_000) =>
    new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        removeListener();
        reject(new Error(`Timed out waiting for ${method}`));
      }, timeoutMs);
      const removeListener = on(method, (params) => {
        clearTimeout(timeout);
        removeListener();
        resolve(params);
      });
    });

  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", {
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
  };

  const waitForRender = async (selector, timeoutMs = 15_000) => {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      if (
        await evaluate(
          `Boolean(document.querySelector(${JSON.stringify(selector)}))`,
        )
      ) {
        return;
      }
      await sleep(100);
    }

    throw new Error(`Timed out waiting for ${selector}`);
  };

  const navigate = async (url) => {
    const loaded = waitForEvent("Page.loadEventFired");
    const response = await send("Page.navigate", { url });
    if (response.errorText) {
      throw new Error(`Navigation failed: ${response.errorText}`);
    }
    await loaded;
    await waitForRender("#specimen-main");
  };

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });

  const results = [];

  for (const scenario of cases) {
    await send("Emulation.setDeviceMetricsOverride", {
      width: scenario.width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: true,
      screenWidth: scenario.width,
      screenHeight: 900,
    });

    await navigate(new URL("/", baseUrl).href);
    await evaluate(`(() => {
      localStorage.setItem("coven-ui:scheme", ${JSON.stringify(scenario.scheme)});
      localStorage.setItem("coven-ui:density", ${JSON.stringify(scenario.density)});
    })()`);
    await navigate(new URL("/", baseUrl).href);

    await evaluate(`(() => {
      document.documentElement.dir = ${JSON.stringify(
        scenario.rtl ? "rtl" : "ltr",
      )};
      document.documentElement.style.fontSize = ${JSON.stringify(
        scenario.textScale ? `${scenario.textScale * 100}%` : "",
      )};
    })()`);

    const measurement = await evaluate(`(async () => {
      await document.fonts.ready;
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );

      const root = document.documentElement;
      const topbar = document.querySelector(".specimen-topbar");
      const rail = document.querySelector(".specimen-rail");
      const railLinks = [
        ...document.querySelectorAll(".specimen-rail__nav a"),
      ];
      const topbarControls = [
        ...document.querySelectorAll(
          ".specimen-brand, .surface-switcher, .specimen-search, .specimen-search input, .specimen-search kbd, .density-control, .scheme-control",
        ),
      ];
      const firstCard = document.querySelector(".specimen-card");
      const cards = [...document.querySelectorAll(".specimen-card")];
      const stages = [...document.querySelectorAll(".specimen-stage")];
      const cardTabRoots = cards
        .map((card) => card.querySelector(':scope > [data-slot="tabs"]'))
        .filter(Boolean);
      const cardLists = cardTabRoots
        .map((tabs) => tabs.querySelector(':scope > [data-slot="tabs-list"]'))
        .filter(Boolean);
      const activePanels = cardTabRoots
        .map((tabs) => tabs.querySelector(':scope > [data-slot="tabs-content"]'))
        .filter(Boolean);
      const transcript = document.querySelector(
        '#transcript-turn [data-slot="transcript-turn"]',
      );
      const session = document.querySelector(
        '#session-header [data-slot="session-header"]',
      );
      const sessionTitle = session?.querySelector("strong");
      const clipped = (element) =>
        element ? Math.max(0, element.scrollWidth - element.clientWidth) : 0;
      const rect = (element) => element?.getBoundingClientRect();
      const tabHeights = cardLists.flatMap((list) =>
        [...list.querySelectorAll('[role="tab"]')].map(
          (tab) => rect(tab)?.height ?? 0,
        ),
      );
      const label = (element) =>
        element
          ? [
              element.tagName.toLowerCase(),
              element.id ? "#" + element.id : "",
              ...[...element.classList]
                .slice(0, 3)
                .map((name) => "." + name),
            ].join("")
          : null;
      const overflowingElements = [...document.querySelectorAll("body *")]
        .map((element) => {
          const bounds = rect(element);
          const overflow = bounds
            ? Math.max(0, -bounds.left, bounds.right - root.clientWidth)
            : 0;
          return {
            label: label(element),
            parent: label(element.parentElement),
            left: bounds?.left ?? null,
            right: bounds?.right ?? null,
            width: bounds?.width ?? null,
            overflow,
            parentOverflowX: element.parentElement
              ? getComputedStyle(element.parentElement).overflowX
              : null,
          };
        })
        .filter(({ overflow }) => overflow > 1)
        .sort((left, right) => right.overflow - left.overflow)
        .slice(0, 20);
      const initialScrollY = scrollY;
      document.querySelector(".skip-link")?.click();
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
      const skipTargetClearance = (() => {
        const mainBounds = rect(document.querySelector("#specimen-main"));
        const topbarBounds = rect(topbar);
        return mainBounds
          ? mainBounds.top - Math.max(0, topbarBounds?.bottom ?? 0)
          : null;
      })();
      scrollTo(0, initialScrollY);
      await new Promise((resolve) => requestAnimationFrame(resolve));

      return {
        viewport: root.clientWidth,
        documentOverflow: Math.max(0, root.scrollWidth - root.clientWidth),
        chromeBottom: Math.max(
          rect(topbar)?.bottom ?? 0,
          rect(rail)?.bottom ?? 0,
        ),
        firstCardTop: rect(firstCard)?.top ?? null,
        railNavOverflow: clipped(
          document.querySelector(".specimen-rail__nav"),
        ),
        maxRailLinkContentOverflow: Math.max(
          0,
          ...railLinks.map(clipped),
        ),
        maxRailLinkViewportOverflow: Math.max(
          0,
          ...railLinks.map((link) => {
            const bounds = rect(link);
            return bounds
              ? Math.max(0, -bounds.left, bounds.right - root.clientWidth)
              : 0;
          }),
        ),
        maxTopbarControlViewportOverflow: Math.max(
          0,
          ...topbarControls.map((control) => {
            const bounds = rect(control);
            return bounds
              ? Math.max(0, -bounds.left, bounds.right - root.clientWidth)
              : 0;
          }),
        ),
        cardCount: cards.length,
        tabRootCount: cardTabRoots.length,
        tabListCount: cardLists.length,
        activePanelCount: activePanels.length,
        tabTargetCount: tabHeights.length,
        maxCardOverflow: Math.max(0, ...cards.map(clipped)),
        maxStageOverflow: Math.max(0, ...stages.map(clipped)),
        maxTabRootOverflow: Math.max(0, ...cardTabRoots.map(clipped)),
        minTabHeight: tabHeights.length > 0 ? Math.min(...tabHeights) : null,
        stackedTabs: cardLists.every((list, index) => {
          const listRect = rect(list);
          const panelRect = rect(activePanels[index]);
          return listRect && panelRect && panelRect.top >= listRect.bottom - 1;
        }),
        fullWidthTabs: cardLists.every((list, index) => {
          const listRect = rect(list);
          const rootRect = rect(cardTabRoots[index]);
          return (
            listRect &&
            rootRect &&
            Math.abs(listRect.width - rootRect.width) <= 1
          );
        }),
        transcriptOverflow: clipped(transcript),
        sessionOverflow: clipped(session),
        sessionTitleEllipsized: sessionTitle
          ? getComputedStyle(sessionTitle).textOverflow === "ellipsis"
          : null,
        direction: root.dir,
        reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
        skipTargetClearance,
        overflowingElements,
      };
    })()`);

    const failures = [];
    if (measurement.cardCount !== 16) {
      failures.push(`expected 16 cards, got ${measurement.cardCount}`);
    }
    if (measurement.tabRootCount !== 16) {
      failures.push(
        `expected 16 card tab roots, got ${measurement.tabRootCount}`,
      );
    }
    if (measurement.tabListCount !== 16) {
      failures.push(
        `expected 16 card tab lists, got ${measurement.tabListCount}`,
      );
    }
    if (measurement.activePanelCount !== 16) {
      failures.push(
        `expected 16 active card panels, got ${measurement.activePanelCount}`,
      );
    }
    if (measurement.tabTargetCount !== 48) {
      failures.push(
        `expected 48 card tab targets, got ${measurement.tabTargetCount}`,
      );
    }
    if (measurement.documentOverflow > 1) {
      failures.push(
        `document overflow ${measurement.documentOverflow}px: ${measurement.overflowingElements
          .map(({ label, overflow }) => `${label} (${overflow}px)`)
          .join(", ")}`,
      );
    }
    if (measurement.maxRailLinkViewportOverflow > 1) {
      failures.push(
        `rail link viewport overflow ${measurement.maxRailLinkViewportOverflow}px`,
      );
    }
    if (measurement.railNavOverflow > 1) {
      failures.push(
        `rail navigation overflow ${measurement.railNavOverflow}px`,
      );
    }
    if (measurement.maxRailLinkContentOverflow > 1) {
      failures.push(
        `rail link content overflow ${measurement.maxRailLinkContentOverflow}px`,
      );
    }
    if (measurement.maxTopbarControlViewportOverflow > 1) {
      failures.push(
        `topbar control viewport overflow ${measurement.maxTopbarControlViewportOverflow}px`,
      );
    }
    if (
      measurement.skipTargetClearance === null ||
      measurement.skipTargetClearance < 0
    ) {
      failures.push(
        `skip target clearance ${measurement.skipTargetClearance ?? "missing"}px`,
      );
    }
    if (!scenario.textScale && measurement.chromeBottom > 200) {
      failures.push(
        `mobile shell chrome ends at ${measurement.chromeBottom}px`,
      );
    }
    if (
      !scenario.textScale &&
      (measurement.firstCardTop === null || measurement.firstCardTop > 640)
    ) {
      failures.push(
        `first card starts at ${measurement.firstCardTop ?? "missing"}px`,
      );
    }
    if (measurement.maxCardOverflow > 1) {
      failures.push(`card overflow ${measurement.maxCardOverflow}px`);
    }
    if (measurement.maxStageOverflow > 1) {
      failures.push(`stage overflow ${measurement.maxStageOverflow}px`);
    }
    if (measurement.maxTabRootOverflow > 1) {
      failures.push(`tab-root overflow ${measurement.maxTabRootOverflow}px`);
    }
    if (measurement.minTabHeight === null || measurement.minTabHeight < 44) {
      failures.push(
        `tab target ${measurement.minTabHeight ?? "missing"}px < 44px`,
      );
    }
    if (!measurement.stackedTabs) {
      failures.push("card tabs are not stacked above their active panels");
    }
    if (!measurement.fullWidthTabs) {
      failures.push("card tab lists do not consume the mobile content width");
    }
    if (measurement.transcriptOverflow > 1) {
      failures.push(`transcript overflow ${measurement.transcriptOverflow}px`);
    }
    if (measurement.sessionOverflow > 1) {
      failures.push(`session header overflow ${measurement.sessionOverflow}px`);
    }
    if (measurement.sessionTitleEllipsized) {
      failures.push("session title is ellipsized on mobile");
    }
    if (!measurement.reducedMotion) {
      failures.push("reduced-motion media query was not active");
    }
    if (scenario.rtl && measurement.direction !== "rtl") {
      failures.push("RTL direction was not applied");
    }

    const image = await send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
    });
    const screenshot = `${scenario.name}.png`;
    await writeFile(
      path.join(outputDir, screenshot),
      Buffer.from(image.data, "base64"),
    );
    results.push({ ...scenario, measurement, failures, screenshot });
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    passed: results.every((entry) => entry.failures.length === 0),
    results,
  };
  await writeFile(
    path.join(outputDir, "summary.json"),
    `${JSON.stringify(summary, null, 2)}\n`,
  );
  await writeFile(
    path.join(outputDir, "README.md"),
    [
      "# OpenCoven UI mobile quality review",
      "",
      `Result: **${summary.passed ? "PASS" : "FAIL"}**`,
      "",
      "| Scenario | Width | Document overflow | Stage overflow | Min tab target | Result |",
      "|---|---:|---:|---:|---:|---|",
      ...results.map(
        (entry) =>
          `| ${entry.name} | ${entry.width}px | ${entry.measurement.documentOverflow}px | ${entry.measurement.maxStageOverflow}px | ${entry.measurement.minTabHeight}px | ${entry.failures.length ? entry.failures.join("; ") : "PASS"} |`,
      ),
      "",
    ].join("\n"),
  );

  if (!summary.passed) {
    throw new Error(
      results
        .flatMap((entry) =>
          entry.failures.map((failure) => `${entry.name}: ${failure}`),
        )
        .join("\n"),
    );
  }
} catch (error) {
  await writeFile(
    path.join(outputDir, "chrome.log"),
    `${chromeOutput.join("")}\n`,
  );
  throw error;
} finally {
  socket?.close();
  chrome.kill();
  await new Promise((resolve) => {
    if (chrome.exitCode !== null) {
      resolve();
      return;
    }
    const timeout = setTimeout(resolve, 2000);
    chrome.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });
  });
  let profileRemoved = false;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await rm(profile, { recursive: true, force: true });
      profileRemoved = true;
      break;
    } catch {
      await sleep(100 * (attempt + 1));
    }
  }
  if (!profileRemoved) {
    console.warn(`Unable to remove temporary Chrome profile: ${profile}`);
  }
}
