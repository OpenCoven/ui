# Vercel Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the self-contained OpenCoven UI specimen as a production Vercel project through the authenticated BunsDev account and point the GitHub repository homepage at the verified deployment.

**Architecture:** Keep `Components.dc.html` as the canonical artifact and route `/` to it with a Vercel rewrite. Use a deny-by-default `.vercelignore`, commit and push the deployment configuration, then deploy an archive exported from that exact commit so unrelated familiar-workspace files cannot enter the upload.

**Tech Stack:** Static HTML, Vercel configuration and CLI, Node.js, Playwright, Git, GitHub CLI

---

## File structure

- Create: `vercel.json` - static framework configuration and root rewrite.
- Create: `.vercelignore` - deny-by-default deployment allowlist.
- Create: `docs/superpowers/plans/2026-08-18-vercel-deployment.md` - executable deployment plan.
- Modify: `handoffs/vercel-deployment.md` - project, deployment, HTTP, browser, Git, and GitHub receipts.

### Task 1: Add and publish the static deployment contract

**Files:**
- Create: `vercel.json`
- Create: `.vercelignore`
- Create: `docs/superpowers/plans/2026-08-18-vercel-deployment.md`

- [x] **Step 1: Run the failing deployment contract**

Run:

```bash
node - <<'NODE'
const fs = require("fs");
const config = JSON.parse(fs.readFileSync("vercel.json", "utf8"));
if (config.framework !== null) throw new Error("framework must be null");
if (config.buildCommand !== null) throw new Error("buildCommand must be null");
if (JSON.stringify(config.rewrites) !== JSON.stringify([
  { source: "/", destination: "/Components.dc.html" },
])) throw new Error("root rewrite is incorrect");
const ignored = fs.readFileSync(".vercelignore", "utf8").trim().split(/\r?\n/);
if (JSON.stringify(ignored) !== JSON.stringify([
  "*",
  "!Components.dc.html",
  "!vercel.json",
])) throw new Error("deployment allowlist is incorrect");
NODE
```

Expected: FAIL because `vercel.json` does not exist.

- [x] **Step 2: Add the static Vercel configuration**

Create `vercel.json` with:

```json
{
  "framework": null,
  "buildCommand": null,
  "rewrites": [
    {
      "source": "/",
      "destination": "/Components.dc.html"
    }
  ]
}
```

Create `.vercelignore` with:

```gitignore
*
!Components.dc.html
!vercel.json
```

- [x] **Step 3: Re-run the deployment contract**

Run the command from Task 1, Step 1.

Expected: exit 0 with no output.

- [x] **Step 4: Confirm only the intended files can be uploaded**

Run:

```bash
node - <<'NODE'
const fs = require("fs");
for (const file of ["Components.dc.html", "vercel.json"]) {
  if (!fs.statSync(file).isFile()) throw new Error(`missing deployable file: ${file}`);
}
for (const forbidden of ["AGENTS.md", "MEMORY.md", "SOUL.md", "artifacts"]) {
  if (!fs.existsSync(forbidden)) throw new Error(`fixture missing: ${forbidden}`);
}
console.log("PASS deny-by-default deployment allowlist");
NODE
```

Expected: `PASS deny-by-default deployment allowlist`.

- [x] **Step 5: Commit and push the deployment configuration**

Run:

```bash
git add .vercelignore vercel.json docs/superpowers/plans/2026-08-18-vercel-deployment.md
git commit -m "chore: configure Vercel deployment" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
git push origin main
```

Expected: commit succeeds and `main` matches `origin/main`.

### Task 2: Create and link the BunsDev Vercel project

**Files:**
- Create locally: `.vercel/project.json`
- Modify remotely: authenticated BunsDev account's default Vercel workspace project `opencoven-ui`

- [x] **Step 1: Create the project in the authenticated BunsDev account**

Run:

```bash
test "$(vercel whoami)" = "bunsdev"
vercel project add opencoven-ui
```

Expected: the account check exits 0 and Vercel creates `opencoven-ui` in the account's default workspace. For this Northstar account, Vercel resolves `bunsdev` to the `0xBuns` workspace.

- [x] **Step 2: Link the checkout non-interactively**

Run:

```bash
vercel link --yes --project opencoven-ui
```

Expected: `.vercel/project.json` identifies the `opencoven-ui` project in the authenticated BunsDev account's default workspace.

- [x] **Step 3: Record the project receipt**

Run:

```bash
vercel project inspect opencoven-ui
node -e 'const p=require("./.vercel/project.json"); if(!p.projectId || !p.orgId) process.exit(1); console.log(JSON.stringify(p))'
```

Expected: Vercel reports the project and the local project metadata includes both IDs.

### Task 3: Deploy the exact committed tree to production

**Files:**
- Create temporarily: `/Users/buns/.copilot/session-state/ebd35dd8-5bb9-47cb-be9a-4afe846d2fa8/files/opencoven-ui-vercel.*`
- Create: `/Users/buns/.copilot/session-state/ebd35dd8-5bb9-47cb-be9a-4afe846d2fa8/files/vercel-deployment-url.txt`
- Create: `/Users/buns/.copilot/session-state/ebd35dd8-5bb9-47cb-be9a-4afe846d2fa8/files/vercel-deployment.json`

- [x] **Step 1: Verify the committed source ref**

Run:

```bash
test "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)"
git diff --quiet -- .vercelignore vercel.json docs/superpowers/plans/2026-08-18-vercel-deployment.md
git diff --cached --quiet
```

