import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";

const chromePath = process.env.CHROME_PATH;
const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:4173";
const outputDir = path.resolve(
  process.env.VISUAL_OUTPUT_DIR ?? "artifacts/visual-review",
);
const debuggingPort = Number(process.env.CHROME_DEBUGGING_PORT ?? 9222);
const selectAllModifier = process.platform === "darwin" ? 4 : 2;

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

async function waitForValue(client, expression, description) {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (await evaluateValue(client, expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  const state = await evaluateValue(
    client,
    `({
    focus: document.activeElement?.tagName,
    input: document.activeElement?.value,
    search: document.querySelector(".specimen-search input")?.value,
    cards: document.querySelectorAll(".specimen-card").length,
    active: document.activeElement?.outerHTML.slice(0, 800),
    composerDraft: document.querySelector("#composer textarea")?.value,
    menuItems: [...document.querySelectorAll('[role="menuitem"]')].map(item => ({
      text: item.textContent, focused: item === document.activeElement,
      highlighted: item.hasAttribute("data-highlighted"),
    })),
  })`,
  );
  const screenshot = await client.send("Page.captureScreenshot", {
    format: "png",
  });
  await writeFile(
    path.join(outputDir, "interaction-failure.png"),
    Buffer.from(screenshot.data, "base64"),
  );
  throw new Error(`Timed out: ${description}; ${JSON.stringify(state)}`);
}

async function clickElement(client, selector, text) {
  const deadline = Date.now() + 10_000;
  let point;
  while (Date.now() < deadline) {
    point = await evaluateValue(
      client,
      `(async () => {
      const element = [...document.querySelectorAll(${JSON.stringify(selector)})]
        .find(element => ${text ? `element.textContent.trim() === ${JSON.stringify(text)}` : "true"});
      if (!element || element.disabled) return { ready: false, reason: "unavailable or disabled" };
      element.scrollIntoView({ block: "center", inline: "nearest" });
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const bounds = element.getBoundingClientRect();
      const x = bounds.left + bounds.width / 2;
      const y = bounds.top + bounds.height / 2;
      const hit = document.elementFromPoint(x, y);
      if (!element.contains(hit)) return { ready: false, reason: "obscured", hit: hit?.className, x, y };
      return { ready: true, x, y };
    })()`,
      true,
    );
    if (point.ready) break;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  if (!point?.ready)
    throw new Error(
      `Control not clickable: ${selector} ${text ?? ""}; ${JSON.stringify(point)}`,
    );
  await client.send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    button: "left",
    clickCount: 1,
    x: point.x,
    y: point.y,
  });
  await client.send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    button: "left",
    clickCount: 1,
    x: point.x,
    y: point.y,
  });
}

async function pressKey(client, key, code, keyCode, modifiers = 0) {
  for (const type of ["keyDown", "keyUp"]) {
    await client.send("Input.dispatchKeyEvent", {
      type,
      key,
      code,
      windowsVirtualKeyCode: keyCode,
      modifiers,
      ...(code === "KeyA" &&
      modifiers === selectAllModifier &&
      type === "keyDown"
        ? { commands: ["selectAll"] }
        : {}),
    });
  }
}

