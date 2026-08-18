# Components Messages Editorial State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Messages specimen's generic bubble with the approved identity-led editorial turn while preserving every other component state and interaction.

**Architecture:** Keep the self-contained single-file artifact architecture. Add Messages-only CSS classes beside the existing message styles, replace only `views.messages.render`, and verify through direct DOM assertions plus fresh desktop/mobile renders.

**Tech Stack:** HTML5, CSS, vanilla JavaScript, Node.js, Playwright

---

## File structure

- Modify: `Components.dc.html` — owns all component-browser markup, styles, view data, and interaction.
- Create: `artifacts/Components-messages-editorial-preview.png` — fresh 1200x800 visual receipt with Messages selected.
- Create: `artifacts/Components-messages-editorial-mobile.png` — fresh 390x844 responsive receipt with Messages selected.
- Reference: `docs/superpowers/specs/2026-08-17-components-messages-editorial-state-design.md` — approved behavior and visual contract.
- Update: `handoffs/components-visual-refinement.md` — terminal receipt with changed paths, commands, and results.

### Task 1: Pin the approved Messages markup contract

**Files:**
- Test: `Components.dc.html`

- [x] **Step 1: Run a failing source-contract assertion**

Run:

```bash
node - <<'NODE'
const fs = require("fs");
const html = fs.readFileSync("Components.dc.html", "utf8");
for (const marker of [
  'class="sample message-editorial"',
  'class="message-editorial__rule"',
  'class="message-editorial__identity"',
  'CODE FAMILIAR · GPT-5.6 SOL · NOW',
  'class="message-editorial__response"',
  'class="message-editorial__utilities"',
]) {
  if (!html.includes(marker)) throw new Error(`missing ${marker}`);
}
NODE
```

Expected: FAIL with `missing class="sample message-editorial"`.

- [x] **Step 2: Replace the Messages render template**

In `Components.dc.html`, replace the current `views.messages.render` template with:

```js
render: () => `
  <article class="sample message-editorial">
    <div class="message-editorial__rule" aria-hidden="true"></div>
    <header class="message-editorial__header">
      <div class="avatar" aria-hidden="true">CO</div>
      <div class="message-editorial__identity">
        <strong>Cody</strong>
        <span>CODE FAMILIAR · GPT-5.6 SOL · NOW</span>
      </div>
    </header>
    <p class="message-editorial__response">
      The composer state is now explicit. Model selection, linked context, and send readiness remain visible without interrupting the writing flow.
    </p>
    <div class="message-editorial__utilities" aria-label="Message utilities">
      <span>Reply</span>
      <span>Copy</span>
      <span>1.8K tokens</span>
    </div>
  </article>`
```

- [x] **Step 3: Re-run the source-contract assertion**

Run the command from Step 1.

Expected: exit 0 with no output.

### Task 2: Implement the editorial hierarchy

**Files:**
- Modify: `Components.dc.html:520-572`

- [x] **Step 1: Replace obsolete bubble-only styles**

Replace `.message`, `.message-card`, `.message-meta`, and `.message-card p` with:

```css
.message-editorial {
  max-width: 500px;
  color: var(--text-secondary);
}

.message-editorial__rule {
  height: 1px;
  margin-bottom: 18px;
  background: linear-gradient(90deg, var(--accent) 0 42px, var(--line) 42px);
}

.message-editorial__header {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
}

.message-editorial__identity {
  display: grid;
  gap: 4px;
}

.message-editorial__identity strong {
  color: var(--text);
  font-size: 12px;
  font-weight: 650;
}

.message-editorial__identity span {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 7.5px;
  letter-spacing: 0.07em;
}

.message-editorial__response {
  margin: 14px 0 0 46px;
  color: color-mix(in srgb, var(--text) 78%, var(--text-secondary));
  font-family: Georgia, "Times New Roman", serif;
  font-size: 15px;
  line-height: 1.65;
}

.message-editorial__utilities {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin: 14px 0 0 46px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 7.5px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}
```

Keep `.avatar` unchanged because it is shared by the approved identity treatment.

- [x] **Step 2: Parse the embedded JavaScript**

Run:

```bash
node - <<'NODE'
const fs = require("fs");
const html = fs.readFileSync("Components.dc.html", "utf8");
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
if (scripts.length !== 1) throw new Error(`expected one script, found ${scripts.length}`);
new Function(scripts[0][1]);
console.log("Embedded JavaScript parses");
NODE
```

Expected: `Embedded JavaScript parses`.

- [x] **Step 3: Check scope preservation**

Run:

```bash
node - <<'NODE'
const fs = require("fs");
const html = fs.readFileSync("Components.dc.html", "utf8");
for (const view of ["composer", "messages", "context", "actions"]) {
  if (!html.includes(`data-view="${view}"`)) throw new Error(`missing ${view} navigation`);
}
for (const title of ["Composer controls", "Message surfaces", "Context rows", "Action menu"]) {
  if (!html.includes(title)) throw new Error(`missing ${title}`);
}
console.log("All four component states remain present");
NODE
```

Expected: `All four component states remain present`.

### Task 3: Verify interaction and responsive behavior

**Files:**
- Test: `Components.dc.html`

