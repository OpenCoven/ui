# Specimen Library Layout Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the React specimen gallery with a focused documentation browser that matches `index.html`'s navigation hierarchy and `Components.dc.html`'s specimen staging while preserving modern package-backed components and controls.

**Architecture:** Keep `/` and `/lab` as the two Vite-served surfaces, use query parameters for selected library pages and assembled scenes, and reserve hashes for in-page sections. Split the current 900-line app into typed specimen definitions, focused page renderers, and a smaller shell/controller; update structural contracts and browser receipts before changing the stylesheet.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Tailwind CSS 4, plain CSS, Base UI-backed OpenCoven components, Node.js contract scripts, Chrome DevTools Protocol

---

## File structure

- Create `apps/specimens/src/specimen-definitions.tsx` — typed introductory
  pages, sixteen package-backed specimen records, and five assembled-scene
  records.
- Create `apps/specimens/src/specimen-pages.tsx` — overview, usage,
  component-detail, and assembled-scene renderers.
- Create `apps/specimens/src/specimen-navigation.ts` — URL parsing,
  normalization, and URL construction helpers with no React dependency.
- Modify `apps/specimens/src/app.tsx` — shared top bar, navigation controller,
  responsive browser selector, History API integration, and route composition.
- Rewrite `apps/specimens/src/specimens.css` — documentation shell, focused
  preview, anatomy, assembled-scene, and responsive layout.
- Rewrite `apps/specimens/src/specimens-fixes.css` — narrow-width, 200% text,
  RTL, and reduced-motion regression guards only.
- Modify `scripts/verify-contracts.mjs` — new source boundaries and structural
  assertions.
- Modify `scripts/visual-review.mjs` — overview, focused component, install,
  and assembled-scene receipts.
- Modify `scripts/mobile-quality-review.mjs` — focused-page mobile, RTL, text
  resize, anatomy, selector, and overflow receipts.

### Task 1: Make the new specimen architecture fail its contract first

**Files:**
- Modify: `scripts/verify-contracts.mjs:5-225`
- Test: `scripts/verify-contracts.mjs`

- [ ] **Step 1: Read the planned modules in the contract script**

Replace the current specimen-source entries in the `Promise.all` setup with
these values:

```js
const [
  componentsJson,
  packageJson,
  tokens,
  specimenCss,
  specimenFixes,
  specimenApp,
  specimenDefinitions,
  specimenPages,
  specimenNavigation,
  button,
  tooltip,
  menu,
  portableJson,
  vectorsJson,
  fixture,
  fixtureScript,
  portableDocs,
] = await Promise.all([
  read("components.json"),
  read("packages/ui/package.json"),
  read("packages/ui/src/styles/globals.css"),
  read("apps/specimens/src/specimens.css"),
  read("apps/specimens/src/specimens-fixes.css"),
  read("apps/specimens/src/app.tsx"),
  read("apps/specimens/src/specimen-definitions.tsx"),
  read("apps/specimens/src/specimen-pages.tsx"),
  read("apps/specimens/src/specimen-navigation.ts"),
  read("packages/ui/src/components/ui/button.tsx"),
  read("packages/ui/src/components/ui/tooltip.tsx"),
  read("packages/ui/src/components/ui/dropdown-menu.tsx"),
  read("contracts/web-interactions.v1.json"),
  read("contracts/test-vectors.v1.json"),
  read("contracts/fixtures/reference.html"),
  read("contracts/fixtures/reference.js"),
  read("contracts/README.md"),
]);
```

Temporarily use `read(...).catch(() => "")` for the three new files so the
contract reaches the assertions before those files exist:

```js
const readOptional = (relativePath) =>
  read(relativePath).catch((error) => {
    if (error.code === "ENOENT") return "";
    throw error;
  });
```

Use `readOptional` for `specimen-definitions.tsx`, `specimen-pages.tsx`, and
`specimen-navigation.ts` only.

- [ ] **Step 2: Replace gallery-era assertions**

Delete the assertions named:

```text
catalog restores task hierarchy
responsive rail becomes compact navigation
responsive grids remove intrinsic sizing floors
mobile catalog navigation exposes every section
```

Replace `specimenSelectorPairs` with:

```js
const specimenSelectorPairs = [
  ["topbar actions", ".specimen-topbar__actions"],
  ["desktop navigation", ".specimen-navigation"],
  ["mobile browser", ".specimen-mobile-browser"],
  ["focused page", ".specimen-page"],
  ["page title", ".specimen-page__title"],
  ["page contents", ".specimen-toc"],
  ["preview frame", ".specimen-preview"],
  ["preview canvas", ".specimen-preview__canvas"],
  ["preview anatomy", ".specimen-preview__anatomy"],
  ["assembled scene", ".assembled-scene"],
];

for (const [name, selector] of specimenSelectorPairs) {
  assertions.push([
    `${name} markup and CSS stay paired`,
    `${specimenApp}\n${specimenPages}`.includes(
      `className="${selector.slice(1)}`,
    ) && specimenStyles.includes(selector),
  ]);
}
```

Add architecture assertions:

```js
assertions.push(
  [
    "specimen definitions cover every public entry",
    [
      "mode-switch",
      "send-control",
      "completion-palette",
      "attachment-chip",
      "metric-display",
      "plan-row",
      "activity-item",
      "resource-row",
      "tool-mix",
      "failure-surface",
      "context-meter",
      "budget-pill",
      "composer",
      "run-rail",
      "transcript-turn",
      "session-header",
    ].every((id) => specimenDefinitions.includes(`id: "${id}"`)),
  ],
  [
    "assembled definitions cover five scenes",
    ["composer", "messages", "context", "actions", "cards"].every((id) =>
      specimenDefinitions.includes(`id: "${id}"`),
    ),
  ],
  [
    "query navigation keeps section hashes independent",
    specimenNavigation.includes("URLSearchParams") &&
      specimenNavigation.includes('"component"') &&
      specimenNavigation.includes('"scene"') &&
      specimenApp.includes('"popstate"'),
  ],
  [
    "focused documentation replaces the repeated card gallery",
    !specimenApp.includes('className="specimen-grid"') &&
      !specimenPages.includes('className="specimen-card"') &&
      specimenPages.includes('id="preview"') &&
      specimenPages.includes('id="anatomy"') &&
      specimenPages.includes('id="install"') &&
      specimenPages.includes('id="usage"'),
  ],
);
```

Replace the old mobile assertion with:

```js
[
  "mobile layout keeps complete focused-page navigation",
  specimenFixes.includes("@media (max-width: 68rem)") &&
    specimenFixes.includes(".specimen-mobile-browser") &&
    specimenFixes.includes(".specimen-preview__anatomy"),
],
```

- [ ] **Step 3: Add obsolete-gallery guards**

Set the obsolete selector list to:

```js
const obsoleteSpecimenSelectors = [
  ".catalog-group",
  ".specimen-grid",
  ".specimen-card",
  ".assembled-lab",
  ".assembled-lab__tabs",
];
```

- [ ] **Step 4: Run the contract and confirm the intended failure**

Run:

```bash
pnpm contracts:check
```

Expected: FAIL on the new module, focused-page, query-navigation, and
markup/CSS pairing assertions. The portable interaction assertions must still
run.

- [ ] **Step 5: Commit the failing contract**

```bash
git add scripts/verify-contracts.mjs
git commit \
  -m "test(specimens): define focused browser contract" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 2: Add typed URL navigation and specimen definitions