async function auditInteractions(client, scenario) {
  await navigate(
    client,
    new URL("/?navigation-audit#session-header", baseUrl).href,
  );
  await waitForRender(client, "#session-header");
  await evaluateValue(
    client,
    "new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))",
    true,
  );
  await waitForValue(
    client,
    `document.querySelector('.specimen-rail__nav a[href="#session-header"]')?.getAttribute("aria-current") === "location" &&
      document.getElementById("session-header").getBoundingClientRect().top >= 0 &&
      document.getElementById("session-header").getBoundingClientRect().top < innerHeight / 2`,
    "cold component deep link",
  );
  await navigate(client, baseUrl);
  await waitForRender(client, "#component-picker");
  if (scenario.mobile) {
    await evaluateValue(
      client,
      `document.querySelector("#component-picker").focus()`,
    );
    await pressKey(client, "ArrowDown", "ArrowDown", 40);
  } else {
    await clickElement(client, '.specimen-rail__nav a[href="#mode-switch"]');
  }
  await waitForValue(
    client,
    `location.hash === "#mode-switch" &&
      document.querySelector('.specimen-rail__nav a[href="#mode-switch"]').getAttribute("aria-current") === "location"`,
    "component navigation",
  );
  await evaluateValue(
    client,
    `document.getElementById("plan-row").scrollIntoView({ block: "start" })`,
  );
  await waitForValue(
    client,
    `document.querySelector('.specimen-rail__nav a[href="#plan-row"]').getAttribute("aria-current") === "location"`,
    "scroll-synchronized component navigation",
  );
  await pressKey(client, "k", "KeyK", 75, 2);
  await waitForValue(
    client,
    `document.activeElement === document.querySelector(".specimen-search input")`,
    "search shortcut focus",
  );
  await client.send("Input.insertText", { text: "no-such-specimen" });
  await waitForRender(client, ".catalog-empty");
  await pressKey(client, "a", "KeyA", 65, selectAllModifier);
  await client.send("Input.insertText", { text: "Context meter" });
  await waitForValue(
    client,
    `document.querySelectorAll(".specimen-card").length === 1 &&
      Boolean(document.querySelector("#context-meter")) &&
      document.querySelectorAll(".specimen-rail__nav a").length === 2 &&
      document.querySelectorAll("#component-picker option").length === 2`,
    "filtered specimen",
  );
  await pressKey(client, "a", "KeyA", 65, selectAllModifier);
  await pressKey(client, "Backspace", "Backspace", 8);
  await waitForValue(
    client,
    `document.querySelectorAll(".specimen-card").length === 16`,
    "restored catalog",
  );

  await clickElement(client, ".scheme-control");
  await evaluateValue(
    client,
    'localStorage.setItem("coven-ui:density", "default")',
  );
  await navigate(client, baseUrl);
  await waitForValue(
    client,
    `!document.documentElement.classList.contains("dark") && document.documentElement.dataset.density === "compact"`,
    "persisted theme and fixed compact sizing",
  );
  await clickElement(client, ".scheme-control");

  await clickElement(client, "#composer textarea");
  await pressKey(client, "a", "KeyA", 65, selectAllModifier);
  await client.send("Input.insertText", { text: "Preserve this audit draft" });
  await clickElement(
    client,
    "#composer .specimen-view-tabs [role=tab]",
    "Source",
  );
  await waitForRender(client, "#composer .specimen-source-overlay");
  await client.send("Browser.grantPermissions", {
    origin: new URL(baseUrl).origin,
    permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"],
  });
  await clickElement(
    client,
    '#composer .specimen-source-overlay button[aria-label="Copy composer.tsx"]',
  );
  await waitForValue(
    client,
    `document.querySelector("#composer .specimen-source-overlay [role=status]")?.textContent.includes("Copied")`,
    "source copy feedback",
  );
  const copied = await evaluateValue(
    client,
    "navigator.clipboard.readText()",
    true,
  );
  const expectedSource = await readFile(
    "packages/ui/src/blocks/composer.tsx",
    "utf8",
  );
  if (copied !== expectedSource)
    throw new Error("Clipboard did not contain exact component source");
  await pressKey(client, "Escape", "Escape", 27);
  await waitForValue(
    client,
    `document.activeElement?.textContent.trim() === "Preview" && document.querySelector("#composer textarea")?.value === "Preserve this audit draft"`,
    "source Escape and draft preservation",
  );

  await clickElement(client, "#composer button", "Attach sample");
  await waitForValue(
    client,
    `document.querySelector("#composer").textContent.includes("changes.diff")`,
    "sample attachment",
  );
  await clickElement(
    client,
    '#composer button[aria-label="Remove changes.diff"]',
  );
  await clickElement(client, "#composer button", "Commands");
  await waitForRender(client, '[role="menu"]');
  await waitForValue(
    client,
    `Boolean(document.activeElement?.closest('[role="menu"]'))`,
    "command menu keyboard focus",
  );
  await pressKey(client, "End", "End", 35);
  await waitForValue(
    client,
    `document.activeElement?.getAttribute("role") === "menuitem" && document.activeElement.textContent.includes("/plan")`,
    "last command keyboard focus",
  );
  await pressKey(client, "Enter", "Enter", 13);
  await waitForValue(
    client,
    `document.querySelector("#composer textarea").value === "Plan a focused implementation"`,
    "slash command selection",
  );
  await clickElement(client, "#composer textarea");
  await pressKey(client, "Enter", "Enter", 13, 2);
  await waitForValue(
    client,
    `document.querySelector("#composer .demo-status").textContent.includes("started")`,
    "keyboard send",
  );
  await clickElement(client, "#composer button", "Stop run");
  await waitForValue(
    client,
    `document.querySelector("#composer .demo-status").textContent.includes("stopped")`,
    "stop control",
  );

  const loaded = client.waitForEvent("Page.loadEventFired");
  await clickElement(client, '.surface-switcher a[href="/lab"]');
  await loaded;
  await waitForRender(client, ".assembled-lab");
  await clickElement(client, ".assembled-lab textarea");
  await pressKey(client, "a", "KeyA", 65, selectAllModifier);
  await client.send("Input.insertText", { text: "Keep this carousel draft" });
  await clickElement(client, 'button[aria-label="Next scene"]');
  await waitForValue(
    client,
    `document.querySelector(".assembled-lab__tabs [aria-selected=true]").dataset.sceneId === "run-rail"`,
    "next scene",
  );
  await clickElement(client, 'button[aria-label="Previous scene"]');
  await waitForValue(
    client,
    `document.querySelector(".lab-scene-panel:not([hidden]) textarea")?.value === "Keep this carousel draft"`,
    "carousel draft preservation",
  );
  await clickElement(client, ".assembled-lab__tabs [data-scene-id=composer]");
  await pressKey(client, "ArrowRight", "ArrowRight", 39);
  await waitForValue(
    client,
    `document.querySelector(".assembled-lab__tabs [aria-selected=true]").dataset.sceneId === "run-rail"`,
    "keyboard scene navigation",
  );
  await clickElement(client, ".assembled-lab__tabs [data-scene-id=actions]");
  await clickElement(
    client,
    ".lab-action-grid button",
    "Attach contextA sample diff, ready to reference",
  );
  await waitForValue(
    client,
    `document.querySelector(".lab-action-result").textContent.includes("changes.diff")`,
    "action result",
  );
  await clickElement(client, ".assembled-lab__tabs [data-scene-id=cards]");
  await clickElement(client, ".lab-artifact summary");
  await waitForValue(
    client,
    `Boolean(document.querySelector(".lab-artifact details[open]"))`,
    "artifact disclosure",
  );
  await clickElement(client, ".assembled-lab__tabs [data-scene-id=actions]");
  await waitForValue(
    client,
    `document.querySelector(".lab-action-result").textContent.includes("changes.diff")`,
    "persistent action state",
  );
  return `${scenario.mobile ? "Mobile" : "Desktop"} search, preferences, clipboard, source, composer, navigation, and artifact flows passed`;
}

