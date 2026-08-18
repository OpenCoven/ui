# Repository README Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add and publish a showcase-first repository README that introduces the OpenCoven UI specimens and gives contributors an accurate maintenance workflow.

**Architecture:** Add one root `README.md` that references existing committed previews and documentation through relative links. Validate the document with a deterministic Node.js source-contract script, then commit and push it with this implementation plan.

**Tech Stack:** GitHub-flavored Markdown, inline HTML for image sizing, Node.js, Git, GitHub CLI

---

## File structure

- Create: `README.md` — public showcase, local usage, repository map, contributor workflow, and provenance.
- Create: `docs/superpowers/plans/2026-08-17-repository-readme.md` — executable implementation and verification plan.
- Reference: `artifacts/Components-messages-editorial-preview.png` — desktop hero image.
- Reference: `artifacts/Components-messages-editorial-mobile.png` — responsive preview.
- Reference: `docs/superpowers/specs/2026-08-17-repository-readme-design.md` — approved README content contract.
- Reference: `docs/superpowers/specs/2026-08-17-components-messages-editorial-state-design.md` — approved Messages visual design.
- Reference: `docs/superpowers/plans/2026-08-17-components-messages-editorial-state.md` — exact specimen verification commands.

### Task 1: Pin the README content contract

**Files:**
- Test: `README.md`

- [x] **Step 1: Run the failing README contract**

Run:

```bash
node - <<'NODE'
const fs = require("fs");
const readme = fs.readFileSync("README.md", "utf8");
for (const required of [
  "# OpenCoven UI",
  "artifacts/Components-messages-editorial-preview.png",
  "artifacts/Components-messages-editorial-mobile.png",
  "## Component states",
  "## Open locally",
  "## Repository map",
  "## Contributing",
  "## Design provenance",
]) {
  if (!readme.includes(required)) throw new Error(`README missing ${required}`);
}
NODE
```

Expected: FAIL with `ENOENT: no such file or directory, open 'README.md'`.

### Task 2: Write the showcase-first README

**Files:**
- Create: `README.md`

- [x] **Step 1: Create the approved README**

Create `README.md` with exactly this content:

```markdown
<div align="center">

# OpenCoven UI

**Standalone interface specimens and design artifacts for OpenCoven.**

<img src="artifacts/Components-messages-editorial-preview.png" alt="OpenCoven UI component browser showing the editorial Messages specimen on desktop" width="960">

</div>

---

## What this repository is

OpenCoven UI is a small, inspectable workspace for exploring interface
direction before it enters a production application. The current artifact,
[`Components.dc.html`](Components.dc.html), is a self-contained HTML, CSS, and
JavaScript component browser with no dependency installation or build step.

This repository is not a packaged component library, production app, or
canonical source for [Coven Cave](https://github.com/OpenCoven/coven-cave)
components.

## Component states

Use the specimen navigation to move between four interface states:

| State | Purpose |
| --- | --- |
| **Composer** | Keeps drafting, context, model, and send controls legible without competing with the message. |
| **Messages** | Presents a familiar response as an editorial turn with clear identity, provenance, response, and utility hierarchy. |
| **Context** | Makes attached repositories, files, branches, and access state explicit. |
| **Actions** | Uses direct verbs, visible consequences, and secondary keyboard cues. |

The browser preserves visible focus states, arrow-key navigation, reduced-motion
handling, and a responsive layout without horizontal overflow at 390px.

## Open locally

```bash
git clone https://github.com/OpenCoven/ui.git
cd ui
open Components.dc.html
```

No install step is required. On platforms without the macOS `open` command,
open `Components.dc.html` directly in a browser.

## Responsive behavior

The same Messages hierarchy contracts naturally on narrow screens while keeping
the response aligned beneath Cody's identity.

<div align="center">
  <img src="artifacts/Components-messages-editorial-mobile.png" alt="OpenCoven UI editorial Messages specimen at a 390 pixel mobile viewport" width="390">
</div>

## Repository map

| Path | Purpose |
| --- | --- |
| [`Components.dc.html`](Components.dc.html) | Self-contained interactive component browser |
| [`artifacts/`](artifacts/) | Verified desktop and mobile visual receipts |
| [`docs/superpowers/specs/`](docs/superpowers/specs/) | Approved design decisions |
| [`docs/superpowers/plans/`](docs/superpowers/plans/) | Implementation plans and verification steps |
| [`handoffs/`](handoffs/) | Completion and validation receipts |

## Contributing

When changing a specimen:

1. Keep the browser self-contained unless a separately approved design changes
   the repository architecture.
2. Preserve all four states and the existing navigation semantics.
3. Verify embedded JavaScript parsing, four-state selection, arrow-key
   navigation, and 390px horizontal overflow.
4. Refresh both desktop and mobile screenshots when visual behavior changes.
5. Record exact commands and results in the relevant handoff receipt.

The current
[implementation plan](docs/superpowers/plans/2026-08-17-components-messages-editorial-state.md)
contains the exact specimen verification commands.

## Design provenance

- [Editorial Messages design](docs/superpowers/specs/2026-08-17-components-messages-editorial-state-design.md)
- [Editorial Messages implementation plan](docs/superpowers/plans/2026-08-17-components-messages-editorial-state.md)
- [Repository README design](docs/superpowers/specs/2026-08-17-repository-readme-design.md)
```