**Files:**
- Create: `apps/specimens/src/specimen-navigation.ts`
- Create: `apps/specimens/src/specimen-definitions.tsx`
- Modify: `apps/specimens/src/app.tsx`
- Test: `scripts/verify-contracts.mjs`

- [ ] **Step 1: Implement pure URL selection helpers**

Create `apps/specimens/src/specimen-navigation.ts`:

```ts
export type LibrarySelection =
  | { kind: "overview" }
  | { kind: "using-these" }
  | { kind: "component"; id: string };

export type AppSelection =
  | { surface: "library"; page: LibrarySelection }
  | { surface: "assembled"; scene: string };

const normalizePath = (pathname: string) =>
  pathname.replace(/\/+$/, "") || "/";

export function readSelection(
  location: Pick<Location, "pathname" | "search">,
  componentIds: ReadonlySet<string>,
  sceneIds: ReadonlySet<string>,
): AppSelection {
  const pathname = normalizePath(location.pathname);
  const params = new URLSearchParams(location.search);

  if (pathname === "/lab") {
    const scene = params.get("scene");
    return {
      surface: "assembled",
      scene: scene && sceneIds.has(scene) ? scene : "composer",
    };
  }

  const component = params.get("component");
  if (component && componentIds.has(component)) {
    return { surface: "library", page: { kind: "component", id: component } };
  }

  return {
    surface: "library",
    page:
      params.get("page") === "using-these"
        ? { kind: "using-these" }
        : { kind: "overview" },
  };
}

export function selectionHref(selection: AppSelection): string {
  if (selection.surface === "assembled") {
    return `/lab?scene=${encodeURIComponent(selection.scene)}`;
  }

  if (selection.page.kind === "component") {
    return `/?component=${encodeURIComponent(selection.page.id)}`;
  }

  return selection.page.kind === "using-these" ? "/?page=using-these" : "/";
}
```

- [ ] **Step 2: Define the shared record types and derived install metadata**

Create the top of `apps/specimens/src/specimen-definitions.tsx`:

```tsx
import type { ReactNode } from "react";

export type Density = "default" | "compact";
export type Scheme = "light" | "dark";
export type SpecimenGroup = "Composer" | "Run rail" | "Blocks";

export type AnatomyItem = {
  label: string;
  detail: string;
};

export type SpecimenDefinition = {
  id: string;
  title: string;
  group: SpecimenGroup;
  primitive: string;
  description: string;
  states: string;
  previewLabel: string;
  preview: ReactNode;
  anatomy: AnatomyItem[];
  usage: string[];
  exportName: string;
  sourceKind: "components" | "blocks";
  registryUrl: string;
  packagePath: string;
};

export type IntroPageDefinition = {
  id: "overview" | "using-these";
  title: string;
  eyebrow: string;
  description: string;
};

export type AssembledSceneDefinition = {
  id: "composer" | "messages" | "context" | "actions" | "cards";
  title: string;
  eyebrow: string;
  code: string;
  description: string;
  previewLabel: string;
  preview: ReactNode;
  anatomy: AnatomyItem[];
};

const derivedFields = (
  id: string,
  exportName: string,
  group: SpecimenGroup,
) => {
  const sourceKind = group === "Blocks" ? "blocks" : "components";
  return {
    exportName,
    sourceKind,
    registryUrl: `https://ui.opencoven.ai/r/${id}.json`,
    packagePath: `@opencoven/ui/${sourceKind}/${id}`,
  } as const;
};
```

- [ ] **Step 3: Move all existing live previews into a factory**

Export this signature:

```tsx
export function createSpecimenDefinitions({
  density,
  mode,
  setMode,
  message,
  setMessage,
}: {
  density: Density;
  mode: ComposerMode;
  setMode: (mode: ComposerMode) => void;
  message: string;
  setMessage: (message: string) => void;
}): SpecimenDefinition[];
```

Import the same OpenCoven modules currently imported by `app.tsx`. Relocate the
complete sixteen-entry array currently created in `Library` without altering
any preview JSX. For each entry, keep the current `id`, title, group,
primitive, description, states, and preview; add
`...derivedFields(id, exportName, group)` and the following metadata:

| ID | Preview label | Anatomy labels | Usage |
|---|---|---|---|
| `mode-switch` | `Default · Do selected` | Authority, Pressed state, Density | Keep one selected mode; label changes must describe authority. |
| `send-control` | `Ready + running` | Primary action, Stop state, Stable footprint | Use as the only filled action; do not shift layout when running. |
| `completion-palette` | `Open · keyboard ready` | Trigger, Command label, Description | Keep essential command meaning visible and support keyboard selection. |
| `attachment-chip` | `Ready · uploading · failed` | File identity, Operational state, Recovery | Always pair progress or failure color with text. |
| `metric-display` | `Comparable values` | Value, Unit, Label | Use tabular numerals and no more than one emphasized metric per group. |
| `plan-row` | `Complete · active · pending` | State mark, Task label, Duration | Preserve state through icon, text, and weight under reduced motion. |
| `activity-item` | `Read · exec · write · net` | Spine + dot, Verb, Object + duration | Keep tool order and hues consistent across every evidence surface. |
| `resource-row` | `Modified + added` | Operation, Path, Diff | Preserve the filename end and keep additions/deletions numeric. |
| `tool-mix` | `Populated` | Tool order, Segment, Text equivalent | Always use read, exec, write, net order and expose values as text. |
| `failure-surface` | `Failed · recoverable` | Receipt, Output, Recovery | Keep stderr visually quiet and recovery actions explicit. |
| `context-meter` | `Normal + warning` | Label, Progress, Threshold | Use the fixed warning threshold and avoid value-driven layout shifts. |
| `budget-pill` | `Normal · warning · over` | Spend, Limit, Tone | Pair semantic tone with iconography and explicit numbers. |
| `composer` | `Ready with attachment` | Draft, Context, Authority + send | Compose only public controls and keep writing visually primary. |
| `run-rail` | `Populated · active` | Metrics, Activity, Limits | Keep evidence append-only and separate status from decoration. |
| `transcript-turn` | `Complete with utilities` | Identity, Provenance, Response | Let familiar identity lead while the response remains editorial. |
| `session-header` | `Active session` | Task, Branch, Run state + budget | Keep the task readable before operational metadata. |

Use one anatomy detail sentence and one usage string per comma-separated item
in the table. Do not add new component behavior.

- [ ] **Step 4: Define introductory pages and assembled scenes**

Export:

```tsx
export const introPages: IntroPageDefinition[] = [
  {
    id: "overview",
    eyebrow: "Component reference",
    title: "The agent surface",
    description:
      "Public agent UI organized for scanning, inspection, installation, and reuse.",
  },
  {
    id: "using-these",
    eyebrow: "Getting started",
    title: "Using these components",
    description:
      "Install through the registry or package API while preserving the shared theme contract.",
  },
];
```

Export `createAssembledScenes({ density, mode, setMode, message, setMessage })`
and relocate the complete `views` record currently created in `Lab` into five
typed records with:

```text
composer: Input / primary, CHAT·01, Composer controls
messages: Transcript / familiar, CHAT·02, Message surfaces
context: Provenance / access, CHAT·03, Context surfaces
actions: Authority / consequence, CHAT·04, Action surfaces
cards: Artifact / embedded, CHAT·05, Artifact cards
```

Use these descriptions:

```text
Composer: A compact writing surface that keeps model, context, and send state visible without competing with the draft.
Messages: Identity leads the response while the message body stays quiet, readable, and visually connected to its familiar.
Context: Linked repositories and tasks state provenance and access before the agent acts.
Actions: Explicit verbs pair keyboard access with a visible consequence.
Cards: In-message artifacts name their kind first, keep provenance visible, and never present a pending write as performed.
```

Use these anatomy label sets:

```text
Composer: Draft field, Context actions, Model + send
Messages: Identity, Provenance, Response
Context: Source, Access, Relationship
Actions: Verb, Consequence, Shortcut
Cards: Kind, State, Provenance, Reader
```

- [ ] **Step 5: Wire definitions into `App` without changing the old rendering yet**

In `apps/specimens/src/app.tsx`, import:

```tsx
import {
  createAssembledScenes,
  createSpecimenDefinitions,
  type Density,
  type Scheme,
} from "./specimen-definitions";
import {
  readSelection,
  selectionHref,
  type AppSelection,
} from "./specimen-navigation";
```

Add:

```tsx
const [selection, setSelection] = useState<AppSelection>(() =>
  readSelection(window.location, componentIds, sceneIds),
);

useEffect(() => {
  const updateSelection = () =>
    setSelection(readSelection(window.location, componentIds, sceneIds));
  window.addEventListener("popstate", updateSelection);
  return () => window.removeEventListener("popstate", updateSelection);
}, [componentIds, sceneIds]);

const navigate = (next: AppSelection, focusHeading = false) => {
  history.pushState(null, "", selectionHref(next));
  setSelection(next);
  if (focusHeading) {
    requestAnimationFrame(() => pageHeadingRef.current?.focus());
  }
};
```

Memoize `componentIds` and `sceneIds` from the generated definitions. Keep the
old `Library` and `Lab` rendering for this step.

- [ ] **Step 6: Run type checking and the contract**

Run:

```bash
pnpm --filter @opencoven/specimens typecheck
pnpm contracts:check
```

Expected: type checking passes. The contract still fails only on focused-page
markup/CSS assertions because Task 3 and Task 4 have not landed.

- [ ] **Step 7: Commit the navigation and definitions**

```bash
git add \
  apps/specimens/src/app.tsx \
  apps/specimens/src/specimen-definitions.tsx \
  apps/specimens/src/specimen-navigation.ts
git commit \
  -m "refactor(specimens): define navigable specimen pages" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 3: Replace the catalog grid with focused library pages

**Files:**
- Create: `apps/specimens/src/specimen-pages.tsx`
- Modify: `apps/specimens/src/app.tsx`
- Test: `scripts/verify-contracts.mjs`

- [ ] **Step 1: Add shared focused-page section primitives**

Create `apps/specimens/src/specimen-pages.tsx` with:

```tsx
import type { ReactNode, RefObject } from "react";
import {
  Badge,
  Button,
} from "@opencoven/ui";
import { ArrowRight, Sparkles } from "lucide-react";

import type {
  AssembledSceneDefinition,
  SpecimenDefinition,
} from "./specimen-definitions";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  meta?: ReactNode;
};

function PageHeader({
  eyebrow,
  title,
  description,
  headingRef,
  meta,
}: PageHeaderProps) {
  return (
    <header className="specimen-page__header">
      <div>
        <p className="specimen-kicker numeric">{eyebrow}</p>
        <h1 className="specimen-page__title" ref={headingRef} tabIndex={-1}>
          {title}
        </h1>
        <p className="specimen-page__lede">{description}</p>
      </div>
      {meta}
    </header>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="specimen-section" id={id}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
```

