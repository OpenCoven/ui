# Repair Specimen Browser CSS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the specimen browser's intended visual hierarchy and responsive behavior without changing its React structure or public UI components.

**Architecture:** Treat `apps/specimens/src/app.tsx` as the correct markup contract and restore the last stylesheet that targeted that contract (`53347d1`). Preserve the later 320px and text-resize containment fixes, translate the one stale responsive selector, and strengthen the architecture check so markup/CSS selector drift fails before build or deployment. Reuse the existing browser-receipt work from `origin/test/specimen-visual-review` for rendered desktop and mobile coverage rather than creating a second harness.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Tailwind CSS 4, plain CSS, Node.js contract scripts, Chrome DevTools Protocol, GitHub Actions

---

## Root cause and scope

Commit `c4f01c1` introduced the current information hierarchy and class names in `apps/specimens/src/app.tsx`. Commit `5b89839` added the matching shell stylesheet, and `53347d1` added valid mobile block containment.

Commit `7b8f07c` was intended to change the viewport floor from `20rem` to `320px`, but it replaced the full compatible stylesheet with an older selector set. The current app therefore renders classes such as `.specimen-topbar__actions`, `.density-control`, `.specimen-hero`, and `.specimen-grid`, while the CSS still targets obsolete classes such as `.specimen-topbar__tools`, `.specimen-density`, `.specimen-rail__intro`, and `.catalog-group__grid`. Type checking and production builds remain green because no current check proves that the rendered shell hooks are styled.

This repair does not redesign the specimen browser, change component behavior, or alter package/registry output. It restores the already-approved shell and preserves the later responsive guards.

## File structure

- Modify: `apps/specimens/src/specimens.css` - restore the stylesheet matching the current React hierarchy and retain the fixed 320px viewport floor.
- Modify: `apps/specimens/src/specimens-fixes.css` - translate the stale catalog grid selector while preserving text-resize and narrow-viewport guards.
- Modify: `scripts/verify-contracts.mjs` - assert that every structural class rendered by the specimen app has a matching selector and that obsolete shell selectors cannot return.
- Create from existing reviewed work: `scripts/visual-review.mjs` - desktop/mobile shell, route, theme, density, overflow, and runtime-error receipt runner.
- Create from existing reviewed work: `scripts/mobile-quality-review.mjs` - 320-430px, RTL, reduced-motion, and 200% text-size regression runner.
- Create from existing reviewed work: `.github/workflows/visual-review.yml` - build, preview, Chrome setup, browser checks, and artifact upload.
- Reference only: `apps/specimens/src/app.tsx` - canonical shell class and landmark contract; no markup changes are expected.
- Reference only: `packages/ui/tests/mobile-blocks.test.tsx` - existing component-level mobile wrapping coverage; no changes are expected.

### Task 1: Make selector drift fail before the CSS repair

**Files:**
- Modify: `scripts/verify-contracts.mjs:20-165`
- Test: `scripts/verify-contracts.mjs`

- [ ] **Step 1: Add a combined specimen stylesheet source**

Immediately after the existing `const vectors = JSON.parse(vectorsJson);` line, add:

```js
const specimenStyles = `${specimenCss}\n${specimenFixes}`;
```

- [ ] **Step 2: Add live markup-to-selector assertions**

Immediately after the current `assertions` array, add:

```js
const specimenSelectorPairs = [
  [
    "topbar actions",
    'className="specimen-topbar__actions"',
    ".specimen-topbar__actions",
  ],
  ["density control", 'className="density-control"', ".density-control"],
  ["scheme control", 'className="scheme-control"', ".scheme-control"],
  [
    "rail context",
    'className="specimen-rail__context"',
    ".specimen-rail__context",
  ],
  ["rail kicker", 'className="specimen-kicker numeric"', ".specimen-kicker"],
  [
    "rail package",
    'className="specimen-rail__package"',
    ".specimen-rail__package",
  ],
  ["hero", 'className="specimen-hero"', ".specimen-hero"],
  ["hero copy", 'className="specimen-hero__copy"', ".specimen-hero__copy"],
  ["hero stats", 'className="specimen-stats"', ".specimen-stats"],
  [
    "catalog eyebrow",
    'className="catalog-group__eyebrow numeric"',
    ".catalog-group__eyebrow",
  ],
  ["specimen grid", 'className="specimen-grid"', ".specimen-grid"],
];

for (const [name, markup, selector] of specimenSelectorPairs) {
  assertions.push([
    `${name} markup and CSS stay paired`,
    specimenApp.includes(markup) && specimenStyles.includes(selector),
  ]);
}

const obsoleteSpecimenSelectors = [
  ".specimen-topbar__tools",
  ".specimen-density",
  ".specimen-topbar__icon",
  ".specimen-rail__intro",
  ".specimen-eyebrow",
  ".catalog-group__grid",
];

for (const selector of obsoleteSpecimenSelectors) {
  assertions.push([
    `obsolete specimen selector is absent: ${selector}`,
    !specimenStyles.includes(selector),
  ]);
}
```