- [x] **Step 2: Re-run the README contract**

Run the command from Task 1, Step 1.

Expected: exit 0 with no output.

### Task 3: Validate claims and repository-relative links

**Files:**
- Test: `README.md`
- Test: `Components.dc.html`

- [x] **Step 1: Validate local README links**

Run:

```bash
node - <<'NODE'
const fs = require("fs");
const path = require("path");
const readme = fs.readFileSync("README.md", "utf8");
const targets = new Set();
for (const match of readme.matchAll(/(?:\]\(|src=")(?!https?:|#)([^)"#]+)(?:\)|")/g)) {
  targets.add(match[1]);
}
for (const target of targets) {
  if (!fs.existsSync(path.resolve(target))) throw new Error(`broken local link: ${target}`);
}
console.log(`PASS ${targets.size} local README targets`);
NODE
```

Expected: `PASS 10 local README targets`.

- [x] **Step 2: Validate state and accessibility claims**

Run:

```bash
node - <<'NODE'
const fs = require("fs");
const html = fs.readFileSync("Components.dc.html", "utf8");
for (const marker of [
  'data-view="composer"',
  'data-view="messages"',
  'data-view="context"',
  'data-view="actions"',
  '["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"]',
  "@media (prefers-reduced-motion: reduce)",
]) {
  if (!html.includes(marker)) throw new Error(`artifact claim missing ${marker}`);
}
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
if (scripts.length !== 1) throw new Error(`expected one embedded script, found ${scripts.length}`);
new Function(scripts[0][1]);
console.log("PASS README behavior claims and embedded JavaScript parse");
NODE
```

Expected: `PASS README behavior claims and embedded JavaScript parse`.

- [x] **Step 3: Scan for unsupported README claims**

Run:

```bash
node - <<'NODE'
const fs = require("fs");
const readme = fs.readFileSync("README.md", "utf8");
for (const unsupported of [
  /npm install/i,
  /published (?:component|design)/i,
  /production-ready/i,
  /deploy(?:ment)? instructions/i,
  /licensed under/i,
]) {
  if (unsupported.test(readme)) throw new Error(`unsupported claim: ${unsupported}`);
}
console.log("PASS unsupported-claim scan");
NODE
```

Expected: `PASS unsupported-claim scan`.

- [x] **Step 4: Check Markdown whitespace**

Run:

```bash
git diff --check -- README.md docs/superpowers/plans/2026-08-17-repository-readme.md
```

Expected: exit 0 with no output.

### Task 4: Commit and publish the README

**Files:**
- Create: `README.md`
- Create: `docs/superpowers/plans/2026-08-17-repository-readme.md`

- [ ] **Step 1: Stage only the README deliverables**

Run:

```bash
git add -- README.md docs/superpowers/plans/2026-08-17-repository-readme.md
git diff --cached --stat
```

Expected: only `README.md` and
`docs/superpowers/plans/2026-08-17-repository-readme.md` are staged.

- [ ] **Step 2: Commit the README**

Run:

```bash
git commit -m "docs: add repository README" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

Expected: one commit adding the two planned files.

- [ ] **Step 3: Push `main`**

Run:

```bash
git push origin main
```

Expected: `main` advances on `https://github.com/OpenCoven/ui`.

- [ ] **Step 4: Verify the remote receipt**

Run:

```bash
local_sha=$(git rev-parse HEAD)
remote_sha=$(git ls-remote origin refs/heads/main | cut -f1)
test "$local_sha" = "$remote_sha"
gh api repos/OpenCoven/ui/readme --jq '{path,html_url,sha}'
gh api repos/OpenCoven/ui/commits/main --jq '{sha:.sha,url:.html_url,message:.commit.message}'
```

Expected: local and remote SHAs match; GitHub returns `README.md` and the pushed
commit URL.
