import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const chromePath = process.env.CHROME_PATH;
const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:4173";
const outputDir = path.resolve(
  process.env.VISUAL_OUTPUT_DIR ?? "artifacts/visual-review",
);
const debuggingPort = Number(process.env.DEVELOPER_CHROME_PORT ?? 9244);
const requestTimeoutMs = 15_000;

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
          if (!pending) return;

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

        for (const handler of this.listeners.get(message.method) ?? []) {
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
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`${method} timed out`));
      }, requestTimeoutMs);

      this.pending.set(id, {
        method,
        resolve: (value) => {
          clearTimeout(timeout);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        },
      });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  waitForEvent(method, timeoutMs = requestTimeoutMs) {
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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForJson(url, getSpawnError, timeoutMs = requestTimeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let lastError;

  while (Date.now() < deadline) {
    const spawnError = getSpawnError();
    if (spawnError) {
      throw new Error(`Chrome failed to start: ${spawnError.message}`);
    }

    try {
      const response = await globalThis.fetch(url);
      if (response.ok) return await response.json();
      lastError = new Error(`${response.status} ${response.statusText}`);
    } catch (error) {
      lastError = error;
    }

    await sleep(150);
  }

  throw new Error(
    `Chrome debugging endpoint did not become ready: ${lastError}`,
  );
}

async function waitForRender(client, selector, timeoutMs = requestTimeoutMs) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const result = await client.send("Runtime.evaluate", {
      expression: `Boolean(document.querySelector(${JSON.stringify(selector)}))`,
      returnByValue: true,
    });

    if (result.result?.value === true) return;
    await sleep(100);
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

async function waitForChildExit(child, timeoutMs = 2_000) {
  if (child.exitCode !== null || child.signalCode !== null) return true;

  return Promise.race([
    new Promise((resolve) => child.once("exit", () => resolve(true))),
    sleep(timeoutMs).then(() => false),
  ]);
}

const scenarios = [
  {
    name: "developer-dark-desktop",
    width: 1440,
    height: 1000,
    scheme: "dark",
    density: "default",
    mobile: false,
  },
  {
    name: "developer-dark-mobile",
    width: 390,
    height: 844,
    scheme: "dark",
    density: "compact",
    mobile: true,
  },
  {
    name: "developer-light-desktop",
    width: 1440,
    height: 1000,
    scheme: "light",
    density: "compact",
    mobile: false,
  },
  {
    name: "developer-dark-mobile-text-200",
    width: 390,
    height: 900,
    scheme: "dark",
    density: "default",
    mobile: true,
    textScale: 2,
  },
];

const requiredText = [
  "OpenCoven development context",
  "Coven daemon",
  "OpenCoven SDK",
  "Coven CLI",
  "coven-code runtime",
  "Read only",
  "Local authority",
  "Recent invocations",
  "receipt demo:doctor:01",
];

await mkdir(outputDir, { recursive: true });
const profileDir = await mkdtemp(
  path.join(tmpdir(), "opencoven-developer-review-"),
);
const chromeOutput = [];
let chromeOutputBytes = 0;
const captureChromeOutput = (chunk) => {
  if (chromeOutputBytes >= 1_000_000) return;
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
    `--remote-debugging-port=${debuggingPort}`,
    `--user-data-dir=${profileDir}`,
    "about:blank",
  ],
  { stdio: ["ignore", "pipe", "pipe"] },
);

chrome.stdout.on("data", captureChromeOutput);
chrome.stderr.on("data", captureChromeOutput);

let chromeSpawnError;
chrome.once("error", (error) => {
  chromeSpawnError = error;
});

let client;
const results = [];