These assertions are intentionally explicit. Do not implement a generic class-name parser because `app.tsx` also contains Tailwind utility classes that are generated rather than written as literal CSS selectors.

- [ ] **Step 3: Update the existing responsive-grid assertion**

Replace:

```js
specimenFixes.includes(
  ".catalog-group__grid {\n    grid-template-columns: minmax(0, 1fr);",
),
```

with:

```js
specimenFixes.includes(
  ".specimen-grid {\n    grid-template-columns: minmax(0, 1fr);",
),
```

- [ ] **Step 4: Run the contract check and confirm it exposes the regression**

Run:

```bash
pnpm contracts:check
```

Expected: FAIL. The failure list must include missing live selectors such as `topbar actions markup and CSS stay paired`, `hero markup and CSS stay paired`, and `specimen grid markup and CSS stay paired`, plus obsolete-selector failures.

Do not continue if the new assertions pass against the current stylesheet; that means the test is not checking the broken contract.

### Task 2: Restore the canonical shell stylesheet

**Files:**
- Modify: `apps/specimens/src/specimens.css:1-696`
- Test: `scripts/verify-contracts.mjs`

- [ ] **Step 1: Confirm the target file has no uncommitted user edits**

Run:

```bash
git diff --quiet -- apps/specimens/src/specimens.css
```

Expected: exit 0.

If this command fails, stop and reconcile the local edits rather than overwriting them.

- [ ] **Step 2: Restore the last stylesheet that matches the current markup**

Run:

```bash
git restore --source=53347d1 -- apps/specimens/src/specimens.css
```

Expected: `apps/specimens/src/specimens.css` returns to the 799-line shell stylesheet containing all of these live selectors:

```text
.specimen-topbar__actions
.density-control
.scheme-control
.specimen-rail__context
.specimen-kicker
.specimen-rail__package
.specimen-hero
.specimen-hero__copy
.specimen-stats
.catalog-group__eyebrow
.specimen-grid
```

The restored file must also retain the component-specific stage sizing rules for Composer, Session Header, Run Rail, and Transcript Turn, plus the assembled-lab containment added in `53347d1`.

- [ ] **Step 3: Reapply only the valid viewport-floor change**

Change the opening rule from:

```css
html {
  min-width: 20rem;
  scroll-padding-top: 7rem;
}
```

to:

```css
html {
  min-width: 320px;
  scroll-padding-top: 7rem;
}
```

Use a fixed pixel floor because a `rem`-based minimum grows when users increase root text size and can force document-level horizontal scrolling.

- [ ] **Step 4: Confirm the restored stylesheet targets the live app**

Run:

```bash
rg -n \
  'specimen-topbar__actions|density-control|scheme-control|specimen-rail__context|specimen-kicker|specimen-rail__package|specimen-hero|specimen-stats|catalog-group__eyebrow|specimen-grid' \
  apps/specimens/src/specimens.css
```

Expected: every listed live selector appears.

Then run:

```bash
pnpm contracts:check
```

Expected: FAIL only because `apps/specimens/src/specimens-fixes.css` still contains the obsolete `.catalog-group__grid` selector and its corresponding responsive assertion has not yet been satisfied.

### Task 3: Align the responsive regression layer with the restored shell

**Files:**
- Modify: `apps/specimens/src/specimens-fixes.css:54`
- Test: `scripts/verify-contracts.mjs`

- [ ] **Step 1: Translate the stale mobile grid selector**

Replace:

```css
.catalog-group__grid {
  grid-template-columns: minmax(0, 1fr);
}
```

with:

```css
.specimen-grid {
  grid-template-columns: minmax(0, 1fr);
}
```

Keep the rule in the `@media (max-width: 48rem)` block. Do not rename the React class back to the legacy selector; `.specimen-grid` is the current hierarchy contract and is already used by the compatible base stylesheet.

- [ ] **Step 2: Verify that no obsolete shell selectors remain**

Run:

```bash
if rg -n \
  'specimen-topbar__tools|specimen-density|specimen-topbar__icon|specimen-rail__intro|specimen-eyebrow|catalog-group__grid' \
  apps/specimens/src/specimens.css apps/specimens/src/specimens-fixes.css
then
  echo "obsolete specimen selectors remain" >&2
  exit 1
fi
```

Expected: exit 0 with no matching selectors.

- [ ] **Step 3: Run the repaired structural contract**

Run:

```bash
pnpm contracts:check
```

Expected: PASS with the existing architecture and portable-interaction contract count plus the new selector-pair assertions.

- [ ] **Step 4: Build the specimen app**

Run:

```bash
pnpm --filter @opencoven/specimens build
```

Expected: TypeScript and Vite complete successfully. The existing Tailwind/Rolldown sourcemap warning may still appear; it is unrelated to this CSS repair and must not be treated as a new failure.

- [ ] **Step 5: Commit the CSS repair and contract guard**

Run:

```bash
git add \
  apps/specimens/src/specimens.css \
  apps/specimens/src/specimens-fixes.css \
  scripts/verify-contracts.mjs
git commit \
  -m "fix(specimens): restore browser shell styles" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

Expected: one focused commit containing only the canonical stylesheet restoration, the translated responsive selector, and the selector-drift contract.

### Task 4: Bring the existing visual-review harness onto the repaired base

**Files:**
- Create: `scripts/visual-review.mjs`
- Create: `scripts/mobile-quality-review.mjs`
- Create: `.github/workflows/visual-review.yml`
- Reference: `origin/test/specimen-visual-review`

- [ ] **Step 1: Confirm the reviewed source files exist on the visual-review branch**

Run:

```bash
for path in \
  scripts/visual-review.mjs \
  scripts/mobile-quality-review.mjs \
  .github/workflows/visual-review.yml
do
  git cat-file -e "origin/test/specimen-visual-review:$path"
done
```

Expected: all three checks exit 0.

- [ ] **Step 2: Import only the browser-review files**

Run:

```bash
git restore \
  --source=origin/test/specimen-visual-review \
  -- \
  scripts/visual-review.mjs \
  scripts/mobile-quality-review.mjs \
  .github/workflows/visual-review.yml
```

Expected: exactly those three files are added.

Do not cherry-pick or restore `scripts/verify-contracts.mjs`, contract JSON, fixtures, ESLint configuration, or unrelated stack automation from the visual-review branch. Those branch copies predate current `main` contract work and would remove valid portable-interaction coverage.

- [ ] **Step 3: Confirm the visual matrix covers the repaired surfaces**

Run:

```bash
rg -n \
  'library-dark-desktop|library-dark-mobile|library-light-desktop|assembled-dark-desktop|assembled-dark-mobile' \
  scripts/visual-review.mjs

rg -n \
  'mobile-320-dark-cozy|mobile-375-light-compact|mobile-390-dark-rtl|mobile-390-dark-text-200' \
  scripts/mobile-quality-review.mjs
```

Expected: the general runner covers both routes, both schemes, both densities, and desktop/mobile layouts. The mobile runner covers the 320px floor, 375-430px widths, RTL, reduced motion, and 200% text size.

- [ ] **Step 4: Confirm the workflow is limited to presentation changes**

Run:

```bash
node - <<'NODE'
import { readFileSync } from "node:fs";

const workflow = readFileSync(".github/workflows/visual-review.yml", "utf8");
for (const marker of [
  '"apps/specimens/**"',
  '"packages/ui/**"',
  '"scripts/visual-review.mjs"',
  '"scripts/mobile-quality-review.mjs"',
  "pnpm build",
  "node scripts/visual-review.mjs",
  "node scripts/mobile-quality-review.mjs",
  "actions/upload-artifact@",
]) {
  if (!workflow.includes(marker)) {
    throw new Error(`visual workflow is missing ${marker}`);
  }
}
console.log("Visual workflow scope verified");
NODE
```

Expected: `Visual workflow scope verified`.

- [ ] **Step 5: Commit the visual regression coverage**

Run:

```bash
git add \
  .github/workflows/visual-review.yml \
  scripts/visual-review.mjs \
  scripts/mobile-quality-review.mjs
git commit \
  -m "test(specimens): guard browser shell rendering" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

Expected: a separate test-only commit that can be reviewed or reverted independently from the CSS repair.

### Task 5: Verify the repaired browser in production mode

**Files:**
- Test: `apps/specimens/src/app.tsx`
- Test: `apps/specimens/src/specimens.css`
- Test: `apps/specimens/src/specimens-fixes.css`
- Test: `scripts/visual-review.mjs`
- Test: `scripts/mobile-quality-review.mjs`
- Generated locally: `artifacts/visual-review/`
- Generated locally: `artifacts/mobile-quality/`