async function captureContactSheets(client, receipts, name) {
  const sheets = [];
  for (let offset = 0; offset < receipts.length; offset += 8) {
    const images = [];
    for (const receipt of receipts.slice(offset, offset + 8)) {
      const image = await readFile(path.join(outputDir, receipt.screenshot));
      images.push({
        label: receipt.id,
        source: `data:image/png;base64,${image.toString("base64")}`,
      });
    }
    const data = await evaluateValue(
      client,
      `(async () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1120;
      canvas.height = 1760;
      const context = canvas.getContext("2d");
      context.fillStyle = "#211a2b";
      context.fillRect(0, 0, canvas.width, canvas.height);
      const images = ${JSON.stringify(images)};
      for (let index = 0; index < images.length; index++) {
        const image = new Image();
        image.src = images[index].source;
        await image.decode();
        const scale = Math.min(544 / image.width, 400 / image.height);
        const x = (index % 2) * 560 + 8;
        const y = Math.floor(index / 2) * 440;
        context.fillStyle = "#f7f3fa";
        context.font = "16px monospace";
        context.fillText(images[index].label, x, y + 24);
        context.drawImage(image, x, y + 32, image.width * scale, image.height * scale);
      }
      return canvas.toDataURL("image/png").split(",")[1];
    })()`,
      true,
    );
    const filename = `${name}-sheet-${offset / 8 + 1}.png`;
    await writeFile(
      path.join(outputDir, filename),
      Buffer.from(data, "base64"),
    );
    sheets.push(filename);
  }
  return sheets;
}

async function auditInventory(client, scenario) {
  const items = await evaluateValue(
    client,
    `[...document.querySelectorAll(".specimen-card")].map(card => ({ id: card.id, kind: card.dataset.kind }))`,
  );
  const receipts = [];
  for (const item of items) {
    const result = await evaluateValue(
      client,
      `(async () => {
      const card = document.getElementById(${JSON.stringify(item.id)});
      card.scrollIntoView({ block: "center" });
      const frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await frame();
      const stage = card.querySelector(".specimen-stage");
      const before = { page: document.documentElement.scrollHeight, card: card.getBoundingClientRect().height, scroll: scrollY };
      const sourceTab = [...card.querySelectorAll(".specimen-view-tabs [role=tab]")].find(tab => tab.textContent.trim() === "Source");
      sourceTab.focus({ preventScroll: true });
      sourceTab.click();
      await frame();
      const overlay = card.querySelector(".specimen-source-overlay");
      const canvas = card.querySelector(".specimen-preview__canvas");
      const source = overlay.querySelector("code").textContent;
      const result = {
        source,
        stable: Math.abs(before.page - document.documentElement.scrollHeight) < 1 &&
          Math.abs(before.card - card.getBoundingClientRect().height) < 1 && Math.abs(before.scroll - scrollY) < 1,
        covers: Math.abs(overlay.getBoundingClientRect().height - canvas.getBoundingClientRect().height) < 1 &&
          card.querySelector(".specimen-live-panel").inert,
        overflow: Math.max(card.scrollWidth - card.clientWidth, stage.scrollWidth - stage.clientWidth),
      };
      const previewTab = [...card.querySelectorAll(".specimen-view-tabs [role=tab]")].find(tab => tab.textContent.trim() === "Preview");
      previewTab.focus({ preventScroll: true });
      previewTab.click();
      await frame();
      return result;
    })()`,
      true,
    );
    const expected = await readFile(
      `packages/ui/src/${item.kind}/${item.id}.tsx`,
      "utf8",
    );
    if (
      !result.stable ||
      !result.covers ||
      result.overflow > 1 ||
      result.source !== expected
    ) {
      throw new Error(
        `${scenario.name}/${item.id}: inventory mismatch ${JSON.stringify({ ...result, source: result.source.length })}`,
      );
    }
    const screenshot = `${scenario.name}-${item.id}.png`;
    const clip = await evaluateValue(
      client,
      `(() => {
      const rect = document.getElementById(${JSON.stringify(item.id)}).getBoundingClientRect();
      return { x: rect.left + scrollX, y: rect.top + scrollY, width: rect.width, height: rect.height, scale: 1 };
    })()`,
    );
    const image = await client.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: true,
      clip,
    });
    await writeFile(
      path.join(outputDir, screenshot),
      Buffer.from(image.data, "base64"),
    );
    receipts.push({
      id: item.id,
      screenshot,
      stable: result.stable,
      overflow: result.overflow,
    });
  }
  return {
    receipts,
    sheets: await captureContactSheets(client, receipts, scenario.name),
  };
}

