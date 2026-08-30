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
const requestTimeoutMs = 15_000;

if (!chromePath) {
  throw new Error("CHROME_PATH is required");
}

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
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForChildExit(child, timeoutMs = 2_000) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return true;
  }

  return Promise.race([
    new Promise((resolve) => child.once("exit", () => resolve(true))),
    sleep(timeoutMs).then(() => false),
  ]);
}

const profile = await mkdtemp(path.join(tmpdir(), "opencoven-mobile-quality-"));
await mkdir(outputDir, { recursive: true });

const chromeOutput = [];
let chromeOutputBytes = 0;
const captureChromeOutput = (chunk) => {
  if (chromeOutputBytes >= 1_000_000) {
    return;
  }

  const text = String(chunk);
  chromeOutputBytes += Buffer.byteLength(text);
  chromeOutput.push(text);
};

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
  { stdio: ["ignore", "pipe", "pipe"] },
);

chrome.stdout?.on("data", captureChromeOutput);
chrome.stderr?.on("data", captureChromeOutput);

let chromeSpawnError;
chrome.once("error", (error) => {
  chromeSpawnError = error;
});

let socket;
const pending = new Map();
const listeners = new Map();

const rejectPending = (error) => {
  for (const waiter of pending.values()) {
    waiter.reject(error);
  }
  pending.clear();
};

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

try {
  let target;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (chromeSpawnError) {
      throw new Error(`Chrome failed to start: ${chromeSpawnError.message}`);
    }

    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const targets = await response.json();
      target = targets.find((entry) => entry.type === "page");
      if (target?.webSocketDebuggerUrl) {
        break;
      }
    } catch {}

    await sleep(100);
  }

  if (!target?.webSocketDebuggerUrl) {
    throw new Error("Chrome debugging target unavailable");
  }

  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(String(event.data));

    if (message.id) {
      const waiter = pending.get(message.id);
      if (!waiter) {
        return;
      }

      pending.delete(message.id);
      if (message.error) {
        waiter.reject(new Error(message.error.message ?? "CDP request failed"));
      } else {
        waiter.resolve(message.result ?? {});
      }
      return;
    }

    const handlers = listeners.get(message.method) ?? [];
    for (const handler of handlers) {
      handler(message.params ?? {});
    }
  });
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

  let id = 0;
  const send = (method, params = {}) => {
    if (socket.readyState !== WebSocket.OPEN) {
      throw new Error("Chrome DevTools connection is not open");
    }

    return new Promise((resolve, reject) => {
      const requestId = ++id;
      const timeout = setTimeout(() => {
        pending.delete(requestId);
        reject(new Error(`${method} timed out`));
      }, requestTimeoutMs);

      pending.set(requestId, {
        resolve: (value) => {
          clearTimeout(timeout);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        },
      });
      socket.send(JSON.stringify({ id: requestId, method, params }));
    });
  };

  const waitForEvent = (method, timeoutMs = requestTimeoutMs) =>
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

  const navigate = async (url) => {
    const loaded = waitForEvent("Page.loadEventFired");
    const response = await send("Page.navigate", { url });
    if (response.errorText) {
      throw new Error(`Navigation failed: ${response.errorText}`);
    }
    await loaded;
  };

  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
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
  };

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });

  const results = [];

  for (const scenario of cases) {
    const runtimeErrors = [];
    const removeExceptionListener = on(
      "Runtime.exceptionThrown",
      ({ exceptionDetails }) => {
        runtimeErrors.push(
          exceptionDetails.exception?.description ??
            exceptionDetails.text ??
            "Uncaught runtime exception",
        );
      },
    );
    const removeConsoleListener = on(
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

    try {
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
        const overflowingElements = [...document.querySelectorAll("body *")]
          .map((element) => {
            const bounds = rect(element);
            const overflow = bounds
              ? Math.max(0, -bounds.left, bounds.right - root.clientWidth)
              : 0;
            const label = [
              element.tagName.toLowerCase(),
              element.id ? `#${element.id}` : "",
              ...[...element.classList].slice(0, 3).map((name) => `.${name}`),
            ].join("");
            return { label, overflow };
          })
          .filter(({ overflow }) => overflow > 1)
          .sort((left, right) => right.overflow - left.overflow)
          .slice(0, 5);

        return {
          viewport: root.clientWidth,
          documentOverflow: Math.max(0, root.scrollWidth - root.clientWidth),
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
          overflowingElements,
        };
      })()`);

      const failures = [];

      if (measurement.cardCount !== 16) {
        failures.push(`expected 16 cards, got ${measurement.cardCount}`);
      }
      if (
        measurement.tabRootCount !== measurement.cardCount ||
        measurement.tabListCount !== measurement.cardCount ||
        measurement.activePanelCount !== measurement.cardCount
      ) {
        failures.push(
          `incomplete card tabs: roots=${measurement.tabRootCount} lists=${measurement.tabListCount} panels=${measurement.activePanelCount}`,
        );
      }
      if (measurement.documentOverflow > 1) {
        const offenders = measurement.overflowingElements
          .map(({ label, overflow }) => `${label} (${overflow}px)`)
          .join(", ");
        failures.push(
          `document overflow ${measurement.documentOverflow}px${
            offenders ? `; offenders: ${offenders}` : ""
          }`,
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
      if (
        measurement.minTabHeight === null ||
        measurement.minTabHeight < 44 ||
        measurement.tabTargetCount === 0
      ) {
        failures.push(
          `tab targets are missing or below 44px (count=${measurement.tabTargetCount}, min=${measurement.minTabHeight})`,
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
      if (runtimeErrors.length > 0) {
        failures.push(`runtime errors: ${runtimeErrors.join(" | ")}`);
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
    } finally {
      removeExceptionListener();
      removeConsoleListener();
    }
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl,
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
          `| ${entry.name} | ${entry.width}px | ${entry.measurement.documentOverflow}px | ${entry.measurement.maxStageOverflow}px | ${entry.measurement.minTabHeight ?? "missing"}px | ${entry.failures.length ? entry.failures.join("; ") : "PASS"} |`,
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

  console.log(`Captured ${results.length} passing mobile-quality scenarios.`);
} catch (error) {
  await writeFile(
    path.join(outputDir, "chrome.log"),
    `${chromeOutput.join("")}\n`,
  );
  throw error;
} finally {
  socket?.close();
  chrome.kill("SIGTERM");

  const exited = await waitForChildExit(chrome);
  if (!exited && chrome.exitCode === null && chrome.signalCode === null) {
    chrome.kill("SIGKILL");
    await waitForChildExit(chrome);
  }

  await rm(profile, {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 100,
  });
}
