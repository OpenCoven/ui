import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";

const chromePath = process.env.CHROME_PATH;
const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:4173";
const outputDir = path.resolve(
  process.env.VISUAL_OUTPUT_DIR ?? "artifacts/visual-review",
);
const debuggingPort = Number(process.env.CHROME_DEBUGGING_PORT ?? 9222);

if (!chromePath) {
  throw new Error("CHROME_PATH is required");
}

class CdpClient {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
  }

  async connect() {
    await new Promise((resolve, reject) => {
      const socket = new globalThis.WebSocket(this.url);
      this.socket = socket;

      socket.addEventListener("open", resolve, { once: true });
      socket.addEventListener("error", reject, { once: true });
      socket.addEventListener("message", (event) => {
        const message = JSON.parse(String(event.data));

        if (message.id) {
          const pending = this.pending.get(message.id);
          if (!pending) {
            return;
          }

          this.pending.delete(message.id);
          if (message.error) {
            pending.reject(
              new Error(
                `${pending.method}: ${message.error.message ?? "CDP error"}`,
              ),
            );
          } else {
            pending.resolve(message.result ?? {});
          }
          return;
        }

        const handlers = this.listeners.get(message.method) ?? [];
        for (const handler of handlers) {
          handler(message.params ?? {});
        }
      });
      socket.addEventListener(
        "close",
        () => {
          for (const pending of this.pending.values()) {
            pending.reject(new Error("Chrome DevTools connection closed"));
          }
          this.pending.clear();
        },
        { once: true },
      );
    });
  }

  on(method, handler) {
    const handlers = this.listeners.get(method) ?? [];
    handlers.push(handler);
    this.listeners.set(method, handlers);

    return () => {
      this.listeners.set(
        method,
        (this.listeners.get(method) ?? []).filter(
          (candidate) => candidate !== handler,
        ),
      );
    };
  }

  send(method, params = {}) {
    if (!this.socket || this.socket.readyState !== globalThis.WebSocket.OPEN) {
      throw new Error("Chrome DevTools connection is not open");
    }

    const id = this.nextId;
    this.nextId += 1;

    return new Promise((resolve, reject) => {
      this.pending.set(id, { method, resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  waitForEvent(method, timeoutMs = 15_000) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        removeListener();
        reject(new Error(`Timed out waiting for ${method}`));
      }, timeoutMs);
      const removeListener = this.on(method, (params) => {
        clearTimeout(timeout);
        removeListener();
        resolve(params);
      });
    });
  }

  close() {
    this.socket?.close();
  }
}

async function waitForPageTarget(url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await globalThis.fetch(url);
      if (response.ok) {
        const targets = await response.json();
        const page = targets.find((target) => target.type === "page");
        if (page?.webSocketDebuggerUrl) return page;
        lastError = new Error("Chrome has not exposed a page target");
      } else {
        lastError = new Error(`${response.status} ${response.statusText}`);
      }
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  throw new Error(`Chrome page target did not become ready: ${lastError}`);
}