- [x] **Step 1: Run the four-view Playwright check**

Run:

```bash
node - <<'NODE'
const { chromium } = require("/Users/buns/Documents/GitHub/OpenCoven/coven-cave/node_modules/@playwright/test");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const desktop = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await desktop.goto("file:///Users/buns/.coven/workspaces/familiars/cody/Components.dc.html");
  const expected = {
    composer: ["Composer controls", "CHAT·01"],
    messages: ["Message surfaces", "CHAT·02"],
    context: ["Context rows", "CHAT·03"],
    actions: ["Action menu", "CHAT·04"],
  };
  for (const [view, [title, code]] of Object.entries(expected)) {
    await desktop.click(`[data-view="${view}"]`);
    if (await desktop.textContent("#view-title") !== title) throw new Error(`${view} title failed`);
    if (await desktop.textContent("#stage-code") !== code) throw new Error(`${view} code failed`);
    if (await desktop.locator(".anatomy-label").count() !== 3) throw new Error(`${view} anatomy failed`);
  }
  await desktop.click('[data-view="messages"]');
  if (await desktop.locator(".message-editorial").count() !== 1) throw new Error("editorial message missing");
  if (await desktop.locator(".message-card").count() !== 0) throw new Error("legacy message card remains");

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto("file:///Users/buns/.coven/workspaces/familiars/cody/Components.dc.html");
  await mobile.click('[data-view="messages"]');
  const overflow = await mobile.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  if (overflow) throw new Error("mobile horizontal overflow");
  console.log("Messages editorial state and all four views verified");
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
NODE
```

Expected: `Messages editorial state and all four views verified`.

- [x] **Step 2: Verify keyboard navigation remains intact**

Run:

```bash
node - <<'NODE'
const { chromium } = require("/Users/buns/Documents/GitHub/OpenCoven/coven-cave/node_modules/@playwright/test");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("file:///Users/buns/.coven/workspaces/familiars/cody/Components.dc.html");
  await page.locator('[data-view="composer"]').focus();
  await page.keyboard.press("ArrowDown");
  if (await page.getAttribute('[data-view="messages"]', "aria-selected") !== "true") {
    throw new Error("arrow navigation did not select Messages");
  }
  console.log("Arrow-key navigation verified");
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
NODE
```

Expected: `Arrow-key navigation verified`.

### Task 4: Create and inspect completion receipts

**Files:**
- Create: `artifacts/Components-messages-editorial-preview.png`
- Create: `artifacts/Components-messages-editorial-mobile.png`
- Modify: `handoffs/components-visual-refinement.md`

- [x] **Step 1: Render the desktop Messages receipt**

Run:

```bash
node - <<'NODE'
const { chromium } = require("/Users/buns/Documents/GitHub/OpenCoven/coven-cave/node_modules/@playwright/test");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto("file:///Users/buns/.coven/workspaces/familiars/cody/Components.dc.html");
  await page.click('[data-view="messages"]');
  await page.waitForTimeout(350);
  await page.screenshot({
    path: "/Users/buns/.coven/workspaces/familiars/cody/artifacts/Components-messages-editorial-preview.png",
  });
  await browser.close();
})();
NODE
```

Expected: exit 0 and a 1200x800 PNG.

- [x] **Step 2: Render the mobile Messages receipt**

Run:

```bash
node - <<'NODE'
const { chromium } = require("/Users/buns/Documents/GitHub/OpenCoven/coven-cave/node_modules/@playwright/test");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto("file:///Users/buns/.coven/workspaces/familiars/cody/Components.dc.html");
  await page.click('[data-view="messages"]');
  await page.waitForTimeout(350);
  await page.screenshot({
    path: "/Users/buns/.coven/workspaces/familiars/cody/artifacts/Components-messages-editorial-mobile.png",
  });
  await browser.close();
})();
NODE
```

Expected: exit 0 and a 390x844 PNG.

- [x] **Step 3: Inspect both PNGs**

Open both image files with the image viewer. Confirm:

- the violet rule is visible but does not dominate;
- Cody's identity reads before provenance;
- serif response copy is brighter and larger than utilities;
- no bubble, shadow, status badge, or evidence chips remain;
- mobile content stays inside the viewport.

- [x] **Step 4: Update the handoff receipt**

Append this Messages refinement to `handoffs/components-visual-refinement.md`:

```markdown
## Messages editorial state

- Status: verified
- Artifact: `/Users/buns/.coven/workspaces/familiars/cody/Components.dc.html`
- Desktop preview: `/Users/buns/.coven/workspaces/familiars/cody/artifacts/Components-messages-editorial-preview.png`
- Mobile preview: `/Users/buns/.coven/workspaces/familiars/cody/artifacts/Components-messages-editorial-mobile.png`
- Verification:
  - Source contract: exit 0
  - Embedded JavaScript parse: exit 0
  - Four-view interaction and 390px overflow check: exit 0
  - Arrow-key navigation: exit 0
- Worktree state: primary workspace, uncommitted artifact
- Next action: none
```

- [x] **Step 5: Do not commit without explicit approval**

Leave the workspace changes uncommitted. Report exact paths and verification
results; Cody's contract requires explicit commit permission.