- [ ] **Step 2: Implement the focused component page**

Add:

```tsx
export function ComponentPage({
  specimen,
  headingRef,
}: {
  specimen: SpecimenDefinition;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <article className="specimen-page" data-page-kind="component">
      <PageHeader
        eyebrow={`${specimen.group} / ${specimen.primitive}`}
        title={specimen.title}
        description={specimen.description}
        headingRef={headingRef}
        meta={<Badge>{specimen.primitive}</Badge>}
      />
      <Section id="preview" title="Preview">
        <div className="specimen-preview">
          <header className="specimen-preview__toolbar">
            <span className="numeric">{specimen.previewLabel}</span>
            <span aria-hidden="true">•••</span>
          </header>
          <div className="specimen-preview__layout">
            <div className="specimen-preview__canvas">{specimen.preview}</div>
            <aside
              className="specimen-preview__anatomy"
              aria-label={`${specimen.title} anatomy`}
            >
              {specimen.anatomy.map((item) => (
                <div key={item.label}>
                  <strong>{item.label}</strong>
                  <span>{item.detail}</span>
                </div>
              ))}
            </aside>
          </div>
        </div>
      </Section>
      <Section id="anatomy" title="Anatomy">
        <dl className="specimen-anatomy-list">
          {specimen.anatomy.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.detail}</dd>
            </div>
          ))}
        </dl>
      </Section>
      <Section id="install" title="Install">
        <div className="specimen-install-grid">
          <pre className="specimen-command numeric">
            <code>{`pnpm dlx shadcn@latest add ${specimen.registryUrl}`}</code>
          </pre>
          <pre className="specimen-command numeric">
            <code>{`import { ${specimen.exportName} } from "${specimen.packagePath}";`}</code>
          </pre>
        </div>
      </Section>
      <Section id="usage" title="Usage">
        <ul className="specimen-usage-list">
          {specimen.usage.map((item) => <li key={item}>{item}</li>)}
          <li>
            <span className="numeric">States</span> {specimen.states}
          </li>
        </ul>
      </Section>
    </article>
  );
}
```

The visible Anatomy section intentionally repeats the concise anatomy labels
shown beside the preview. The side panel supports visual inspection; the
document section supports reading and direct linking.

- [ ] **Step 3: Implement Overview and Using These**

Add `OverviewPage` with:

- the title `The agent surface`;
- a four-cell strip for 16 Components, 4 Blocks, 2 Schemes, 2 Densities;
- sections `two-surfaces`, `house-rules`, and `start`;
- links that call the supplied navigation callback for the first Composer,
  Run rail, and Block entries.

Add `UsingThesePage` with:

- package and registry installation examples;
- the rules already documented in `README.md` under Contribution rules;
- links to Overview and the first component.

Use the existing `specimen-command`, `specimen-kicker`, and `numeric` styling
hooks. Do not duplicate live component previews on either introductory page.

- [ ] **Step 4: Replace `Library` and `SpecimenCard` in `app.tsx`**

Delete `SpecimenCard` and `Library`. Render:

```tsx
const selectedComponent =
  selection.surface === "library" &&
  selection.page.kind === "component"
    ? specimens.find((item) => item.id === selection.page.id)
    : undefined;

const libraryPage =
  selection.surface !== "library" || selection.page.kind === "overview" ? (
    <OverviewPage headingRef={pageHeadingRef} onNavigate={navigate} />
  ) : selection.page.kind === "using-these" ? (
    <UsingThesePage headingRef={pageHeadingRef} onNavigate={navigate} />
  ) : selectedComponent ? (
    <ComponentPage specimen={selectedComponent} headingRef={pageHeadingRef} />
  ) : (
    <OverviewPage headingRef={pageHeadingRef} onNavigate={navigate} />
  );
```

Build the desktop library navigation from `introPages`, `groupOrder`, and
`specimens`. Every link must have a real `href={selectionHref(...)}`, call
`preventDefault()`, call `navigate(...)`, and apply `aria-current="page"` to
the selected item.

Build the right contents rail from:

```tsx
const componentSections = [
  ["preview", "Preview"],
  ["anatomy", "Anatomy"],
  ["install", "Install"],
  ["usage", "Usage"],
] as const;
```

Overview uses `two-surfaces`, `house-rules`, and `start`; Using These uses
`registry`, `package`, and `rules`.

- [ ] **Step 5: Implement search as focused-page navigation**

Keep `SearchField`, but render an anchored result panel while `query` is not
empty:

```tsx
const searchResults = specimens.filter((specimen) =>
  `${specimen.title} ${specimen.group} ${specimen.description}`
    .toLowerCase()
    .includes(query.trim().toLowerCase()),
);
```

Each result navigates to `{ surface: "library", page: { kind: "component",
id } }`, clears the query, and focuses the page heading. If no results exist,
render the current Sparkles-marked empty message plus:

```tsx
<Button variant="outline" onClick={() => setQuery("")}>
  Clear search
</Button>
```

- [ ] **Step 6: Add the mobile grouped selector**

Render `.specimen-mobile-browser` after the top bar:

```tsx
<label className="specimen-mobile-browser">
  <span>
    <small className="numeric">{currentFamily}</small>
    {currentTitle}
  </span>
  <select
    aria-label="Browse specimen pages"
    value={selectionHref(selection)}
    onChange={(event) => {
      navigate(readHref(event.target.value), true);
    }}
  >
    <optgroup label="Getting started">
      {introPages.map((page) => {
        const next = {
          surface: "library",
          page:
            page.id === "overview"
              ? { kind: "overview" }
              : { kind: "using-these" },
        } satisfies AppSelection;
        return (
          <option key={page.id} value={selectionHref(next)}>
            {page.title}
          </option>
        );
      })}
    </optgroup>
    {groupOrder.map((group) => (
      <optgroup key={group} label={group}>
        {specimens
          .filter((specimen) => specimen.group === group)
          .map((specimen) => {
            const next = {
              surface: "library",
              page: { kind: "component", id: specimen.id },
            } satisfies AppSelection;
            return (
              <option key={specimen.id} value={selectionHref(next)}>
                {specimen.title}
              </option>
            );
          })}
      </optgroup>
    ))}
  </select>
</label>
```

