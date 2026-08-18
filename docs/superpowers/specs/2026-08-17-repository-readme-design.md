# Repository README Design

## Decision

Add a showcase-first `README.md` for `OpenCoven/ui` that serves visitors and
contributors without presenting the repository as a packaged component library
or production application.

## Audience

The primary audience is designers and developers evaluating OpenCoven interface
direction. The secondary audience is contributors editing the standalone
specimen and refreshing its visual receipts.

## Content hierarchy

The README follows this order:

1. `OpenCoven UI` title and a one-sentence description.
2. The desktop editorial Messages preview as the hero image.
3. A short scope statement explaining that the repository contains standalone
   interface specimens and design artifacts, not production Coven Cave code.
4. A four-state overview covering Composer, Messages, Context, and Actions.
5. Zero-install local usage: clone the repository and open
   `Components.dc.html` in a browser.
6. A responsive-behavior section with the mobile Messages preview.
7. A compact repository map.
8. Contributor guidance.
9. Provenance links to the approved Messages design specification and
   implementation plan.

## Required copy and claims

- Describe `Components.dc.html` as a self-contained HTML, CSS, and JavaScript
  component browser.
- State that no dependency installation or build step is required to view it.
- Explain that its four states are selected through the specimen navigation.
- Describe the Messages view as an editorial familiar turn with identity,
  provenance, response, and utility hierarchy.
- State that the current artifact preserves keyboard navigation, focus states,
  reduced-motion handling, and a 390px mobile layout.
- Avoid claims that the repository is a published design system, reusable
  package, production app, or canonical source for Coven Cave components.

## Images

Use repository-relative image paths so GitHub renders both previews:

- Hero:
  `artifacts/Components-messages-editorial-preview.png`
- Responsive section:
  `artifacts/Components-messages-editorial-mobile.png`

Both images require descriptive alt text. The hero may use centered HTML for a
controlled display width; the mobile image should use a narrower width that
does not dominate the page.

## Local usage

The README provides:

```bash
git clone https://github.com/OpenCoven/ui.git
cd ui
open Components.dc.html
```

It notes that non-macOS users can open `Components.dc.html` directly in their
browser instead of using `open`.

## Repository map

The map names only committed repository surfaces:

| Path | Purpose |
| --- | --- |
| `Components.dc.html` | Self-contained interactive component browser |
| `artifacts/` | Verified desktop and mobile visual receipts |
| `docs/superpowers/specs/` | Approved design decisions |
| `docs/superpowers/plans/` | Implementation plans and verification steps |
| `handoffs/` | Completion and validation receipts |

## Contributor workflow

Contributors should:

1. Keep the component browser self-contained unless the repository architecture
   is intentionally changed in a separately approved design.
2. Preserve all four component states and existing navigation semantics.
3. Verify embedded JavaScript parsing, four-state selection, arrow-key
   navigation, and 390px horizontal overflow.
4. Refresh both desktop and mobile screenshots when visual behavior changes.
5. Record exact verification evidence in the relevant handoff receipt.

The README will not embed long validation scripts; it links to the current
implementation plan for exact commands.

## Presentation constraints

- No badges until the repository has real automation, releases, or licensing
  metadata to support them.
- No deployment, package-installation, or framework setup section.
- Keep prose compact and use the existing graphite/violet screenshots as the
  visual identity.
- Use standard GitHub Markdown and simple inline HTML only for image sizing or
  centering.

## Verification

1. Confirm every linked repository-relative path exists.
2. Confirm both image paths render from GitHub's default branch.
3. Confirm the clone and local-open commands match the repository name and
   artifact path.
4. Confirm the state names and behavior claims match `Components.dc.html`.
5. Scan for unsupported package, production, deployment, or licensing claims.

## Completion evidence

The README task is complete only when:

- `/Users/buns/.coven/workspaces/familiars/cody/README.md` exists;
- all referenced paths resolve locally;
- the README is committed and pushed to `OpenCoven/ui`;
- the final response provides the README path, commit URL, and repository URL.