const scenarios = [
  ...[1920, 1281, 1280, 1024, 881, 880].map((width) => ({
    name: `library-layout-${width}`,
    pathname: "/",
    width,
    height: 1000,
    scheme: "dark",
    legacyDensity: "default",
    mobile: width <= 880,
    expected: "library",
  })),
  {
    name: "library-dark-desktop",
    auditInventory: true,
    auditInteractions: true,
    pathname: "/",
    width: 1440,
    height: 1000,
    scheme: "dark",
    legacyDensity: "default",
    mobile: false,
    expected: "library",
  },
  {
    name: "library-dark-mobile",
    auditInventory: true,
    auditInteractions: true,
    pathname: "/",
    width: 390,
    height: 844,
    scheme: "dark",
    legacyDensity: "default",
    mobile: true,
    expected: "library",
  },
  {
    name: "library-cli-desktop",
    pathname: "/",
    width: 1440,
    height: 1000,
    scheme: "dark",
    legacyDensity: "default",
    mobile: false,
    expected: "library",
    revealCodeTab: "CLI",
    codeTargetId: "mode-switch",
    expectedCode:
      'pnpm dlx shadcn@latest add "https://ui.opencoven.ai/r/mode-switch.json"',
    expectedSyntaxRoles: [
      "hljs-built_in",
      "hljs-keyword",
      "hljs-title",
      "hljs-string",
    ],
  },
  {
    name: "library-react-api-desktop",
    pathname: "/",
    width: 1440,
    height: 1000,
    scheme: "light",
    legacyDensity: "compact",
    mobile: false,
    expected: "library",
    revealCodeTab: "React API",
    codeTargetId: "session-header",
    expectedCode:
      'import { SessionHeader } from "@opencoven/ui/blocks/session-header";',
    expectedSyntaxRoles: ["hljs-keyword", "hljs-string"],
  },
  {
    name: "library-react-api-mobile-text-200",
    pathname: "/",
    width: 320,
    height: 900,
    scheme: "dark",
    legacyDensity: "default",
    mobile: true,
    expected: "library",
    textScale: 2,
    revealCodeTab: "React API",
    codeTargetId: "session-header",
    expectedCode:
      'import { SessionHeader } from "@opencoven/ui/blocks/session-header";',
    expectedSyntaxRoles: ["hljs-keyword", "hljs-string"],
  },
  {
    name: "library-light-desktop",
    auditInventory: true,
    pathname: "/",
    width: 1440,
    height: 1000,
    scheme: "light",
    legacyDensity: "compact",
    mobile: false,
    expected: "library",
  },
  {
    name: "library-forced-colors-desktop",
    pathname: "/",
    width: 1440,
    height: 1000,
    scheme: "dark",
    legacyDensity: "default",
    mobile: false,
    expected: "library",
    forcedColors: true,
  },
  {
    name: "library-composer-preview",
    pathname: "/",
    width: 1440,
    height: 1000,
    scheme: "dark",
    legacyDensity: "default",
    mobile: false,
    expected: "library",
    previewTargetId: "composer",
    codeTargetId: "composer",
  },
  {
    name: "library-run-rail-preview",
    pathname: "/",
    width: 1440,
    height: 1000,
    scheme: "light",
    legacyDensity: "default",
    mobile: false,
    expected: "library",
    previewTargetId: "run-rail",
    codeTargetId: "run-rail",
    expectedRunRailColumns: 2,
  },
  {
    name: "library-composer-source",
    pathname: "/",
    width: 1440,
    height: 1000,
    scheme: "dark",
    legacyDensity: "default",
    mobile: false,
    expected: "library",
    revealSource: true,
    codeTargetId: "composer",
    expectedCode: (
      await readFile("packages/ui/src/blocks/composer.tsx", "utf8")
    ).trim(),
    expectedSyntaxRoles: ["hljs-keyword", "hljs-string", "hljs-name"],
  },
  {
    name: "library-source-mobile",
    pathname: "/",
    width: 390,
    height: 844,
    scheme: "light",
    legacyDensity: "default",
    mobile: true,
    expected: "library",
    revealSource: true,
    codeTargetId: "mode-switch",
    expectedCode: (
      await readFile("packages/ui/src/components/mode-switch.tsx", "utf8")
    ).trim(),
    expectedSyntaxRoles: ["hljs-keyword", "hljs-string", "hljs-name"],
  },
  {
    name: "library-dark-desktop-text-200",
    pathname: "/",
    width: 1280,
    height: 1000,
    scheme: "dark",
    legacyDensity: "default",
    mobile: false,
    expected: "library",
    textScale: 2,
  },
  {
    name: "assembled-dark-desktop",
    auditScenes: true,
    pathname: "/lab",
    width: 1440,
    height: 1000,
    scheme: "dark",
    legacyDensity: "default",
    mobile: false,
    expected: "lab",
    selectedScene: "run-rail",
  },
  {
    name: "assembled-dark-mobile",
    auditScenes: true,
    pathname: "/lab",
    width: 390,
    height: 844,
    scheme: "dark",
    legacyDensity: "compact",
    mobile: true,
    expected: "lab",
  },
  ...[
    {
      width: 320,
      height: 700,
      scheme: "dark",
      legacyDensity: "default",
      mobile: true,
    },
    {
      width: 390,
      height: 844,
      scheme: "light",
      legacyDensity: "default",
      mobile: true,
    },
    {
      width: 1280,
      height: 720,
      scheme: "light",
      legacyDensity: "default",
      mobile: false,
    },
    {
      width: 844,
      height: 390,
      scheme: "dark",
      legacyDensity: "compact",
      mobile: true,
    },
    {
      width: 1280,
      height: 900,
      scheme: "dark",
      legacyDensity: "default",
      mobile: false,
      textScale: 2,
    },
  ].map((scenario) => ({
    ...scenario,
    name: `assembled-${scenario.scheme}-${scenario.width}x${scenario.height}${scenario.textScale ? "-zoom" : ""}`,
    pathname: "/lab",
    expected: "lab",
  })),
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
const selectedScenarios = process.env.VISUAL_SCENARIO
  ? scenarios.filter((scenario) =>
      scenario.name.includes(process.env.VISUAL_SCENARIO),
    )
  : scenarios;
if (selectedScenarios.length === 0)
  throw new Error("No matching visual-review scenario");

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

  for (const scenario of selectedScenarios) {
    await client.send("Emulation.setEmulatedMedia", {
      features: [
        { name: "prefers-reduced-motion", value: "reduce" },
        {
          name: "forced-colors",
          value: scenario.forcedColors ? "active" : "none",
        },
      ],
    });
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
    await client.send("Emulation.setTouchEmulationEnabled", {
      enabled: scenario.mobile,
      maxTouchPoints: 1,
    });

    await navigate(client, new URL("/", baseUrl).href);
    await evaluateValue(
      client,
      `localStorage.setItem("coven-ui:scheme", ${JSON.stringify(
        scenario.scheme,
      )}); localStorage.setItem("coven-ui:density", ${JSON.stringify(
        scenario.legacyDensity,
      )});`,
    );
    await navigate(client, new URL(scenario.pathname, baseUrl).href);
    await waitForRender(client, "#specimen-main");
    await evaluateValue(
      client,
      `document.documentElement.style.fontSize = ${JSON.stringify(
        scenario.textScale ? `${scenario.textScale * 100}%` : "",
      )};`,
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
    let sourceLayoutBefore;
    if (scenario.revealSource) {
      sourceLayoutBefore = await evaluateValue(
        client,
        `(async () => {
        const card = document.getElementById(${JSON.stringify(scenario.codeTargetId)});
        card.scrollIntoView({ block: "center" });
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const before = {
          pageHeight: document.documentElement.scrollHeight,
          cardHeight: card.getBoundingClientRect().height,
          scrollY,
        };
        [...card.querySelectorAll(".specimen-view-tabs [role=tab]")].find(tab => tab.textContent.trim() === "Source").click();
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return before;
      })()`,
        true,
      );
    } else if (scenario.revealCodeTab) {
      await evaluateValue(
        client,
        `(async () => {
          const card = document.getElementById(${JSON.stringify(
            scenario.codeTargetId,
          )});
          const codeTab = card
            ? [...card.querySelectorAll('[role="tab"]')].find(
                (tab) =>
                  tab.textContent?.trim() === ${JSON.stringify(
                    scenario.revealCodeTab,
                  )},
              )
            : null;
          if (!codeTab) throw new Error("Requested code tab is missing");
          const tabList = codeTab.closest('[data-slot="tabs-list"]');
          if (${Boolean(scenario.expectScrollableCodeTabs)} && tabList) {
            codeTab.scrollIntoView({ block: "nearest", inline: "nearest" });
            await new Promise((resolve) => requestAnimationFrame(resolve));
          }
          codeTab.click();
          card.scrollIntoView({ block: "center" });
          await new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          );
          return true;
        })()`,
        true,
      );
    } else if (scenario.previewTargetId) {
      await evaluateValue(
        client,
        `(async () => {
          document.getElementById(${JSON.stringify(scenario.previewTargetId)}).scrollIntoView({ block: "center" });
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        })()`,
        true,
      );
    }

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
        const topbarControls = [
          ...document.querySelectorAll(
            ".specimen-brand, .surface-switcher, .specimen-search, .scheme-control",
          ),
        ];
        const codeCard = document.getElementById(${JSON.stringify(
          scenario.codeTargetId ?? "mode-switch",
        )});
        const codeScope = ${Boolean(scenario.revealSource)} ? codeCard?.querySelector(".specimen-source-overlay") : codeCard;
        const codeSnippets = codeScope
          ? [...codeScope.querySelectorAll(".specimen-code-snippet")]
          : [];
        const codeCommands = codeScope
          ? [...codeScope.querySelectorAll(".specimen-command")]
          : [];
        const syntaxTokens = codeScope
          ? [...codeScope.querySelectorAll('[class^="hljs-"]')]
          : [];
        const codeTabList = codeCard?.querySelector('.specimen-code-tabs');
        const activeCodeTab = codeTabList?.querySelector(
          '[role="tab"][aria-selected="true"]',
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
        const intersects = (left, right) =>
          left.left < right.right &&
          left.right > right.left &&
          left.top < right.bottom &&
          left.bottom > right.top;
        const topbarBounds = bounds(topbar);
        const railBounds = bounds(rail);
        const heroBounds = bounds(hero);
        const contentBounds = bounds(firstContent);
        const visibleTopbarControls = topbarControls
          .filter(isVisible)
          .map((element) => ({
            label: element.className,
            bounds: element.getBoundingClientRect(),
          }));
        const topbarOverlaps = visibleTopbarControls.flatMap(
          (control, index) =>
            visibleTopbarControls
              .slice(index + 1)
              .filter((candidate) =>
                intersects(control.bounds, candidate.bounds),
              )
              .map(
                (candidate) => control.label + " / " + candidate.label,
              ),
        );
        const visibleCodeSnippets = codeSnippets.filter(isVisible);
        const visibleCodeCommands = codeCommands.filter(isVisible);
        const visibleSyntaxTokens = syntaxTokens.filter(isVisible);
        const codeTabListBounds = bounds(codeTabList);
        const activeCodeTabBounds = bounds(activeCodeTab);

        return {
          pathname: location.pathname,
          title: document.title,
          viewportWidth: root.clientWidth,
          scrollWidth: root.scrollWidth,
          horizontalOverflow: Math.max(0, root.scrollWidth - root.clientWidth),
          verticalOverflow: Math.max(0, root.scrollHeight - innerHeight),
          pageHeight: root.scrollHeight,
          sourceCardHeight: codeCard?.getBoundingClientRect().height,
          scrollY,
          sourceCoversPreview: (() => {
            const overlay = codeCard?.querySelector(".specimen-source-overlay");
            const canvas = codeCard?.querySelector(".specimen-preview__canvas");
            if (!overlay || !canvas) return false;
            const a = overlay.getBoundingClientRect();
            const b = canvas.getBoundingClientRect();
            const live = codeCard.querySelector(".specimen-live-panel");
            const samplePoints = [
              [a.left + 8, a.top + 8], [a.right - 8, a.top + 8],
              [a.left + 8, a.bottom - 8], [a.right - 8, a.bottom - 8],
              [a.left + a.width / 2, a.top + a.height / 2],
            ];
            return ["top","left","width","height"].every(key => Math.abs(a[key] - b[key]) < 1) &&
              live.inert && live.getAttribute("aria-hidden") === "true" &&
              samplePoints.every(([x, y]) => overlay.contains(document.elementFromPoint(x, y)));
          })(),
          sourceDimensions: (() => {
            const overlay = codeCard?.querySelector(".specimen-source-overlay");
            const canvas = codeCard?.querySelector(".specimen-preview__canvas");
            const live = codeCard?.querySelector(".specimen-live-panel");
            return overlay && canvas ? {
              overlay: overlay.getBoundingClientRect().toJSON(),
              canvas: canvas.getBoundingClientRect().toJSON(),
              visibility: getComputedStyle(live).visibility,
              inert: live.inert,
              ariaHidden: live.getAttribute("aria-hidden"),
              inlineStyle: live.getAttribute("style"),
            } : null;
          })(),
          previewVisible: isVisible(codeCard?.querySelector(".specimen-preview")),
          logoMask: getComputedStyle(document.querySelector(".specimen-brand__mark > span")).maskImage,
          topbarVisible: isVisible(topbar),
          railVisible: isVisible(rail),
          catalogLayout: (() => {
            const inner = document.querySelector(".specimen-main__inner");
            const style = getComputedStyle(inner);
            const links = [...document.querySelectorAll(".specimen-rail__nav a")];
            const options = [...document.querySelectorAll("#component-picker option")];
            return {
              shellWidth: bounds(document.querySelector(".specimen-shell"))?.width,
              topbarWidth: bounds(document.querySelector(".specimen-topbar__inner"))?.width,
              railWidth: railBounds?.width,
              mainWidth: bounds(main)?.width,
              contentWidth: bounds(inner)?.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
              tocWidth: bounds(document.querySelector(".specimen-toc"))?.width,
              desktopNavVisible: isVisible(document.querySelector(".specimen-rail__nav")),
              pickerVisible: isVisible(document.querySelector("#component-picker")),
              links: links.map(link => link.getAttribute("href").slice(1)),
              options: options.map(option => option.value),
              expectedIds: ["library-overview", ...cards.map(card => card.id)],
              validTargets: [...links, ...document.querySelectorAll(".specimen-toc a")].every(link => document.getElementById(link.getAttribute("href").slice(1))),
            };
          })(),
          mainVisible: isVisible(main),
          topbarHeight: topbarBounds?.height ?? null,
          mobileChromeBottom: Math.max(
            topbarBounds?.bottom ?? 0,
            railBounds?.bottom ?? 0,
          ),
          heroHeight: heroBounds?.height ?? null,
          contentTop: contentBounds?.top ?? null,
          cardCount: cards.length,
          stateFooterCount: document.querySelectorAll(".specimen-states").length,
          libraryColumns: [...document.querySelectorAll(".specimen-grid")].map(grid => getComputedStyle(grid).gridTemplateColumns.split(" ").length),
          runRailColumns: (() => {
            const rail = codeCard?.querySelector('.specimen-stage > [data-slot="run-rail"]');
            return rail ? getComputedStyle(rail).gridTemplateColumns.split(" ").length : null;
          })(),
          statesTabCount: [...document.querySelectorAll(".specimen-card [role=tab]")].filter(tab => tab.textContent.trim() === "States").length,
          brandAction: getComputedStyle(root).getPropertyValue("--oc-action").trim(),
          brandSpacing: getComputedStyle(root).getPropertyValue("--oc-space-6").trim(),
          displayFont: getComputedStyle(document.querySelector("h1")).fontFamily,
          forcedSelectionVisible: (() => {
            const tab = document.querySelector(".specimen-view-tabs [aria-selected=true]");
            if (!tab) return false;
            const style = getComputedStyle(tab);
            return style.outlineStyle === "solid" && parseFloat(style.outlineWidth) >= 2;
          })(),
          groupCount: groups.length,
          labVisible: isVisible(lab),
          tabCount: tabs.length,
          scheme: root.classList.contains("dark") ? "dark" : "light",
          density: root.dataset.density,
          densityControls: document.querySelectorAll('.density-control, [aria-label="Display density"]').length,
          densityLabels: [...document.querySelectorAll(".specimen-stats dt")].some(label => /densit|compact|cozy/i.test(label.textContent)),
          codeSnippetCount: visibleCodeSnippets.length,
          codeCommandTexts: visibleCodeCommands.map((command) =>
            command.textContent?.trim(),
          ),
          maxCodeCommandOverflow: Math.max(
            0,
            ...visibleCodeCommands.map((command) =>
              Math.max(0, command.scrollWidth - command.clientWidth),
            ),
          ),
          syntaxRoles: [
            ...new Set(
              visibleSyntaxTokens.flatMap((token) =>
                [...token.classList].filter((name) =>
                  name.startsWith("hljs-"),
                ),
              ),
            ),
          ].sort(),
          syntaxTokenCount: visibleSyntaxTokens.length,
          codeTabListOverflow: codeTabList
            ? Math.max(0, codeTabList.scrollWidth - codeTabList.clientWidth)
            : null,
          activeCodeTabFullyVisible:
            codeTabListBounds && activeCodeTabBounds
              ? activeCodeTabBounds.left >= codeTabListBounds.left - 1 &&
                activeCodeTabBounds.right <= codeTabListBounds.right + 1
              : null,
          topbarOverlaps,
          internallyClipped,
        };
      })()`,
    );
    layout.stickyRailClearance = await evaluateValue(
      client,
      `(async () => {
        const topbar = document.querySelector(".specimen-topbar");
        const rail = document.querySelector(".specimen-rail");
        const initialScrollY = scrollY;
        scrollTo(0, Math.min(500, document.documentElement.scrollHeight - innerHeight));
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        );
        const clearance =
          rail && topbar
            ? rail.getBoundingClientRect().top -
              topbar.getBoundingClientRect().bottom
            : null;
        scrollTo(0, initialScrollY);
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        );
        return clearance;
      })()`,
      true,
    );

    const failures = [];
    if (scenario.expected === "library") {
      const nav = layout.catalogLayout;
      const desktop = layout.viewportWidth > 880;
      const context = layout.viewportWidth > 1280;
      const shellWidth = Math.min(layout.viewportWidth, 1680);
      const railWidth = context ? 248 : desktop ? 232 : shellWidth;
      const mainWidth = desktop
        ? shellWidth - railWidth - (context ? 216 : 0)
        : shellWidth;
      const contentWidth =
        mainWidth - 2 * Math.min(72, Math.max(24, scenario.width * 0.05));
      if (
        Math.abs(nav.shellWidth - shellWidth) > 1 ||
        Math.abs(nav.topbarWidth - shellWidth) > 1 ||
        Math.abs(nav.railWidth - railWidth) > 1 ||
        Math.abs(nav.mainWidth - mainWidth) > 1 ||
        (desktop && Math.abs(nav.contentWidth - contentWidth) > 1) ||
        nav.tocWidth !== (context ? 216 : 0)
      ) {
        failures.push(`original layout mismatch: ${JSON.stringify(nav)}`);
      }
      if (
        nav.desktopNavVisible !== desktop ||
        nav.pickerVisible === desktop ||
        !nav.validTargets ||
        JSON.stringify(nav.links) !== JSON.stringify(nav.expectedIds) ||
        JSON.stringify(nav.options) !== JSON.stringify(nav.expectedIds)
      ) {
        failures.push(
          `incomplete or inconsistent component navigation: ${JSON.stringify(nav)}`,
        );
      }
    }
    if (scenario.forcedColors && !layout.forcedSelectionVisible) {
      failures.push("selected preview tab loses its forced-colors indicator");
    }
    if (
      scenario.expectedRunRailColumns &&
      layout.runRailColumns !== scenario.expectedRunRailColumns
    ) {
      failures.push("run rail does not use the available preview width");
    }
    if (
      layout.brandAction !==
        (scenario.scheme === "dark" ? "#8e3dff" : "#7a22ee") ||
      layout.brandSpacing !== "1.5rem" ||
      !layout.displayFont.startsWith("Geist")
    ) {
      failures.push(
        `canonical brand mismatch: ${layout.brandAction}, ${layout.brandSpacing}, ${layout.displayFont}`,
      );
    }
    if (
      !layout.topbarVisible ||
      (scenario.expected !== "lab" && !layout.railVisible) ||
      !layout.mainVisible
    ) {
      failures.push("required shell landmarks are not visible");
    }
    if (layout.horizontalOverflow > 1) {
      failures.push(
        `horizontal overflow is ${layout.horizontalOverflow}px at ${scenario.width}px`,
      );
    }
    if (layout.topbarOverlaps.length > 0) {
      failures.push(
        `overlapping topbar controls: ${layout.topbarOverlaps.join(", ")}`,
      );
    }
    if (
      (scenario.revealCodeTab || scenario.revealSource) &&
      (layout.codeSnippetCount !== 1 ||
        layout.syntaxTokenCount < 3 ||
        !layout.previewVisible ||
        layout.maxCodeCommandOverflow > 1 ||
        !layout.codeCommandTexts.includes(scenario.expectedCode) ||
        !scenario.expectedSyntaxRoles.every((role) =>
          layout.syntaxRoles.includes(role),
        ) ||
        (scenario.expectScrollableCodeTabs &&
          (layout.codeTabListOverflow === null ||
            layout.codeTabListOverflow <= 1 ||
            !layout.activeCodeTabFullyVisible)))
    ) {
      failures.push(
        `code panel=${scenario.revealCodeTab} snippets=${layout.codeSnippetCount} syntaxTokens=${layout.syntaxTokenCount} commandOverflow=${layout.maxCodeCommandOverflow}px tabOverflow=${layout.codeTabListOverflow}px activeTabVisible=${layout.activeCodeTabFullyVisible} commands=${layout.codeCommandTexts.join(" | ")} roles=${layout.syntaxRoles.join(",")}`,
      );
    }
    if (
      sourceLayoutBefore &&
      (Math.abs(layout.pageHeight - sourceLayoutBefore.pageHeight) > 1 ||
        Math.abs(layout.sourceCardHeight - sourceLayoutBefore.cardHeight) > 1 ||
        Math.abs(layout.scrollY - sourceLayoutBefore.scrollY) > 1 ||
        !layout.sourceCoversPreview)
    ) {
      failures.push(
        `source changed layout: before=${JSON.stringify(sourceLayoutBefore)} after=${JSON.stringify(
          {
            pageHeight: layout.pageHeight,
            cardHeight: layout.sourceCardHeight,
            scrollY: layout.scrollY,
            coversPreview: layout.sourceCoversPreview,
            dimensions: layout.sourceDimensions,
          },
        )}`,
      );
    }
    if (
      scenario.expected !== "lab" &&
      layout.viewportWidth > 880 &&
      (layout.stickyRailClearance === null || layout.stickyRailClearance < -1)
    ) {
      failures.push(
        `sticky rail clearance is ${layout.stickyRailClearance ?? "missing"}px`,
      );
    }
    if (
      scenario.mobile &&
      !scenario.textScale &&
      layout.mobileChromeBottom > 200
    ) {
      failures.push(
        `mobile shell chrome ends at ${Math.round(layout.mobileChromeBottom)}px`,
      );
    }
    if (
      !scenario.textScale &&
      (layout.heroHeight === null ||
        layout.heroHeight > (scenario.mobile ? 330 : 310))
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
        : scenario.width <= 1088
          ? 640
          : 520;
    if (
      !scenario.textScale &&
      (layout.contentTop === null || layout.contentTop > contentTopLimit)
    ) {
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
    if (
      layout.density !== "compact" ||
      layout.densityControls ||
      layout.densityLabels
    ) {
      failures.push(
        `expected fixed compact sizing without controls or labels, received ${layout.density}`,
      );
    }
    if (
      scenario.expected === "library" &&
      (layout.cardCount !== 16 ||
        layout.groupCount !== 3 ||
        layout.stateFooterCount !== 16 ||
        layout.statesTabCount !== 0 ||
        layout.libraryColumns.some((count) => count !== 1))
    ) {
      failures.push(
        `library rendered ${layout.cardCount} cards across ${layout.groupCount} groups`,
      );
    }
    if (
      scenario.expected === "lab" &&
      (!layout.labVisible ||
        layout.tabCount !== 6 ||
        layout.verticalOverflow > 1)
    ) {
      failures.push(
        `assembled lab rendered visible=${layout.labVisible} tabs=${layout.tabCount} page overflow=${layout.verticalOverflow}px`,
      );
    }
    if (!layout.logoMask.includes("opencoven-mark.svg")) {
      failures.push("canonical OpenCoven mark is missing");
    }
    if (scenario.expected === "lab") {
      const sceneResults = await evaluateValue(
        client,
        `(async () => {
        const results = [];
        const tabs = [...document.querySelectorAll(".assembled-lab__tabs [role=tab]")];
        for (const tab of tabs) {
          tab.click();
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          const panels = [...document.querySelectorAll(".lab-scene-panel:not([hidden])")];
          const panel = panels[0];
          const nav = document.querySelector(".assembled-lab__nav").getBoundingClientRect();
          const bounds = panel?.getBoundingClientRect();
          results.push({
            scene: tab.textContent.trim(),
            panels: panels.length,
            selected: tab.getAttribute("aria-selected"),
            pageOverflow: document.documentElement.scrollHeight - innerHeight,
            horizontalOverflow: panel ? panel.scrollWidth - panel.clientWidth : -1,
            panelHeight: bounds?.height ?? 0,
            panelOverflow: panel ? panel.scrollHeight - panel.clientHeight : -1,
            navVisible: nav.top >= 0 && nav.bottom <= innerHeight,
          });
        }
        tabs.find(tab => tab.getAttribute("data-scene-id") === ${JSON.stringify(scenario.selectedScene ?? "composer")})?.click();
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return results;
      })()`,
        true,
      );
      layout.scenes = sceneResults;
      if (scenario.auditScenes) {
        const receipts = [];
        for (const scene of sceneResults) {
          await evaluateValue(
            client,
            `(async () => {
            [...document.querySelectorAll(".assembled-lab__tabs [role=tab]")]
              .find(tab => tab.textContent.trim() === ${JSON.stringify(scene.scene)}).click();
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          })()`,
            true,
          );
          const screenshot = `${scenario.name}-${scene.scene.toLowerCase().replaceAll(" ", "-")}.png`;
          const image = await client.send("Page.captureScreenshot", {
            format: "png",
            fromSurface: true,
            captureBeyondViewport: false,
          });
          await writeFile(
            path.join(outputDir, screenshot),
            Buffer.from(image.data, "base64"),
          );
          receipts.push({ id: scene.scene, screenshot });
        }
        layout.sceneSheets = await captureContactSheets(
          client,
          receipts,
          scenario.name,
        );
        await evaluateValue(
          client,
          `document.querySelector('.assembled-lab__tabs [data-scene-id="${scenario.selectedScene ?? "composer"}"]').click()`,
        );
      }
      for (const scene of sceneResults) {
        if (
          scene.panels !== 1 ||
          scene.selected !== "true" ||
          scene.pageOverflow > 1 ||
          scene.horizontalOverflow > 1 ||
          scene.panelHeight < 80 ||
          !scene.navVisible ||
          (!scenario.mobile && !scenario.textScale && scene.panelOverflow > 1)
        ) {
          failures.push(`scene layout: ${JSON.stringify(scene)}`);
        }
      }
      if (scenario.width === 390 && scenario.scheme === "dark") {
        const swipeTarget = await evaluateValue(
          client,
          `(() => {
            const viewport = document.querySelector(".lab-carousel__viewport").getBoundingClientRect();
            return { x: viewport.right - 30, y: viewport.top + 15 };
          })()`,
        );
        await client.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [swipeTarget],
        });
        await client.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: swipeTarget.x - 120, y: swipeTarget.y }],
        });
        await client.send("Input.dispatchTouchEvent", {
          type: "touchEnd",
          touchPoints: [],
        });
        await evaluateValue(
          client,
          `new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))`,
          true,
        );
        const swipedScene = await evaluateValue(
          client,
          `document.querySelector(".assembled-lab__tabs [aria-selected=true]")?.textContent.trim()`,
        );
        if (swipedScene !== "Run rail")
          failures.push(`touch swipe selected ${swipedScene}`);
        await evaluateValue(
          client,
          `document.querySelector(".assembled-lab__tabs [data-scene-id=composer]").click()`,
        );
      }
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

    if (scenario.auditInventory) {
      layout.inventory = await auditInventory(client, scenario);
    }
    if (scenario.auditInteractions) {
      layout.interactions = await auditInteractions(client, scenario);
    }
    if (
      runtimeErrors.length > 0 &&
      failures.every((failure) => !failure.startsWith("runtime errors:"))
    ) {
      failures.push(`runtime errors: ${runtimeErrors.join(" | ")}`);
    }

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
          `| ${result.name} | ${result.width}×${result.height} | ${result.scheme} | ${result.layout.density} | ${result.layout.horizontalOverflow}px | ${
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