Add `readHref` to `specimen-navigation.ts` by constructing a URL against
`window.location.origin` and calling `readSelection`. Pass the ID sets into the
helper rather than importing definitions into the navigation module.

- [ ] **Step 7: Run the contract**

Run:

```bash
pnpm contracts:check
```

Expected: failures remain only for assembled-scene markup and new CSS selectors.

- [ ] **Step 8: Commit focused library pages**

```bash
git add \
  apps/specimens/src/app.tsx \
  apps/specimens/src/specimen-navigation.ts \
  apps/specimens/src/specimen-pages.tsx
git commit \
  -m "feat(specimens): add focused library pages" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 4: Replace the generic workbench with focused assembled scenes

**Files:**
- Modify: `apps/specimens/src/specimen-pages.tsx`
- Modify: `apps/specimens/src/app.tsx`
- Test: `scripts/verify-contracts.mjs`

- [ ] **Step 1: Implement the assembled scene renderer**

Add:

```tsx
export function AssembledScenePage({
  scene,
  headingRef,
}: {
  scene: AssembledSceneDefinition;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <article className="assembled-scene">
      <PageHeader
        eyebrow={scene.eyebrow}
        title={scene.title}
        description={scene.description}
        headingRef={headingRef}
        meta={
          <span className="assembled-scene__code numeric">
            <strong>{scene.code}</strong>
            <small>Interface specimen</small>
          </span>
        }
      />
      <div className="specimen-preview assembled-scene__preview" id="preview">
        <header className="specimen-preview__toolbar">
          <span className="numeric">{scene.previewLabel}</span>
          <span aria-hidden="true">•••</span>
        </header>
        <div className="specimen-preview__layout">
          <div className="specimen-preview__canvas">{scene.preview}</div>
          <aside
            className="specimen-preview__anatomy"
            aria-label={`${scene.title} anatomy`}
          >
            {scene.anatomy.map((item) => (
              <div key={item.label}>
                <strong>{item.label}</strong>
                <span>{item.detail}</span>
              </div>
            ))}
          </aside>
        </div>
      </div>
      <div className="specimen-token-strip" id="tokens" aria-label="Design tokens">
        {[
          ["presence", "var(--presence)"],
          ["raised", "var(--card)"],
          ["line", "var(--border)"],
          ["text", "var(--foreground)"],
        ].map(([name, color]) => (
          <div key={name}>
            <span style={{ background: color }} />
            <small className="numeric">{name}</small>
          </div>
        ))}
      </div>
      <footer className="assembled-scene__footer">
        <span>Interactive component</span>
        <span className="numeric">{scene.code.replace("CHAT·", "")} / 05</span>
      </footer>
    </article>
  );
}
```

- [ ] **Step 2: Remove `Lab` and render the selected scene**

Delete the current `Lab` function from `app.tsx`. Resolve:

```tsx
const selectedScene =
  selection.surface === "assembled"
    ? scenes.find((scene) => scene.id === selection.scene) ?? scenes[0]
    : scenes[0];
```

Render the five scene links in `.specimen-navigation` and render:

```tsx
<AssembledScenePage scene={selectedScene} headingRef={pageHeadingRef} />
```

Do not render `specimen-hero`, summary stats, `Tabs`, or `.assembled-lab` on
the assembled route.

- [ ] **Step 3: Add assembled page-context links**

Use a short right rail with links to `#preview` and `#tokens`. The anatomy
remains inside the preview and therefore does not receive a duplicate
standalone section on assembled pages.

- [ ] **Step 4: Run type checking and the contract**

Run:

```bash
pnpm --filter @opencoven/specimens typecheck
pnpm contracts:check
```

Expected: type checking passes. Contract failures are now limited to selectors
that Task 5 has not implemented.

- [ ] **Step 5: Commit the assembled redesign**

```bash
git add \
  apps/specimens/src/app.tsx \
  apps/specimens/src/specimen-pages.tsx
git commit \
  -m "feat(specimens): focus assembled scene browser" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 5: Implement the documentation, preview, and responsive layout

**Files:**
- Modify: `apps/specimens/src/specimens.css`
- Modify: `apps/specimens/src/specimens-fixes.css`
- Test: `scripts/verify-contracts.mjs`

- [ ] **Step 1: Replace gallery selectors with the desktop shell**

Keep the existing top-bar, brand, surface switcher, density, scheme, skip-link,
and command syntax rules. Replace `.specimen-shell` and all catalog/card/lab
rules with:

```css
.specimen-shell {
  display: grid;
  max-width: 96rem;
  min-height: calc(100vh - var(--specimen-topbar-height));
  grid-template-columns: 15.5rem minmax(0, 1fr) 13.5rem;
  margin-inline: auto;
}

.specimen-navigation,
.specimen-toc {
  position: sticky;
  inset-block-start: var(--specimen-topbar-height);
  align-self: start;
  height: calc(100vh - var(--specimen-topbar-height));
  overflow-y: auto;
  scrollbar-width: thin;
}

.specimen-navigation {
  border-inline-end: 1px solid var(--border);
  background: color-mix(in srgb, var(--card) 72%, var(--background));
  padding: 1.25rem 0.875rem 2rem;
}

.specimen-toc {
  border-inline-start: 1px solid var(--border);
  padding: 1.5rem 0.875rem;
}

.specimen-navigation__group {
  display: grid;
  gap: 0.125rem;
  margin-block-end: 1rem;
}

