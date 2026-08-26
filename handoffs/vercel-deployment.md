# Vercel Deployment Ledger

## OpenCoven/ui

- Repository: `/Users/buns/.coven/workspaces/familiars/cody`
- Branch: `main`
- Owner: Cody
- Status: verified
- Requested deliverables: committed Vercel configuration, production deployment in the personal BunsDev scope, production smoke checks, deployment receipts, and GitHub repository homepage update
- Changed paths:
  - `.vercelignore`
  - `vercel.json`
  - `docs/superpowers/plans/2026-08-18-vercel-deployment.md`
  - `handoffs/vercel-deployment.md`
  - `.gitignore` (pre-existing untracked local file; Vercel Link added the local-only `.vercel` entry)
- Verification:
  - Deployment configuration contract: exit 0
  - Deny-by-default upload allowlist: `PASS deny-by-default deployment allowlist`
  - Spec compliance review: approved
  - Code quality review: approved
  - Exact source export: commit `35de405c91d0eead35e230f7aabda89887560fec`
  - Vercel upload: 7.0 KB, production build `READY`
  - `curl --fail --location https://opencoven-ui.vercel.app/`: HTTP 200
  - `curl --fail --location https://opencoven-ui.vercel.app/Components.dc.html`: HTTP 200
  - Playwright desktop four-state interaction: exit 0
  - Playwright 390px horizontal-overflow check: exit 0
  - `gh repo view OpenCoven/ui --json homepageUrl`: `https://opencoven-ui.vercel.app`
  - Temporary exported tree removed with `trash`: exit 0
- Vercel project:
  - Name: `opencoven-ui`
  - ID: `prj_g5iBF1ucxTlq567g4DlLeFLvRjRR`
  - Account login: `bunsdev`
  - Owner workspace: `0xBuns` (`team_VLpvr923t3nLPeaUaLxABctM`)
  - Scope note: the authenticated `bunsdev` account is a Vercel Northstar account whose default workspace is `0xBuns`; Vercel CLI does not expose a separate personal project scope
  - Local link: `.vercel/project.json`
- Vercel deployment:
  - Deployment ID: `dpl_8yDaA8UhUt28zVC9UKp2bd3Y8JVq`
  - Immutable URL: `https://opencoven-dpe3s6en8-0xbuns.vercel.app`
  - Production URL: `https://opencoven-ui.vercel.app`
  - Dashboard receipt: `https://vercel.com/0xbuns/opencoven-ui/8yDaA8UhUt28zVC9UKp2bd3Y8JVq`
  - Saved receipt: `/Users/buns/.copilot/session-state/ebd35dd8-5bb9-47cb-be9a-4afe846d2fa8/files/vercel-deployment.json`
- GitHub:
  - Repository: `https://github.com/OpenCoven/ui`
  - Homepage: `https://opencoven-ui.vercel.app`
  - Configuration commit: `35de405c91d0eead35e230f7aabda89887560fec`
  - Receipt commit: `ac2d287880072ed7e3b75e03fe24043e661895ff`
  - Receipt finalization commit: `94f5ac5437e2705390a2af4c6bf109e224f6da8b`
