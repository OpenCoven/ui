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
  - CLI note: `vercel domains add ui.opencoven.ai opencoven-ui` fails with
    "expects one argument" in CLI 52.2.1; the REST API is the working path
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