.specimen-navigation__label,
.specimen-toc h2 {
  margin: 0 0 0.5rem;
  color: var(--muted-foreground);
  font-family: var(--font-numeric);
  font-size: 0.625rem;
  font-weight: 750;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.specimen-navigation a,
.specimen-toc a {
  display: flex;
  min-height: 2.25rem;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-radius: var(--radius-2);
  color: var(--muted-foreground);
  padding: 0.5rem 0.625rem;
  font-size: 0.8125rem;
  font-weight: 650;
  text-decoration: none;
}

.specimen-navigation a[aria-current="page"],
.specimen-toc a[aria-current="location"] {
  background: var(--muted);
  color: var(--foreground);
  box-shadow: inset 2px 0 var(--presence);
}

.specimen-main {
  min-width: 0;
}

.specimen-main__inner {
  width: min(100%, 68rem);
  margin-inline: auto;
  padding: clamp(2rem, 4vw, 3.5rem) clamp(1.25rem, 4vw, 3rem) 5rem;
}

.specimen-mobile-browser {
  display: none;
}
```

- [ ] **Step 2: Add focused page and overview hierarchy**

Add:

```css
.specimen-page {
  min-width: 0;
}

.specimen-page__header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 2rem;
  margin-block-end: 2.5rem;
}

.specimen-page__title {
  max-width: 20ch;
  margin: 0.55rem 0 0;
  font-family: var(--font-editorial);
  font-size: clamp(2.5rem, 5vw, 4.25rem);
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1;
  text-wrap: balance;
}

.specimen-page__lede {
  max-width: 68ch;
  margin: 0.9rem 0 0;
  color: var(--muted-foreground);
  font-size: 0.9375rem;
  line-height: 1.65;
}

.specimen-section {
  scroll-margin-block-start: calc(var(--specimen-topbar-height) + 1rem);
  margin-block-start: 2.75rem;
}

.specimen-section > h2 {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0 0 1rem;
  font-size: 1.125rem;
}

.specimen-section > h2::after {
  height: 1px;
  flex: 1;
  background: var(--border);
  content: "";
}

.specimen-overview-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-block-start: 2rem;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-3);
  background: var(--card);
}

.specimen-overview-stats div {
  border-inline-end: 1px solid var(--border);
  padding: 1.25rem;
}

.specimen-overview-stats div:last-child {
  border-inline-end: 0;
}
```

- [ ] **Step 3: Add the Components-style preview and anatomy stage**

Add:

```css
.specimen-preview {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-3);
  background: color-mix(in srgb, var(--background) 84%, black);
  box-shadow: var(--elevation-2);
}

.specimen-preview__toolbar {
  display: flex;
  min-height: 2.5rem;
  align-items: center;
  justify-content: space-between;
  border-block-end: 1px solid var(--border);
  color: var(--muted-foreground);
  padding: 0.625rem 0.875rem;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.specimen-preview__layout {
  display: grid;
  min-width: 0;
  grid-template-columns: minmax(0, 1fr) 14rem;
}

.specimen-preview__canvas {
  display: grid;
  min-width: 0;
  min-height: 22rem;
  align-content: center;
  justify-items: center;
  border-inline-end: 1px solid var(--border);
  background:
    linear-gradient(
      color-mix(in srgb, var(--border) 22%, transparent) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--border) 22%, transparent) 1px,
      transparent 1px
    );
  background-size: 2rem 2rem;
  padding: clamp(1.25rem, 4vw, 3rem);
}

.specimen-preview__canvas > * {
  width: min(100%, 46rem);
  min-width: 0;
  max-width: 100%;
}

.specimen-preview__anatomy {
  display: grid;
  align-content: center;
  gap: 1.25rem;
  padding: 1.5rem;
}

.specimen-preview__anatomy strong,
.specimen-preview__anatomy span {
  display: block;
}

.specimen-preview__anatomy strong {
  font-size: 0.75rem;
}

.specimen-preview__anatomy span {
  margin-block-start: 0.25rem;
  color: var(--muted-foreground);
  font-family: var(--font-numeric);
  font-size: 0.625rem;
  line-height: 1.5;
}

.specimen-anatomy-list,
.specimen-usage-list {
  margin: 0;
}

.specimen-anatomy-list {
  display: grid;
  gap: 0.75rem;
}

.specimen-anatomy-list div {
  display: grid;
  grid-template-columns: minmax(8rem, 0.3fr) minmax(0, 1fr);
  gap: 1rem;
  border-block-end: 1px solid var(--border);
  padding-block-end: 0.75rem;
}

.specimen-anatomy-list dd {
  margin: 0;
  color: var(--muted-foreground);
}
```

- [ ] **Step 4: Add assembled-scene and token-strip layout**

Add:

```css
.assembled-scene__code {
  display: grid;
  justify-items: end;
  gap: 0.25rem;
  color: var(--muted-foreground);
}

.assembled-scene__code strong {
  color: var(--foreground);
  font-size: 0.6875rem;
}

.assembled-scene__code small {
  font-size: 0.5625rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.assembled-scene__preview .specimen-preview__canvas {
  min-height: 30rem;
}

.specimen-token-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
  margin-block-start: 0.75rem;
}

.specimen-token-strip div {
  display: grid;
  gap: 0.5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-2);
  padding: 0.625rem;
}

.specimen-token-strip div > span {
  height: 1rem;
  border-radius: var(--radius-1);
}

.specimen-token-strip small {
  color: var(--muted-foreground);
}

.assembled-scene__footer {
  display: flex;
  justify-content: space-between;
  margin-block-start: 1rem;
  color: var(--muted-foreground);
  font-family: var(--font-numeric);
  font-size: 0.625rem;
}
```

- [ ] **Step 5: Rewrite the regression layer for tablet and mobile**

Replace `apps/specimens/src/specimens-fixes.css` with:

```css
/* Focused regression guards layered after the specimen shell styles. */

html {
  min-width: 320px;
}

@media (max-width: 80rem) {
  .specimen-shell {
    grid-template-columns: 15rem minmax(0, 1fr);
  }

  .specimen-toc {
    display: none;
  }
}