- [ ] **Step 1: Build the package and specimen app**

Run:

```bash
pnpm build
```

Expected: both `@opencoven/ui` and `@opencoven/specimens` build successfully.

- [ ] **Step 2: Start the production preview**

Run in a dedicated terminal:

```bash
pnpm --filter @opencoven/specimens preview --host 127.0.0.1 --port 4173
```

Expected: Vite reports `http://127.0.0.1:4173/`.

- [ ] **Step 3: Run the general visual receipt matrix**

Run:

```bash
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
BASE_URL="http://127.0.0.1:4173" \
node scripts/visual-review.mjs
```

Expected:

```text
Captured 5 passing visual-review scenarios.
```

The generated `artifacts/visual-review/summary.json` must report:

```json
{
  "passed": true
}
```

Every scenario must have zero document overflow, visible top bar/rail/main landmarks, the requested theme and density, 16 cards across three groups on `/`, and five tabs on `/lab`.

- [ ] **Step 4: Run the mobile quality matrix**

Run:

```bash
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
BASE_URL="http://127.0.0.1:4173" \
node scripts/mobile-quality-review.mjs
```

Expected: exit 0.

The generated `artifacts/mobile-quality/summary.json` must report `"passed": true`. Every scenario must have:

```text
document overflow <= 1px
card overflow <= 1px
stage overflow <= 1px
tab-root overflow <= 1px
48 tab targets
minimum tab target >= 44px
no transcript or session-header clipping
no mobile session-title ellipsis
reduced motion active
RTL applied in the RTL scenario
```

- [ ] **Step 5: Review the generated receipts**

Open these PNGs and compare hierarchy, spacing, and containment:

```text
artifacts/visual-review/library-dark-desktop.png
artifacts/visual-review/library-dark-mobile.png
artifacts/visual-review/library-light-desktop.png
artifacts/visual-review/assembled-dark-desktop.png
artifacts/visual-review/assembled-dark-mobile.png
artifacts/mobile-quality/mobile-320-dark-cozy.png
artifacts/mobile-quality/mobile-390-dark-rtl.png
artifacts/mobile-quality/mobile-390-dark-text-200.png
```

Expected visual contract:

```text
- The top bar lays out brand, route switcher, search, density, and scheme controls.
- The desktop rail is a bounded sticky sidebar with context, navigation, and package metadata.
- The hero uses the editorial heading and three-column summary stats.
- The library is grouped into Composer, Run rail, and Blocks sections.
- Specimen cards form two columns on desktop and one column at <= 48rem.
- Card tabs occupy the card width and stack above their active panel on mobile.
- The assembled lab contains its five-tab navigation and active content without clipping.
- Light/dark and cozy/compact changes are visibly applied.
- 320px, RTL, and 200% text-size receipts have no horizontal page overflow.
```

Do not approve the patch from numeric overflow checks alone; the original regression preserved a green build while destroying hierarchy.

### Task 6: Run repository gates and publish a clean patch

**Files:**
- Verify: all changed files

- [ ] **Step 1: Run the targeted checks together**

Run:

```bash
pnpm format:check &&
pnpm lint &&
pnpm typecheck &&
pnpm test &&
pnpm contracts:check &&
pnpm --filter @opencoven/specimens build
```

Expected: every command exits 0.

- [ ] **Step 2: Run the full repository check**

Run:

```bash
pnpm check
```

Expected: formatting, linting, type checking, unit tests, contracts, registry validation/build/freshness, clean-consumer installation, production builds, deploy checks, and package-export checks all pass.

- [ ] **Step 3: Inspect the final diff for scope**

Run:

```bash
git --no-pager diff --check
git --no-pager diff --stat HEAD~2..HEAD
git --no-pager status --short
```

Expected:

```text
- No whitespace errors.
- The CSS repair commit changes only specimens.css, specimens-fixes.css, and verify-contracts.mjs.
- The visual coverage commit adds only the two browser runners and one workflow.
- No generated registry files, component source, contract JSON, or unrelated automation files are changed.
```

- [ ] **Step 4: Confirm the development server still serves both routes**

Run:

```bash
curl --fail --silent --show-error http://127.0.0.1:5173/ >/dev/null
curl --fail --silent --show-error http://127.0.0.1:5173/lab >/dev/null
```

Expected: both commands exit 0. Leave the existing development server available for final review.
