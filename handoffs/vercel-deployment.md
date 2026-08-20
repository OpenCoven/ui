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