- Custom domain `ui.opencoven.ai`:
  - Status: verified on public DNS, TLS, and HTTPS
  - Attached: 2026-08-20 via `POST /v10/projects/opencoven-ui/domains`
  - API response: `{"name":"ui.opencoven.ai","apexName":"opencoven.ai","projectId":"prj_g5iBF1ucxTlq567g4DlLeFLvRjRR","verified":true}`
  - CLI note: `vercel domains add ui.opencoven.ai opencoven-ui` failed with
    "expects one argument" on the locally installed CLI 52.2.1, so the REST API
    was used instead. This is not an upstream defect: it is a known bug that was
    already fixed and released. Pre-fix, `domains add` required exactly one
    argument whenever the working directory was linked to a project, which
    contradicted its own `domains add domain project` help text. Fixed by
    vercel/vercel PR #16795 (merged 2026-06-25), which replaced
    `if (project && args.length !== 1)` with `args.length < 1 || args.length > 2`.
    First released in 54.18.0 (2026-06-26); local 52.2.1 dated 2026-04-30.
    Resolved on 2026-08-20 by installing `vercel@latest` (59.1.4) into the Cave
    toolchain npm prefix at
    `/Users/buns/Library/Application Support/OpenCoven/CovenCave/toolchains/npm`,
    which is first on `PATH` and shadows the stale nvm-managed 52.2.1 binary.
    Post-upgrade, `vercel domains add ui.opencoven.ai opencoven-ui` succeeds and
    reports the domain is already assigned; `vercel whoami` still returns
    `bunsdev`, and the project domain list is unchanged.
  - Required DNS record at Namecheap (`opencoven.ai` uses
    `pdns1/pdns2.registrar-servers.com`):
    - Type `CNAME`, Host `ui`, Value `37644e98f1c1fdba.vercel-dns-016.com.`
  - Public DNS: authoritative Namecheap DNS plus Cloudflare and Google resolvers
    return the required CNAME.
  - TLS: Vercel certificate `cert_In3tacdYjvftF6c1sN1qENNc`, subject/SAN
    `ui.opencoven.ai`, valid 2026-08-20 through 2026-11-18.
  - HTTPS: status 200 with certificate verification result 0 on public Vercel
    edges `216.150.1.193` and `216.150.1.129`.
  - Content: `/` returns all four `data-view` states (`composer`, `messages`,
    `context`, `actions`) and one `prefers-reduced-motion` block;
    `/Components.dc.html` returns 200. Second edge `216.150.16.129` returns 200.
  - `opencoven-ui.vercel.app` remains active as the project's default domain.
  - Local caveat: this Mac's system resolver temporarily caches the retired
    parking address `192.64.119.254`; authoritative/public DNS are correct.
- GitHub homepage repointed to `https://ui.opencoven.ai`
- README live-demo link added pointing at `https://ui.opencoven.ai`
- Worktree state: all deployment changes are committed and pushed; HEAD equals origin/main; unrelated untracked familiar-workspace files remain untouched
- Next action: none for DNS; let the local resolver cache expire naturally

## Cross-linking from OpenCoven published surfaces (option A)

- Repo: `/Users/buns/Documents/GitHub/OpenCoven/coven-cave`, branch `main`,
  baseline commit `a905b70790`.
- Changed paths (uncommitted — Val has not authorized a commit in coven-cave):
  - `README.md` — added a paragraph after the design-context pointer in
    "Repository layout" linking `https://ui.opencoven.ai` and
    `https://github.com/OpenCoven/ui`, stating explicitly that the specimen
    browser is an exploration workspace and is not canonical for
    `src/components/`.
  - `docs/coven-design-language.md` — appended `ui.opencoven.ai` to the trailing
    *Related* line, labelled "exploratory direction only, never authoritative
    over shipped code", preserving the document's code-is-authoritative stance.