async function waitForRender(client, selector, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const result = await client.send("Runtime.evaluate", {
      expression: `Boolean(document.querySelector(${JSON.stringify(selector)}))`,
      returnByValue: true,
    });

    if (result.result?.value === true) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Timed out waiting for ${selector}`);
}

async function navigate(client, url) {
  const loaded = client.waitForEvent("Page.loadEventFired");
  const response = await client.send("Page.navigate", { url });

  if (response.errorText) {
    throw new Error(`Navigation failed: ${response.errorText}`);
  }

  await loaded;
}

async function evaluateValue(client, expression, awaitPromise = false) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise,
    returnByValue: true,
  });

  if (result.exceptionDetails) {
    throw new Error(
      result.exceptionDetails.exception?.description ??
        result.exceptionDetails.text ??
        "Runtime evaluation failed",
    );
  }

  return result.result?.value;
}

const scenarios = [
  {
    name: "library-dark-desktop",
    pathname: "/",
    width: 1440,
    height: 1000,
    scheme: "dark",
    density: "default",
    mobile: false,
    expected: "library",
  },
  {
    name: "library-dark-mobile",
    pathname: "/",
    width: 390,
    height: 844,
    scheme: "dark",
    density: "default",
    mobile: true,
    expected: "library",
  },
  {
    name: "library-light-desktop",
    pathname: "/",
    width: 1440,
    height: 1000,
    scheme: "light",
    density: "compact",
    mobile: false,
    expected: "library",
  },
  {
    name: "assembled-dark-desktop",
    pathname: "/lab",
    width: 1440,
    height: 1000,
    scheme: "dark",
    density: "default",
    mobile: false,
    expected: "lab",
  },
  {
    name: "assembled-dark-mobile",
    pathname: "/lab",
    width: 390,
    height: 844,
    scheme: "dark",
    density: "compact",
    mobile: true,
    expected: "lab",
  },
];

await mkdir(outputDir, { recursive: true });
const profileDir = await mkdtemp(
  path.join(tmpdir(), "opencoven-ui-visual-review-"),
);
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
    `--remote-debugging-port=${debuggingPort}`,
    `--user-data-dir=${profileDir}`,
    "about:blank",
  ],
  { stdio: ["ignore", "pipe", "pipe"] },
);

chrome.stdout.on("data", (chunk) => chromeOutput.push(String(chunk)));
chrome.stderr.on("data", (chunk) => chromeOutput.push(String(chunk)));

let client;
const results = [];

try {
  const page = await waitForPageTarget(
    `http://127.0.0.1:${debuggingPort}/json/list`,
  );

  client = new CdpClient(page.webSocketDebuggerUrl);
  await client.connect();
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });

  for (const scenario of scenarios) {
    const runtimeErrors = [];
    const removeExceptionListener = client.on(
      "Runtime.exceptionThrown",
      ({ exceptionDetails }) => {
        runtimeErrors.push(
          exceptionDetails.exception?.description ??
            exceptionDetails.text ??
            "Uncaught runtime exception",
        );
      },
    );
    const removeConsoleListener = client.on(
      "Runtime.consoleAPICalled",
      ({ type, args = [] }) => {
        if (type === "error") {
          runtimeErrors.push(
            args
              .map((argument) => argument.value ?? argument.description ?? "")
              .join(" "),
          );
        }
      },
    );

    await client.send("Emulation.setDeviceMetricsOverride", {
      width: scenario.width,
      height: scenario.height,
      deviceScaleFactor: 1,
      mobile: scenario.mobile,
      screenWidth: scenario.width,
      screenHeight: scenario.height,
    });

    await navigate(client, new URL("/", baseUrl).href);
    await evaluateValue(
      client,
      `localStorage.setItem("coven-ui:scheme", ${JSON.stringify(
        scenario.scheme,
      )}); localStorage.setItem("coven-ui:density", ${JSON.stringify(
        scenario.density,
      )});`,
    );
    await navigate(client, new URL(scenario.pathname, baseUrl).href);
    await waitForRender(client, "#specimen-main");
    await evaluateValue(
      client,
      `(async () => {
        await document.fonts.ready;
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        );
        return true;
      })()`,
      true,
    );

    const layout = await evaluateValue(
      client,
      `(() => {
        const root = document.documentElement;
        const topbar = document.querySelector(".specimen-topbar");
        const rail = document.querySelector(".specimen-rail");
        const main = document.querySelector("#specimen-main");
        const hero = document.querySelector(".specimen-hero");
        const firstContent = document.querySelector(
          ".specimen-card, .assembled-lab",
        );
        const cards = [...document.querySelectorAll(".specimen-card")];
        const groups = [...document.querySelectorAll(".catalog-group")];
        const lab = document.querySelector(".assembled-lab");
        const tabs = lab
          ? [...lab.querySelectorAll('[role="tab"]')]
          : [];
        const clippedSurfaceSelectors = [
          '[data-slot="session-header"]',
          '.assembled-lab [data-slot="tabs"]',
          '.assembled-lab [data-slot="transcript-turn"]',
          '.assembled-lab [data-slot="composer"]',
        ];
        const internallyClipped = clippedSurfaceSelectors.flatMap((selector) =>
          [...document.querySelectorAll(selector)]
            .map((element) => ({
              selector,
              overflow: Math.max(0, element.scrollWidth - element.clientWidth),
            }))
            .filter(({ overflow }) => overflow > 1),
        );

        const isVisible = (element) => {
          if (!element) return false;
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            rect.width > 0 &&
            rect.height > 0
          );
        };
        const bounds = (element) => element?.getBoundingClientRect();
        const topbarBounds = bounds(topbar);
        const railBounds = bounds(rail);
        const heroBounds = bounds(hero);
        const contentBounds = bounds(firstContent);

        return {
          pathname: location.pathname,
          title: document.title,
          viewportWidth: root.clientWidth,
          scrollWidth: root.scrollWidth,
          horizontalOverflow: Math.max(0, root.scrollWidth - root.clientWidth),
          topbarVisible: isVisible(topbar),
          railVisible: isVisible(rail),
          mainVisible: isVisible(main),
          topbarHeight: topbarBounds?.height ?? null,
          mobileChromeBottom: Math.max(
            topbarBounds?.bottom ?? 0,
            railBounds?.bottom ?? 0,
          ),
          heroHeight: heroBounds?.height ?? null,
          contentTop: contentBounds?.top ?? null,
          cardCount: cards.length,
          groupCount: groups.length,
          labVisible: isVisible(lab),
          tabCount: tabs.length,
          scheme: root.classList.contains("dark") ? "dark" : "light",
          density: root.dataset.density,
          internallyClipped,
        };
      })()`,
    );

    const failures = [];
    if (!layout.topbarVisible || !layout.railVisible || !layout.mainVisible) {
      failures.push("required shell landmarks are not visible");
    }
    if (layout.horizontalOverflow > 1) {
      failures.push(
        `horizontal overflow is ${layout.horizontalOverflow}px at ${scenario.width}px`,
      );
    }
    if (scenario.mobile && layout.mobileChromeBottom > 200) {
      failures.push(
        `mobile shell chrome ends at ${Math.round(layout.mobileChromeBottom)}px`,
      );
    }
    if (
      layout.heroHeight === null ||
      layout.heroHeight > (scenario.mobile ? 330 : 310)
    ) {
      failures.push(
        `hero height is ${layout.heroHeight === null ? "missing" : `${Math.round(layout.heroHeight)}px`}`,
      );
    }
    const contentTopLimit =
      scenario.expected === "lab"
        ? scenario.mobile
          ? 540
          : 480
        : scenario.mobile
          ? 640
          : 520;
    if (layout.contentTop === null || layout.contentTop > contentTopLimit) {
      failures.push(
        `primary content starts at ${layout.contentTop === null ? "missing" : `${Math.round(layout.contentTop)}px`} (limit ${contentTopLimit}px)`,
      );
    }
    if (layout.internallyClipped.length > 0) {
      failures.push(
        `internally clipped surfaces: ${layout.internallyClipped
          .map(({ selector, overflow }) => `${selector} (${overflow}px)`)
          .join(", ")}`,
      );
    }
    if (layout.scheme !== scenario.scheme) {
      failures.push(
        `expected ${scenario.scheme} scheme, received ${layout.scheme}`,
      );
    }
    if (layout.density !== scenario.density) {
      failures.push(
        `expected ${scenario.density} density, received ${layout.density}`,
      );
    }
    if (
      scenario.expected === "library" &&
      (layout.cardCount !== 16 || layout.groupCount !== 3)
    ) {
      failures.push(
        `library rendered ${layout.cardCount} cards across ${layout.groupCount} groups`,
      );
    }
    if (
      scenario.expected === "lab" &&
      (!layout.labVisible || layout.tabCount !== 5)
    ) {
      failures.push(
        `assembled lab rendered visible=${layout.labVisible} tabs=${layout.tabCount}`,
      );
    }
    if (runtimeErrors.length > 0) {
      failures.push(`runtime errors: ${runtimeErrors.join(" | ")}`);
    }

    const screenshot = await client.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
    });
    const screenshotPath = path.join(outputDir, `${scenario.name}.png`);
    await writeFile(screenshotPath, Buffer.from(screenshot.data, "base64"));

    results.push({
      ...scenario,
      layout,
      failures,
      screenshot: path.basename(screenshotPath),
    });

    removeExceptionListener();
    removeConsoleListener();
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    chromePath,
    passed: results.every((result) => result.failures.length === 0),
    scenarios: results,
  };

  await writeFile(
    path.join(outputDir, "summary.json"),
    `${JSON.stringify(summary, null, 2)}\n`,
  );
  await writeFile(
    path.join(outputDir, "README.md"),
    [
      "# OpenCoven UI visual review",
      "",
      `Result: **${summary.passed ? "PASS" : "FAIL"}**`,
      "",
      "| Scenario | Viewport | Scheme | Density | Overflow | Result |",
      "|---|---:|---|---|---:|---|",
      ...results.map(
        (result) =>
          `| ${result.name} | ${result.width}×${result.height} | ${result.scheme} | ${result.density} | ${result.layout.horizontalOverflow}px | ${
            result.failures.length === 0 ? "PASS" : result.failures.join("; ")
          } |`,
      ),
      "",
      "The PNG files in this artifact are viewport receipts, not golden snapshots.",
      "",
    ].join("\n"),
  );

  const failures = results.flatMap((result) =>
    result.failures.map((failure) => `${result.name}: ${failure}`),
  );

  if (failures.length > 0) {
    throw new Error(`Visual review failed:\n- ${failures.join("\n- ")}`);
  }

  console.log(`Captured ${results.length} passing visual-review scenarios.`);
} catch (error) {
  await writeFile(
    path.join(outputDir, "chrome.log"),
    `${chromeOutput.join("")}\n`,
  );
  throw error;
} finally {
  client?.close();
  chrome.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => chrome.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 2_000)),
  ]);
  await rm(profileDir, { recursive: true, force: true }).catch(() => undefined);
}