Expected: all commands exit 0.

- [x] **Step 2: Export the exact commit and attach only project metadata**

Run:

```bash
DEPLOY_DIR="$(mktemp -d /Users/buns/.copilot/session-state/ebd35dd8-5bb9-47cb-be9a-4afe846d2fa8/files/opencoven-ui-vercel.XXXXXX)"
git archive --format=tar HEAD | tar -x -C "$DEPLOY_DIR"
mkdir "$DEPLOY_DIR/.vercel"
cp .vercel/project.json "$DEPLOY_DIR/.vercel/project.json"
printf '%s\n' "$DEPLOY_DIR" > /Users/buns/.copilot/session-state/ebd35dd8-5bb9-47cb-be9a-4afe846d2fa8/files/vercel-deploy-directory.txt
```

Expected: the export contains the committed tree plus `.vercel/project.json`, with no unrelated workspace files.

- [x] **Step 3: Deploy production and save the URL**

Run:

```bash
DEPLOY_DIR="$(cat /Users/buns/.copilot/session-state/ebd35dd8-5bb9-47cb-be9a-4afe846d2fa8/files/vercel-deploy-directory.txt)"
vercel deploy "$DEPLOY_DIR" --prod --yes --archive=tgz > /Users/buns/.copilot/session-state/ebd35dd8-5bb9-47cb-be9a-4afe846d2fa8/files/vercel-deployment-url.txt
DEPLOYMENT_URL="$(tail -n 1 /Users/buns/.copilot/session-state/ebd35dd8-5bb9-47cb-be9a-4afe846d2fa8/files/vercel-deployment-url.txt)"
vercel inspect "$DEPLOYMENT_URL" --wait --timeout 180s --format=json > /Users/buns/.copilot/session-state/ebd35dd8-5bb9-47cb-be9a-4afe846d2fa8/files/vercel-deployment.json
node - <<'NODE'
const fs = require("fs");
const receipt = JSON.parse(fs.readFileSync(
  "/Users/buns/.copilot/session-state/ebd35dd8-5bb9-47cb-be9a-4afe846d2fa8/files/vercel-deployment.json",
  "utf8",
));
if (receipt.readyState !== "READY") throw new Error(`deployment is ${receipt.readyState}`);
if (!receipt.aliases.includes("opencoven-ui.vercel.app")) {
  throw new Error("production alias missing");
}
NODE
```

Expected: the production deployment reaches `READY` and receives the project production alias.

### Task 4: Verify production and publish repository metadata

**Files:**
- Modify remotely: GitHub repository homepage for `OpenCoven/ui`
- Modify: `handoffs/vercel-deployment.md`

- [x] **Step 1: Verify root and canonical HTTP routes**

Run:

```bash
PRODUCTION_URL="https://opencoven-ui.vercel.app"
curl --fail --silent --show-error --location --output /dev/null --write-out 'root %{http_code}\n' "$PRODUCTION_URL/"
curl --fail --silent --show-error --location --output /dev/null --write-out 'artifact %{http_code}\n' "$PRODUCTION_URL/Components.dc.html"
```

Expected:

```text
root 200
artifact 200
```

- [x] **Step 2: Verify desktop interaction and mobile overflow in production**

Run:

```bash
node - <<'NODE'
const { chromium } = require("/Users/buns/Documents/GitHub/OpenCoven/coven-cave/node_modules/@playwright/test");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const desktop = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await desktop.goto("https://opencoven-ui.vercel.app/", { waitUntil: "networkidle" });
  for (const state of ["composer", "messages", "context", "actions"]) {
    await desktop.click(`[data-view="${state}"]`);
    const selected = await desktop.getAttribute(`[data-view="${state}"]`, "aria-selected");
    if (selected !== "true") throw new Error(`${state} did not activate`);
  }
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto("https://opencoven-ui.vercel.app/", { waitUntil: "networkidle" });
  await mobile.click('[data-view="messages"]');
  const overflow = await mobile.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  if (overflow) throw new Error("mobile horizontal overflow");
  await browser.close();
  console.log("PASS production interaction and 390px overflow");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
NODE
```

Expected: `PASS production interaction and 390px overflow`.

- [x] **Step 3: Update and verify the GitHub repository homepage**

Run:

```bash
gh repo edit OpenCoven/ui --homepage "https://opencoven-ui.vercel.app"
test "$(gh repo view OpenCoven/ui --json homepageUrl --jq .homepageUrl)" = "https://opencoven-ui.vercel.app"
```

Expected: both commands exit 0.

- [x] **Step 4: Record and commit the deployment handoff**

Update `handoffs/vercel-deployment.md` with the branch, changed paths, project ID, deployment ID, production and immutable URLs, commit SHA, HTTP results, browser result, GitHub homepage receipt, and exact verification commands.

Run:

```bash
git add handoffs/vercel-deployment.md
git commit -m "docs: record Vercel deployment" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
git push origin main
test "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)"
```

Expected: the handoff commit is pushed and local/remote refs match.

- [x] **Step 5: Remove the temporary deployment export**

Run:

```bash
DEPLOY_DIR="$(cat /Users/buns/.copilot/session-state/ebd35dd8-5bb9-47cb-be9a-4afe846d2fa8/files/vercel-deploy-directory.txt)"
trash "$DEPLOY_DIR"
```

Expected: the temporary exported tree no longer exists; the deployment URL and JSON receipt remain in session storage.
