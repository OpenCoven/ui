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
  - Status: attached to the project, blocked on registrar DNS
  - Attached: 2026-08-20 via `POST /v10/projects/opencoven-ui/domains`
  - API response: `{"name":"ui.opencoven.ai","apexName":"opencoven.ai","projectId":"prj_g5iBF1ucxTlq567g4DlLeFLvRjRR","verified":true}`
  - CLI note: `vercel domains add ui.opencoven.ai opencoven-ui` fails with
    "expects one argument" in CLI 52.2.1; the REST API is the working path
  - Required DNS record at Namecheap (`opencoven.ai` uses
    `pdns1/pdns2.registrar-servers.com`):
    - Type `CNAME`, Host `ui`, Value `37644e98f1c1fdba.vercel-dns-016.com.`
  - Current DNS: `ui.opencoven.ai` resolves to `192.64.119.254` (registrar
    parking); `GET /v6/domains/ui.opencoven.ai/config` reports
    `misconfigured: true`
  - Blocker: no Namecheap API credentials are configured on this machine, and
    the Namecheap `setHosts` API replaces the entire record set for a domain,
    which would endanger the ten existing `opencoven.ai` subdomains
  - Pending after DNS propagates: `curl https://ui.opencoven.ai/` returns 200,
    `misconfigured: false`, README live-demo link, GitHub `homepageUrl` update
- Worktree state: all deployment changes are committed and pushed; HEAD equals origin/main; unrelated untracked familiar-workspace files remain untouched
- Next action: add the `CNAME ui -> 37644e98f1c1fdba.vercel-dns-016.com.` record
  in the Namecheap dashboard for `opencoven.ai`, then re-run verification