- Verification (run from the coven-cave root):
  - `node scripts/docs-index.test.mjs` → exit 0,
    "index ok (49 documents classified, 62 links resolved)".
  - `node scripts/ui-consistency.test.mjs` → exit 0,
    "contract, scanner, and baseline ok (12 palettes, 334 icons)". This is the
    CI job that pins factual claims in `docs/coven-design-language.md`.
  - Link targets: `https://ui.opencoven.ai` → HTTP 200 (via
    `curl --resolve ui.opencoven.ai:443:216.150.1.129`, working around this
    Mac's stale resolver cache); `https://github.com/OpenCoven/ui` → HTTP 200.
- Deliberately NOT changed, with reasons:
  - `coven-docs` (docs.opencoven.ai) documents the Coven runtime, daemon, CLI,
    harnesses, and local API. Its `content/docs/meta.json` nav has no design or
    UI section, so a specimen browser has no truthful home in that information
    architecture. Adding one would be link-spraying.
  - `coven-landing` (opencoven.ai) is the public marketing site. Its footer
    "Project" nav and `#products` section are user-visible product surfaces;
    listing an exploration workspace as a product would be inaccurate, and the
    placement is a material product decision for Val, not an inferable one.
- Worktree state: `coven-cave` is dirty. My two files are the only ones I
  touched; pre-existing unrelated modifications (`.beads/interactions.jsonl`,
  `public/icons/*.png`) were already present at baseline and are not mine.
- Next action: await Val's decision on (a) committing the coven-cave change and
  (b) whether the landing site should carry a link at all.

### Commit + PR receipt (2026-08-20)

- Val authorized the coven-cave commit. Direct pushes to `main` are blocked by
  branch protection (required check `Frontend build`), so the change went through
  the repo's normal PR path rather than a direct push.
- Branch: `docs/cross-link-ui-opencoven-ai`, from base `a905b70790`.
- Commit: `6ffeb4a9196e1be6daf296f17abeeb4ae89e5277`
  ("docs: cross-link the OpenCoven UI specimen browser"), 2 files changed,
  11 insertions, 1 deletion. Only `README.md` and
  `docs/coven-design-language.md` were staged; the repo's pre-existing unrelated
  modifications (memory-file-inventory work, `.beads/interactions.jsonl`,
  `public/icons/*`) stayed on `main` and were not included.
- Pushed: `git ls-remote origin docs/cross-link-ui-opencoven-ai` returns
  `6ffeb4a9196e1be6daf296f17abeeb4ae89e5277`.
- PR: https://github.com/OpenCoven/coven-cave/pull/4754 — OPEN, MERGEABLE,
  base `main`.
- CI on run 32376434184: required `Frontend build` pass (30s),
  `Select validation` pass (14s); bundle/validation/iOS jobs correctly skipped
  for a docs-only change.
- Local repo returned to `main`; the working tree still carries only the
  pre-existing unrelated modifications.
- Next action: merge PR #4754 when Val is ready. `coven-docs` and
  `coven-landing` remain deliberately unlinked (see reasons above).
- Merged: PR #4754 squash-merged into `coven-cave` `main` at
  2026-08-20T13:51:40Z by BunsDev. Merge commit
  `4a2983e643693c0531dfa9457bcf93b8d327400f`
  ("docs: cross-link the OpenCoven UI specimen browser (#4754)"), touching
  exactly `README.md` and `docs/coven-design-language.md`.
  Branch `docs/cross-link-ui-opencoven-ai` deleted on origin and locally.
  `git show origin/main:README.md` contains the `ui.opencoven.ai` link at
  line 180. Cave cross-linking is complete; no open lane remains here.

## Landing-site footer link (coven-landing)

- Repo: `/Users/buns/Documents/GitHub/OpenCoven/coven-landing`, base `e5e40e6`.
- Changed paths (2 files, +2 lines):
  - `src/components/redesign/RedesignFooter.astro` — "Component browser" ->
    `https://ui.opencoven.ai` in the Project column. This footer renders on
    `/`, `/how-it-works`, `/privacy`, `/terms`.
  - `src/components/Footer.astro` — same link in the legacy footer's Project
    nav, which renders on `/github` and `/quickstart`, so both footers agree.
- Incidental fix: `node_modules` was stale and `pnpm build` failed on
  `@fontsource/eb-garamond` (declared in `package.json`, not installed).
  `pnpm install` resolved it; `pnpm-lock.yaml` was not modified.
- Verification:
  - `pnpm build` -> 6 pages built, complete.
  - `pnpm check` (`scripts/verify-static.mjs`) -> all contracts pass, including
    the hidden-Product-column rule.
  - Built HTML contains the link exactly once on each of the 6 pages.
  - `pnpm check:browser` -> 7 passed including "footer hides the Product column
    until those pages exist". One failure, "adapts the download button", is
    pre-existing and environment-specific: it asserts
    `Download Cave for Linux` while this macOS machine reports macOS. Proven
    pre-existing by re-running it with my changes stashed on a clean tree.
  - CI on PR: `build-and-check` pass (2m5s), Vercel `coven` and
    `coven-landing` deployments pass.
- PR: https://github.com/OpenCoven/coven-landing/pull/56 — MERGED
  2026-08-20T14:02:55Z by BunsDev, squash commit
  `eb11314463463eca6299e597901d840c1ef16f96`. Branch deleted; local repo back
  on `main` with a clean working tree.
- Live receipt: `curl https://opencoven.ai/` returns HTTP 200 and contains
  `https://ui.opencoven.ai`.
- Remaining: `coven-docs` stays unlinked; its nav covers the runtime, daemon,
  CLI, harnesses, and local API, with no truthful slot for a specimen browser.

## Platform-dependent download-button test (coven-landing)

- Root cause: `tests/redesign.spec.ts` asserted `Download Cave for Linux` and
  `/stream/linux` unconditionally, but that value is produced by `detectOs()`
  in `src/scripts/redesign/downloads.js`, which reads `navigator.platform`.
  The expectation was therefore decided by the machine running the suite:
  it passed on Linux CI and failed on a macOS workstation reporting macOS.
- Fix: emulate `navigator.platform` via `page.addInitScript` before navigation,
  so the test asserts the retargeting contract instead of the host. Assertion
  values unchanged. Test-only; no source or markup changes.
- Changed path: `tests/redesign.spec.ts` (+7/-2).
- Verification:
  - macOS before: 1 failed, 7 passed (got `Download Cave for macOS`).
  - macOS after: `pnpm check:browser` -> 8 passed, twice (1.2m, then 29.9s).
  - Linux CI `build-and-check` (which runs `pnpm check:browser`) pass, 2m11s.
    Green on both host OSes is the actual proof the dependence is gone.
- Rejected intermediate design: a three-platform matrix (macOS/Windows/Linux)
  passed, but its two extra page loads raised suite runtime ~1.0m -> ~2.7m and
  intermittently tipped the slower timing-sensitive tests ("download menu
  opens...", "clicking a session cell...") past their timeouts. Reverted to a
  single page load to hold suite cost and stability flat. Broader platform
  coverage needs those tests de-flaked first.
- PR: https://github.com/OpenCoven/coven-landing/pull/57 — MERGED
  2026-08-20T14:29:17Z by BunsDev, squash commit
  `b28a9dd61210d8cdaa7e99c93e8ac33014db33da`. Branch deleted; local `main`
  clean.

## Landing browser tests — de-flaked the two slow interaction tests

- Symptom: `download menu opens, switches platform tabs, and closes on Escape`
  and `clicking a session cell opens the familiar inspector window` in
  `/Users/buns/Documents/GitHub/OpenCoven/coven-landing/tests/redesign.spec.ts`
  intermittently exhausted Playwright's whole 30s per-test budget. Durations
  swung from ~5s to 37.6s. Both passed in isolation.
- Root cause, from a retained trace of a real failure (`trace.zip` step
  timings): `0.3s goto / 4.0s waitForTimeout / 1.4s expect / 20.6s click`.
  Playwright's actionability check holds a `click()` until the target stops
  moving for two consecutive animation frames. Both clicks aim into the
  landing page's running demo — `motion.js` scroll reveals, `runBoard` swapping
  session log lines for ~6s, `runTicks` animating diff counters — so on a
  loaded machine the target may never settle inside the budget. Not a product
  bug; a test racing decorative motion.
- Fix: moved both tests into a `test.describe` using
  `test.use({ reducedMotion: 'reduce' })`. The redesign scripts already branch
  on that preference (`board.js:338/1773/2449`, `motion.js:12`, `hero.js:84`,
  `hiw.js`), so the assertions still exercise shipped code while the layout
  settles at once. Also dropped the 4s sleep in the session-cell test:
  `initWindows()` stamps `data-fam` as the module boots, so the existing
  `toHaveAttribute` assertion already waits for the click wiring. No source
  files changed.
- Verification:
  - `--repeat-each=6 --workers=1` on both tests: before 1 failed / 11 passed in
    3.7m, slowest 37.6s; after **12 passed** in 53.9s, slowest 5.8s.
  - Full `pnpm check:browser` on macOS: **8 passed** twice, 21.0s and 23.5s
    (was ~1.0-1.2m).
  - `pnpm check` and `pnpm build` pass.
  - Linux CI `build-and-check` pass, 2m29s
    (https://github.com/OpenCoven/coven-landing/actions/runs/32386856736).
- PR: https://github.com/OpenCoven/coven-landing/pull/58 — MERGED
  2026-08-20T15:36:18Z by BunsDev, squash commit
  `ee239deddecff032523c88a956a862a4e926dd35`. Branch deleted; local `main`
  clean at `ee239de`.
- Open, not shipped: `playwright.config.ts` sets no `workers`, relying on
  `fullyParallel: false` plus a single spec file to stay serial. Running with
  `--repeat-each` and no `--workers=1` fans out to CPU/2 browsers, saturates
  the single `pnpm preview` server, and fails every test. Harmless for CI
  today; worth pinning `workers: 1` if a second spec file is ever added.

## Landing browser tests — pinned Playwright to one worker

- Closes the open item recorded above. `fullyParallel: false` only serializes
  tests *within* a file, so the suite stayed serial by accident: one spec file.
  A second spec file, or any `--repeat-each` run, fans out to CPU/2 browsers
  against the single `pnpm preview` server, saturates it, and times out tests
  that pass alone.
- Change: `workers: 1` in
  `/Users/buns/Documents/GitHub/OpenCoven/coven-landing/playwright.config.ts`
  (+5 lines, comment included). CI already defaults to one worker, so this
  changes local behavior only.
- Verification: `playwright test -g "download menu opens|familiar inspector
  window" --repeat-each=6` **without** `--workers=1` previously failed 12/12;
  it now reports `Running 12 tests using 1 worker` and passes **12/12** in
  46.1s. Full `pnpm check:browser` 8 passed in 21.6s. `pnpm check` and
  `pnpm build` pass. Linux CI `build-and-check` pass, 2m2s
  (https://github.com/OpenCoven/coven-landing/actions/runs/32389590938).
- PR: https://github.com/OpenCoven/coven-landing/pull/59 — MERGED
  2026-08-20T16:03:30Z, squash commit
  `fb1140a5e99cedf70570103518d95a5984ca4399`. Branch deleted; local `main`
  clean at `fb1140a`.

## Landing browser tests — hard-wait audit

- Scope: every timing assumption in
  `/Users/buns/Documents/GitHub/OpenCoven/coven-landing/tests/redesign.spec.ts`
  plus `scripts/verify-static.mjs`. One fixed sleep remained after the de-flake;
  it was concealing a coverage gap rather than merely costing time.
- Finding 1 — `no unexpected console errors` never watched console errors. It
  subscribed only to `pageerror` (uncaught exceptions). Proven by mutation:
  adding `console.error('MUTATION probe')` to `initTheme()` left the pre-audit
  test **passing** (1 passed, 5.2s). The test now also watches console
  messages, excluding `/api/` URLs the preview server genuinely does not serve
  (`/api/site-stats` 404s at ~630ms). The mutated build now fails with
  `console: MUTATION probe`.
- Finding 2 — the 4s sleep under-covered the slowest subsystem. Instrumented
  boot: `+631ms` api 404, `+762ms` goto resolved (`waitUntil: 'load'`),
  `+5499ms` braid canvas attached. The sleep returned 1.5s before braid boot
  even began, so errors thrown there were outside the window. Replaced with
  `toBeAttached()` on `warded-braid canvas`: deterministic, covers braid boot,
  ~1.5s warm and longer under load.
- Finding 3 — the Windows tab assertion could silently skip. It was guarded by
  `if (await winTab.count())` against `win` / `win-x64`, spellings the markup
  never emits; `dist/index.html` only ever contains `data-dl-plat="windows"`.
  Now unconditional; mutating the attribute to `win-x64` fails the test
  (`locator.click: Test timeout`) instead of skipping it.
- Deliberately unchanged: the theme test's one-shot `getAttribute` reads are
  safe because `page.goto` defaults to `waitUntil: 'load'` and module scripts
  execute before `load`, so the delegated handler is always registered before
  the click, and the handler is synchronous. The 15s `toBeAttached` timeouts
  are retrying web-first assertions, harmless.
- Verification: full suite 8 passed 34.9s; `--repeat-each=4` **32/32** passed
  2.0m; both mutations killed and the pre-audit test proven to survive
  mutation 1; `pnpm check` and `pnpm build` pass;
  `grep -rn "waitForTimeout\|setTimeout\|sleep(" tests/ scripts/` returns **0**.
  Linux CI `build-and-check` pass 2m2s with `8 passed (1.2m)` and no retry or
  flaky marker in the log
  (https://github.com/OpenCoven/coven-landing/actions/runs/32394773631).
- PR: https://github.com/OpenCoven/coven-landing/pull/60 — MERGED
  2026-08-20T16:58:27Z, squash commit
  `545dd60edb8c7698e08be91e3dd5091f9d543513`. Branch deleted; local `main`
  clean at `545dd60`. `origin/main:tests/redesign.spec.ts` contains zero
  `waitForTimeout` occurrences.
- Lesson worth keeping: a fixed sleep in a *negative* assertion cannot fail
  randomly, so it never looks flaky — it silently false-passes instead. Audit
  those by mutation, not by watching for red runs.

## Landing browser tests — /quickstart coverage

- Scope: extend the Playwright suite to `/quickstart`, which had **zero**
  browser coverage. Repo `/Users/buns/Documents/GitHub/OpenCoven/coven-landing`,
  branch `test/quickstart-browser-coverage`.
- Gap found: `scripts/verify-static.mjs` already pins the page's markup, copy,
  canonical links, JSON-LD, and list semantics against the built HTML, so
  re-asserting structure would have added nothing. The untested surface was
  runtime behavior — `wireCopyControls()` in `src/scripts/main.js` (~95 lines
  wiring 24 copy buttons plus a manual-copy fallback). `grep -rn
  "qs-copy\|clipboard" tests/ scripts/verify-static.mjs` returned **no
  matches**: the subsystem had no coverage of any kind.
- Change: new file
  `/Users/buns/Documents/GitHub/OpenCoven/coven-landing/tests/quickstart.spec.ts`
  (+199, 6 tests). No source files touched.
  1. A copy button writes exactly its own command; the clipboard is read back
     rather than trusting the check icon. Live region announces
     `Copied: <cmd>`.
  2. The copied state reverts on its 1.4s timer so a second command can be
     copied — retrying assertion, not a sleep.
  3. Manual-copy fallback, both refusal modes (clipboard object absent; write
     rejected): command is selected, guidance names the shortcut, live region
     announces it, and a second failure *moves* the guidance rather than
     leaving a stale one. Never previously exercised.
  4. `.onboard-product { scroll-margin-top: 96px }` keeps a chosen product
     clear of the `position: sticky` header. Asserted on the settled position
     (article y goes 5126 -> 96, header height 61) because "below the header"
     is trivially true before the click.
  5. No console errors / uncaught exceptions while driving the page's async
     paths (reveal observers, async click handler, deferred reset).
- Facts pinned by probe before writing assertions: 24 copy buttons, 1 live
  region, 24 guidance nodes; no braid/canvas on quickstart; `js-on motion-on
  mobile-nav-on reveal-ready` stamped at boot; the install command appears
  **4x** and `coven doctor` **2x** page-wide, so all selectors are scoped to
  `article#coven-cli` where every command is unique.
- Mutation testing — all six killed: `writeText('')`; reset timer
  `1_400 -> 1_400_000`; `selectCommand()` no-op; `hideGuidance()` removed;
  `scroll-margin-top: 96px -> 0px`; `console.error('MUTATION probe')`. Each
  failed exactly the matching test; sources restored via `git checkout --`.
- Verification: new spec 6 passed 8.2s; `--repeat-each=4` **24/24** 31.3s;
  full suite across both spec files **14 passed** 27.5s; `pnpm check` and
  `pnpm build` pass; zero `waitForTimeout` added.
- First second spec file in the repo — the exact fan-out case the `workers: 1`
  pin from #60/#59 was added for. Confirmed serial: "Running 14 tests using 1
  worker".
- Environment hazard found (NOT fixed here): `127.0.0.1:4173` was occupied by
  an unrelated Vite dev server from `/Users/buns/Documents/GitHub/OpenCoven/chat`
  (pid 88875, up 2h28m). `astro preview` silently fell back to 4174, and
  `playwright.config.ts` has `reuseExistingServer: !process.env.CI` against a
  hardcoded 4173 — so a local `pnpm check:browser` will silently adopt whatever
  app answers on that port and test the wrong site. Local verification here was
  run against 4174 via a throwaway config; CI on Linux runs the canonical
  `pnpm check:browser` on a clean port. Worth pinning the port or asserting the
  served site's identity before the suite runs.
- PR: https://github.com/OpenCoven/coven-landing/pull/61 — MERGED 2026-08-21T09:55:06Z, squash commit `cc53bd26f5162a72ae089fdf11386d750d4b5285`. Branch deleted; local `main` clean. Linux CI `build-and-check` pass 2m6s, `14 passed (1.2m)`, "Running 14 tests using 1 worker", no retry or flaky marker (https://github.com/OpenCoven/coven-landing/actions/runs/32469966541).

## 2026-08-22 — Relocate the working tree out of the familiar workspace

- Problem: `OpenCoven/ui` was checked out **inside Cody's private familiar
  workspace** (`/Users/buns/.coven/workspaces/familiars/cody`). The repo's
  tracked files sat alongside untracked private files — `MEMORY.md`,
  `USER.md`, `.secrets/`, `agent-runs/`, `self-reports/` — so a single
  `git add -A` in that directory would have committed Cody's memory and
  secrets to this repository. The `.gitignore` there is the workspace's own
  and is itself untracked, so it offered no protection.
- Canonical working tree is now `/Users/buns/Documents/GitHub/OpenCoven/ui`.
  Verified byte-identical to the workspace copy at `cebe4f4` before moving
  (`cmp` over every `git ls-files` entry, zero differences).
- Pre-move safety: `git log --all --not --remotes` empty, `git stash list`
  empty, single worktree, `main...origin/main` in sync. Nothing was
  workspace-only.
- Moved with `trash` (recoverable) from the workspace: `.git/`,
  `Components.dc.html`, `README.md`, `vercel.json`, `.vercelignore`, `docs/`.
  Left in place deliberately: Cody's `handoffs/` ledger and `artifacts/`
  screenshots. `git rev-parse` there now reports "not a git repository".
- Added `scripts/dev.py` — a stdlib-only dev server that applies the same
  `/` -> `/Components.dc.html` rewrite as `vercel.json`, so local review
  matches ui.opencoven.ai. Opening the file from disk does not reproduce that
  route. Excluded from deploys by the existing `.vercelignore` allowlist.
- Verification: `python3 scripts/dev.py 4321` -> `/` returns 200, 30350 bytes,
  sha256 `562756c0e586c97c66baaed9ce5878e725fe538eb04c8534c7de905d8358f01d`,
  identical to `Components.dc.html`; all four specimen states present
  (`data-view=composer|messages|context|actions`); `/Components.dc.html` 200;
  unknown path 404.
- Commit `23256db` pushed to `main` (repo takes direct commits; no PR or CI
  configured).

## 2026-08-26 — Live deployment review: the registry was never deployed

Reviewed `https://ui.opencoven.ai/` at `f447222` (post pnpm-monorepo migration).

**Deployment is current and reproducible.** A local `pnpm build` emitted
`assets/index-Bdto56ik.css` and `assets/index-Lx5oImkc.js` — the exact asset
names referenced by the live `index.html`. The SPA shell and CSS bundle both
serve correctly.

**Defect found — every published registry URL returned HTML, not JSON.**
`README.md`, root `components.json` and `registry.json` all advertise
`https://ui.opencoven.ai/r/{name}.json` as the install path
(`pnpm dlx shadcn@latest add @opencoven/button`). Live probes of
`/r/registry.json` and `/r/button.json` both returned the SPA shell with
HTTP 200. The repository's primary documented consumer workflow was broken.

Two independent causes:

1. Vite resolves `publicDir` relative to the app root, which is
   `apps/specimens`. That directory has no `public/`, and the generated
   registry lives in the workspace-root `public/r`. So the 34 registry JSON
   files were never copied into `apps/specimens/dist` — confirmed by building
   at `f447222`: `apps/specimens/dist` contained only `index.html` and
   `assets/`.
2. `vercel.json` rewrote `/(.*)` to `/index.html`, converting the resulting
   404 into a 200 HTML response. That is why the breakage was silent.

**Why CI stayed green.** `scripts/test-registry-consumer.mjs` serves
`public/r` from the local filesystem over a throwaway HTTP server. It proves
the registry JSON is *correct*, never that it is *published*. No check
inspected the deploy output.

**Fix — commit `a86fdad`:**

- `apps/specimens/vite.config.ts`: `publicDir` now points at the workspace
  root `public/`, which contains only `r/`. Registry files land in
  `apps/specimens/dist/r/` for both `vite dev` and `vite build`.
- `vercel.json`: rewrite source is now `/((?!r/).*)`, so a missing registry
  item returns a real 404 instead of 200 HTML — `shadcn add` reports "not
  found" rather than failing on a JSON parse error.
- `scripts/verify-deploy-output.mjs` (new): asserts every `public/r/*.json`
  is present and byte-identical in `vercel.json`'s `outputDirectory`, that
  `index.html` is present, and that no rewrite to `/index.html` captures
  `/r/*`. Wired into `pnpm check` immediately after `pnpm build`.

**Verification:**

- Post-fix build: 34 items in `apps/specimens/dist/r`; asset hashes unchanged
  (`index-Bdto56ik.css`, `index-Lx5oImkc.js`) — the app bundle is untouched.
- Mutation 1, remove `publicDir`: `deploy:check` exits 1 listing all 34 items
  missing.
- Mutation 2, restore the `/(.*)` catch-all: `deploy:check` exits 1 with
  "vercel.json rewrite captures /r/*".
- Full `pnpm check` (the exact CI command) passes end to end.

**Noted, not changed:**

- `scripts/dev.py` still serves the legacy `Components.dc.html` and its
  docstring claims it mirrors production. Since `f447222` the deployed site
  is the Vite specimens app, so that script now mirrors nothing that ships.
  `.vercelignore` was also deleted in that migration while `dev.py`'s comment
  still cites it. Root `Components.dc.html` and `index.html` remain tracked
  but are no longer served.
- `apps/specimens/vite.config.ts` sets `build.sourcemap: true`, so a 1.9 MB
  `.js.map` is published. Harmless for an open-source library, but it is a
  deliberate choice worth revisiting if bandwidth matters.