@media (max-width: 68rem) {
  .specimen-topbar__inner {
    display: flex;
    flex-wrap: wrap;
  }

  .specimen-topbar__actions {
    display: flex;
    flex: 1 0 100%;
    flex-wrap: wrap;
  }

  .specimen-search {
    width: auto;
    max-width: none;
    min-width: 7rem;
    flex: 1 1 10rem;
  }

  .specimen-shell {
    display: block;
    min-height: 0;
  }

  .specimen-navigation {
    display: none;
  }

  .specimen-mobile-browser {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(9rem, auto);
    align-items: center;
    gap: 0.75rem;
    border-block-end: 1px solid var(--border);
    background: var(--card);
    padding: 0.625rem clamp(1rem, 4vw, 2rem);
  }

  .specimen-mobile-browser > span {
    display: grid;
    min-width: 0;
    font-size: 0.8125rem;
    font-weight: 700;
  }

  .specimen-mobile-browser small {
    color: var(--muted-foreground);
    font-size: 0.5625rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .specimen-mobile-browser select {
    width: 100%;
    min-height: 2.75rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-2);
    background: var(--background);
    padding-inline: 0.75rem;
  }
}

@media (max-width: 48rem) {
  .specimen-main__inner {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    padding: 1.5rem 1rem 4rem;
  }

  .specimen-page__header {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-block-end: 2rem;
  }

  .specimen-page__title {
    font-size: clamp(2.25rem, 11vw, 3.25rem);
  }

  .specimen-overview-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .specimen-overview-stats div:nth-child(2) {
    border-inline-end: 0;
  }

  .specimen-overview-stats div:nth-child(-n + 2) {
    border-block-end: 1px solid var(--border);
  }

  .specimen-preview,
  .specimen-preview__layout,
  .specimen-preview__canvas,
  .specimen-preview__anatomy {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }

  .specimen-preview__layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .specimen-preview__canvas {
    min-height: 18rem;
    border-inline-end: 0;
    border-block-end: 1px solid var(--border);
    padding: 1rem;
  }

  .specimen-preview__anatomy {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-content: start;
    gap: 0.75rem;
    padding: 1rem;
  }

  .specimen-anatomy-list div {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }

  .specimen-token-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .specimen-preview *,
  .specimen-section * {
    min-width: 0;
    max-width: 100%;
  }

  .specimen-preview :where(p, span, strong, small, code),
  .specimen-section :where(p, span, strong, small, code) {
    overflow-wrap: anywhere;
  }
}