try {
  const targets = await waitForJson(
    `http://127.0.0.1:${debuggingPort}/json/list`,
    () => chromeSpawnError,
  );
  const page = targets.find((target) => target.type === "page");
  if (!page?.webSocketDebuggerUrl) {
    throw new Error("Chrome did not expose a page debugging target");
  }

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

    try {
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
      await navigate(client, new URL("/developer", baseUrl).href);
      await waitForRender(client, '[data-slot="developer-surface"]');
      await evaluateValue(
        client,
        `(() => {
          document.documentElement.style.fontSize = ${JSON.stringify(
            scenario.textScale ? `${scenario.textScale * 100}%` : "",
          )};
        })()`,
      );
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
          const surface = document.querySelector('[data-slot="developer-surface"]');
          const connections = [...document.querySelectorAll('[data-slot="connection-status"]')];
          const receipts = [...document.querySelectorAll('[data-slot="command-receipt"]')];
          const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
          const bodyText = document.body.innerText;
          const clipped = [surface, ...connections, ...receipts]
            .filter(Boolean)
            .map((element) => ({
              slot: element.getAttribute("data-slot") ?? element.tagName.toLowerCase(),
              overflow: Math.max(0, element.scrollWidth - element.clientWidth),
            }))
            .filter(({ overflow }) => overflow > 1);
          const rect = surface?.getBoundingClientRect();
          const style = surface ? getComputedStyle(surface) : null;

          return {
            pathname: location.pathname,
            viewportWidth: root.clientWidth,
            scrollWidth: root.scrollWidth,
            horizontalOverflow: Math.max(0, root.scrollWidth - root.clientWidth),
            surfaceVisible: Boolean(
              surface &&
                style?.display !== "none" &&
                style?.visibility !== "hidden" &&
                rect?.width > 0 &&
                rect?.height > 0
            ),
            connectionCount: connections.length,
            receiptCount: receipts.length,
            requiredText: ${JSON.stringify(requiredText)}.filter(
              (text) => !bodyText.includes(text),
            ),
            fakeControls: ["Open CLI", "Inspect project"].filter((text) =>
              bodyText.includes(text),
            ),
            scheme: root.classList.contains("dark") ? "dark" : "light",
            density: root.dataset.density,
            duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index),
            internallyClipped: clipped,
            reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
          };
        })()`,
      );

      const failures = [];
      if (layout.pathname !== "/developer") {
        failures.push(`expected /developer, received ${layout.pathname}`);
      }
      if (!layout.surfaceVisible) {
        failures.push("developer surface is not visible");
      }
      if (layout.horizontalOverflow > 1) {
        failures.push(
          `horizontal overflow is ${layout.horizontalOverflow}px at ${scenario.width}px`,
        );
      }
      if (layout.internallyClipped.length > 0) {
        failures.push(
          `internally clipped surfaces: ${layout.internallyClipped
            .map(({ slot, overflow }) => `${slot} (${overflow}px)`)
            .join(", ")}`,
        );
      }
      if (layout.connectionCount !== 4) {
        failures.push(`expected 4 connections, got ${layout.connectionCount}`);
      }
      if (layout.receiptCount !== 3) {
        failures.push(`expected 3 receipts, got ${layout.receiptCount}`);
      }
      if (layout.requiredText.length > 0) {
        failures.push(`missing text: ${layout.requiredText.join(", ")}`);
      }
      if (layout.fakeControls.length > 0) {
        failures.push(`fake controls: ${layout.fakeControls.join(", ")}`);
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
      if (layout.duplicateIds.length > 0) {
        failures.push(`duplicate IDs: ${layout.duplicateIds.join(", ")}`);
      }
      if (!layout.reducedMotion) {
        failures.push("reduced-motion media query was not active");
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
    } finally {
      removeExceptionListener();
      removeConsoleListener();
    }
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    passed: results.every((result) => result.failures.length === 0),
    scenarios: results,
  };

  await writeFile(
    path.join(outputDir, "developer-review.json"),
    `${JSON.stringify(summary, null, 2)}\n`,
  );
  await writeFile(
    path.join(outputDir, "developer-review.md"),
    [
      "# OpenCoven UI developer-surface review",
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
    ].join("\n"),
  );

  const failures = results.flatMap((result) =>
    result.failures.map((failure) => `${result.name}: ${failure}`),
  );
  if (failures.length > 0) {
    throw new Error(
      `Developer visual review failed:\n- ${failures.join("\n- ")}`,
    );
  }

  console.log(
    `Captured ${results.length} passing developer-surface scenarios.`,
  );
} catch (error) {
  await writeFile(
    path.join(outputDir, "developer-chrome.log"),
    `${chromeOutput.join("")}\n`,
  );
  throw error;
} finally {
  client?.close();
  chrome.kill("SIGTERM");

  const exited = await waitForChildExit(chrome);
  if (!exited && chrome.exitCode === null && chrome.signalCode === null) {
    chrome.kill("SIGKILL");
    await waitForChildExit(chrome);
  }

  await rm(profileDir, {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 100,
  });
}