@media (max-width: 24.375rem) {
  html {
    scroll-padding-top: 1rem;
  }

  .specimen-topbar {
    position: static;
  }

  .specimen-brand > span:last-child {
    display: none;
  }

  .surface-switcher a,
  .density-control button {
    padding-inline: 0.45rem;
    font-size: 0.6875rem;
  }

  .specimen-mobile-browser {
    grid-template-columns: minmax(0, 1fr);
  }

  .specimen-preview__anatomy {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .skip-link {
    transition: none;
  }
}
```

- [ ] **Step 6: Run formatting, contracts, and the specimen build**

Run:

```bash
pnpm exec prettier --write \
  apps/specimens/src/app.tsx \
  apps/specimens/src/specimen-definitions.tsx \
  apps/specimens/src/specimen-navigation.ts \
  apps/specimens/src/specimen-pages.tsx \
  apps/specimens/src/specimens.css \
  apps/specimens/src/specimens-fixes.css \
  scripts/verify-contracts.mjs
pnpm contracts:check
pnpm --filter @opencoven/specimens build
```

Expected: all commands pass. The existing Tailwind sourcemap warning may
appear and is not a failure.

- [ ] **Step 7: Commit the layout**

```bash
git add \
  apps/specimens/src/specimens.css \
  apps/specimens/src/specimens-fixes.css
git commit \
  -m "style(specimens): apply focused documentation layout" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 6: Replace gallery receipts with focused-page browser receipts

**Files:**
- Modify: `scripts/visual-review.mjs`
- Modify: `scripts/mobile-quality-review.mjs`
- Test: `scripts/visual-review.mjs`
- Test: `scripts/mobile-quality-review.mjs`

- [ ] **Step 1: Replace visual-review scenarios**

Use these scenarios:

```js
const scenarios = [
  {
    name: "library-overview-dark-desktop",
    pathname: "/",
    width: 1440,
    height: 1000,
    scheme: "dark",
    density: "default",
    mobile: false,
    expected: "overview",
  },
  {
    name: "library-component-dark-desktop",
    pathname: "/?component=activity-item#preview",
    width: 1440,
    height: 1000,
    scheme: "dark",
    density: "default",
    mobile: false,
    expected: "component",
  },
  {
    name: "library-component-dark-mobile",
    pathname: "/?component=activity-item#preview",
    width: 390,
    height: 844,
    scheme: "dark",
    density: "default",
    mobile: true,
    expected: "component",
  },
  {
    name: "library-install-desktop",
    pathname: "/?component=mode-switch#install",
    width: 1440,
    height: 1000,
    scheme: "dark",
    density: "default",
    mobile: false,
    expected: "component",
    expectedCli:
      "pnpm dlx shadcn@latest add https://ui.opencoven.ai/r/mode-switch.json",
    expectedImport:
      'import { ModeSwitch } from "@opencoven/ui/components/mode-switch";',
  },
  {
    name: "library-overview-light-compact",
    pathname: "/",
    width: 1440,
    height: 1000,
    scheme: "light",
    density: "compact",
    mobile: false,
    expected: "overview",
  },
  {
    name: "library-component-text-200",
    pathname: "/?component=session-header#preview",
    width: 1280,
    height: 1000,
    scheme: "dark",
    density: "default",
    mobile: false,
    textScale: 2,
    expected: "component",
  },
  {
    name: "assembled-messages-dark-desktop",
    pathname: "/lab?scene=messages#preview",
    width: 1440,
    height: 1000,
    scheme: "dark",
    density: "default",
    mobile: false,
    expected: "assembled",
  },
  {
    name: "assembled-cards-dark-mobile",
    pathname: "/lab?scene=cards#preview",
    width: 390,
    height: 844,
    scheme: "dark",
    density: "compact",
    mobile: true,
    expected: "assembled",
  },
];
```

- [ ] **Step 2: Replace gallery measurements**

Measure:

```js
const navigationLinks = [
  ...document.querySelectorAll(".specimen-navigation a"),
];
const mobileBrowser = document.querySelector(".specimen-mobile-browser");
const page = document.querySelector(".specimen-page, .assembled-scene");
const pageTitle = document.querySelector(".specimen-page__title");
const preview = document.querySelector(".specimen-preview");
const canvas = document.querySelector(".specimen-preview__canvas");
const anatomy = document.querySelector(".specimen-preview__anatomy");
const toc = document.querySelector(".specimen-toc");
```

Return:

```js
{
  pathname: location.pathname,
  search: location.search,
  hash: location.hash,
  navigationCount: navigationLinks.length,
  pageVisible: isVisible(page),
  pageTitle: pageTitle?.textContent?.trim() ?? null,
  previewVisible: isVisible(preview),
  canvasOverflow: canvas
    ? Math.max(0, canvas.scrollWidth - canvas.clientWidth)
    : null,
  anatomyVisible: isVisible(anatomy),
  tocVisible: isVisible(toc),
  mobileBrowserVisible: isVisible(mobileBrowser),
}
```

Keep the current scheme, density, top-bar overlap, document overflow, sticky
clearance, clipping, runtime-error, screenshot, and summary logic.

- [ ] **Step 3: Add focused-page assertions**

Assert:

```js
if (!layout.pageVisible) failures.push("focused page is not visible");
if (layout.navigationCount !== 18 && !scenario.mobile) {
  failures.push(`expected 18 library links, got ${layout.navigationCount}`);
}
if (scenario.mobile && !layout.mobileBrowserVisible) {
  failures.push("mobile browser is not visible");
}
if (!scenario.mobile && !layout.tocVisible) {
  failures.push("desktop page contents rail is not visible");
}
if (scenario.expected !== "overview" && !layout.previewVisible) {
  failures.push("focused preview is not visible");
}
if (layout.canvasOverflow !== null && layout.canvasOverflow > 1) {
  failures.push(`preview canvas overflow is ${layout.canvasOverflow}px`);
}
```

For assembled desktop, expect five navigation links rather than eighteen.
For component pages, verify the query and expected title. For the install
scenario, read the two `.specimen-command` values and compare them with
`expectedCli` and `expectedImport`.

- [ ] **Step 4: Rewrite mobile-quality cases around focused pages**

Navigate every mobile case to
`/?component=session-header#preview`, except one assembled case at
`/lab?scene=cards#preview`.

Replace card/tab measurements with:

```js
const mobileBrowser = document.querySelector(".specimen-mobile-browser");
const mobileSelect = mobileBrowser?.querySelector("select");
const page = document.querySelector(".specimen-page, .assembled-scene");
const preview = document.querySelector(".specimen-preview");
const canvas = document.querySelector(".specimen-preview__canvas");
const anatomy = document.querySelector(".specimen-preview__anatomy");
const commands = [...document.querySelectorAll(".specimen-command")];
```

Measure document overflow, mobile-browser overflow, select target height,
preview overflow, canvas overflow, anatomy overflow, command overflow, skip
target clearance, RTL direction, reduced motion, and the first page-content
top. Remove every assertion about sixteen cards, sixteen tab roots, and
forty-eight tab targets.

Require:

```text
document overflow <= 1px
mobile selector target >= 44px
preview/canvas/anatomy/command overflow <= 1px
page content begins <= 360px without text scaling
skip target clearance >= 0px
reduced motion is active
RTL case reports rtl
```

- [ ] **Step 5: Run desktop and mobile receipts**

Start the built preview:

```bash
pnpm --filter @opencoven/specimens build
pnpm --filter @opencoven/specimens preview --host 127.0.0.1 --port 4173
```

In another shell:

```bash
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  BASE_URL="http://127.0.0.1:4173" \
  node scripts/visual-review.mjs

CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  BASE_URL="http://127.0.0.1:4173" \
  node scripts/mobile-quality-review.mjs
```

Expected: both scripts report PASS and write screenshots plus JSON summaries
under ignored artifact directories.

- [ ] **Step 6: Commit browser receipts**

```bash
git add scripts/visual-review.mjs scripts/mobile-quality-review.mjs
git commit \
  -m "test(specimens): cover focused browser layouts" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 7: Run the complete focused-browser quality gate

**Files:**
- Verify: all files changed in Tasks 1-6

- [ ] **Step 1: Run focused static checks**

```bash
pnpm exec prettier --check \
  apps/specimens/src/app.tsx \
  apps/specimens/src/specimen-definitions.tsx \
  apps/specimens/src/specimen-navigation.ts \
  apps/specimens/src/specimen-pages.tsx \
  apps/specimens/src/specimens.css \
  apps/specimens/src/specimens-fixes.css \
  scripts/verify-contracts.mjs \
  scripts/visual-review.mjs \
  scripts/mobile-quality-review.mjs
pnpm --filter @opencoven/specimens typecheck
pnpm contracts:check
pnpm --filter @opencoven/specimens build
```

Expected: all commands pass.

- [ ] **Step 2: Run package regression tests**

```bash
pnpm --filter @opencoven/ui test
```

Expected: the existing package component and mobile block suites pass without
changes to public APIs.

- [ ] **Step 3: Run the browser receipts once more**

Run both CDP scripts against the final production preview. Expected: all
desktop, mobile, light, dark, compact, cozy, RTL, reduced-motion, and 200% text
cases pass with no runtime errors or document-level horizontal overflow.

- [ ] **Step 4: Inspect the final diff**

```bash
git --no-pager diff HEAD~6 --stat
git --no-pager diff --check HEAD~6
git --no-pager status --short
```

Expected: only the planned specimen app, stylesheet, contract, browser-review,
design, and plan files are tracked. `.superpowers/` remains untracked and is
not committed.

- [ ] **Step 5: Commit any final contract-only correction**

Only if validation required a small correction, stage the known implementation
surfaces that changed:

```bash
git add \
  apps/specimens/src \
  scripts/verify-contracts.mjs \
  scripts/visual-review.mjs \
  scripts/mobile-quality-review.mjs
git commit \
  -m "fix(specimens): complete focused browser parity" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

Do not create an empty cleanup commit.
