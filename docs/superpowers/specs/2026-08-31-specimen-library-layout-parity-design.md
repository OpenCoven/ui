# Specimen Library Layout Parity Design

## Goal

Restructure the React specimen browser so it carries the information hierarchy
and visual focus of the two legacy HTML references without copying their
framework-free implementation.

The library route uses `index.html` as the documentation-layout reference:
complete component navigation, focused pages, clear section hierarchy, and
desktop page context. The assembled route uses `Components.dc.html` as the
presentation reference: one selected scene, a large stage, explicit anatomy,
and compact view navigation.

The modern app keeps its package-backed React components, OpenCoven UI naming,
Library/Assembled surface switch, search, scheme control, density control,
registry install guidance, and accessibility guarantees.

## Current problem

The modern app has the correct tokens and public components, but its layout
compresses the library into a two-column gallery. This produces four gaps:

1. The left rail exposes only three groups rather than the full inventory, so
   users cannot understand or navigate the component system at a glance.
2. Every specimen is rendered as a small card, leaving too little room to
   inspect complex components and making Preview, Install, and Usage compete
   inside repeated tab sets.
3. The large shared hero dominates every route while component-level
   documentation, anatomy, and usage guidance remain visually secondary.
4. The assembled route places a small workbench inside the same documentation
   shell instead of giving each assembled scene the focused presentation used
   by `Components.dc.html`.

The result is technically complete but less legible, less navigable, and less
useful as a component reference than the legacy artifacts.

## Chosen direction

Use a hybrid specimen-documentation layout.

- Adopt `index.html`'s route-oriented documentation shell for the library.
- Adopt `Components.dc.html`'s large preview, anatomy rail, state label, and
  material-detail treatment for focused specimens and assembled scenes.
- Preserve the modern React app's controls, package boundary, registry links,
  theme model, and density model.
- Do not reproduce the legacy accent picker or its four accent themes; the
  modern semantic `presence` color remains authoritative.

This direction is preferred over refining the existing gallery because it
improves both scanning and deep inspection. It is preferred over exact legacy
parity because it avoids restoring deprecated implementation and
documentation-only features.

## Information architecture

### Library route

The root route remains `/`. It becomes a small client-side documentation
browser driven by URL query parameters, avoiding a new router dependency and
retaining static-host compatibility.

- `/` is the default Overview page.
- `/?page=using-these` explains package and registry consumption.
- Each public specimen has a stable component query, such as
  `/?component=mode-switch`, `/?component=activity-item`, and
  `/?component=composer`.
- Section hashes remain available for in-page links, such as
  `/?component=activity-item#install`.
- An unknown query falls back to Overview and replaces the invalid URL so the
  address and selected page remain consistent.

The desktop shell has three columns:

1. A full inventory rail containing Getting Started, Composer, Run rail, and
   Blocks sections.
2. A focused main page for the selected entry.
3. A compact "On this page" rail for the visible documentation sections.

Overview remains editorial and concise. It includes the library introduction,
summary statistics, the two-surface explanation, house rules, and clear paths
into the component inventory. It does not render all sixteen live specimens.

Each component page contains:

1. Family eyebrow, title, and one-sentence description.
2. A large Preview section.
3. Anatomy guidance.
4. Install commands for the registry and package API.
5. Usage and state guidance.

### Assembled route

The existing `/lab` path remains the Assembled route. It becomes a focused
five-view browser rather than a hero followed by one generic workbench.

Its primary navigation lists Composer, Messages, Context, Actions, and Cards.
Selecting a view updates a query parameter, such as `/lab?scene=messages`, so
assembled views are linkable without a routing dependency and their section
hashes remain independent.

The selected scene owns the main stage:

- compact family and state metadata;
- scene title and description;
- a large package-backed live composition;
- a contextual anatomy panel;
- a token strip using modern semantic token names;
- a small interactive-status footer.

The existing `Composer`, `TranscriptTurn`, `ResourceRow`, `Button`, and `Card`
compositions remain the scene content. No private replicas are introduced.

## Desktop layout

### Shared top bar

Keep the existing sticky top bar and controls, with these refinements:

- retain OpenCoven UI and the Reference Lab label;
- retain Library/Assembled switching;
- retain search on the Library route only;
- retain Cozy/Compact and Light/Dark controls;
- reduce unused horizontal gaps and keep control heights aligned;
- allow the main shell columns to align beneath the top bar.

### Library shell

At wide desktop sizes, use approximately `15.5rem minmax(0, 1fr) 13.5rem`.
The full shell remains centered with the current `96rem` maximum width.

The left rail is sticky below the top bar and shows every page. Group labels
include counts, while the active page uses the existing presence accent and a
non-color background cue.

The main column has a readable maximum line length and more restrained hero
scale than the current catalog page. Component preview content receives the
largest visual area on detail pages.

The right rail is sticky, quiet, and hidden when a page has no section links.
It reflects Preview, Anatomy, Install, and Usage anchors on component pages and
the corresponding overview sections on introductory pages.

### Focused specimen

The preview is one framed surface rather than a small card cell. Its toolbar
shows the representative state and a quiet control area. The body uses:

- a large centered preview canvas;
- a narrow anatomy column when space permits;
- subtle grid or radial treatment that does not compete with the component;
- component-specific maximum widths so blocks remain legible.

Anatomy content is authored as short label/detail pairs. Install and usage
remain visible document sections instead of hidden tab panels.

### Assembled shell

At desktop sizes, the Assembled route uses a two-column scene browser:

- a sticky view rail based on the five-view navigation in
  `Components.dc.html`;
- a flexible stage containing the selected scene.

It does not show the current oversized global hero or summary statistics.
Context comes from the selected scene heading and the shared top bar.

## Responsive layout

### Tablet

Below the wide desktop breakpoint:

- hide the right page-context rail;
- retain the left library inventory while space allows;
- keep the preview anatomy column only when the main content has at least
  `46rem` of usable width.

Below the existing `68rem` shell breakpoint:

- remove the sticky left rail;
- insert a compact browser row below the top bar;
- expose the current page label and a native grouped select containing every
  library page or assembled view;
- keep search as the fastest secondary navigation on the Library route.

The native select is intentional. It provides complete navigation without
adding a drawer primitive or a new dependency.

### Mobile

The top bar wraps into two efficient rows:

- first row: brand mark, Library/Assembled switch, density, scheme;
- second row on Library only: full-width search.

The compact browser row follows the top bar and names the selected item and its
family. Main content uses `1rem` side gutters.

Focused preview anatomy moves below the canvas as a compact grid instead of
being hidden. This preserves useful explanation while prioritizing the live
component. Long commands remain wrapped inside bounded code surfaces.

The Assembled route uses the same compact browser row for its five scenes.
There is no additional hero before the selected scene.

All existing 320px minimum-width, 200% text-size, reduced-motion, RTL, and
horizontal-overflow safeguards remain in force.

## Component and data model

Refactor the specimen metadata into
`apps/specimens/src/specimen-definitions.tsx`, which drives navigation and
focused pages without duplicating the package-backed previews.

Each specimen record includes:

- `id`;
- `title`;
- `group`;
- `primitive`;
- `description`;
- `states`;
- `preview`;
- `anatomy`;
- `usage`;
- derived registry URL and package import path.

The existing preview JSX moves from `Library` into this shared definition with
the same state owners for composer mode and message content. Small pure helpers
derive the export name, source kind, registry URL, and package path.

The introductory pages and five assembled scenes use separate typed records in
the same definition module. Shared rendering primitives live in
`apps/specimens/src/specimen-pages.tsx`; the page types do not share a content
schema that would force unrelated records together.

## Interaction and data flow

1. On load, the app reads the pathname, query parameters, and section hash.
2. The pathname chooses Library or Assembled.
3. The query resolves the selected introductory page, component, or scene.
4. Navigation links keep real `href` values and use the History API to change
   the selected query without a full document reload.
5. A `popstate` listener updates React selection for browser Back, Forward, and
   direct links. Native hash navigation remains responsible only for page
   sections.
6. Search filters the complete specimen index. Choosing a result navigates to
   that component query and clears the search field.
7. The mobile grouped select performs the same query navigation.
8. Theme and density continue to persist through the current local-storage
   keys.

Navigation must not reset live component state unless the selected page is
unmounted. Browser Back and Forward must restore the visible page and active
navigation state.

## Error and empty states

- Unknown page, component, or scene queries normalize to the route's default
  page rather than rendering a blank surface.
- Search with no matches keeps the existing explicit empty state and adds a
  clear-query action.
- Missing optional anatomy or usage content omits that section and its
  right-rail link; it does not render an empty container.
- Required specimen metadata remains type-checked. Do not introduce broad
  runtime fallbacks for incomplete records.

## Accessibility

- Keep the skip link and move its target to the focused page content.
- Use real anchors for page navigation so links remain discoverable and
  copyable.
- Mark the active left-rail link with `aria-current="page"`.
- Label the mobile grouped select and preserve visible focus.
- Give the selected page heading focus when navigation is initiated through
  search or the mobile selector, without stealing focus on initial load.
- Keep heading levels sequential across Overview, component pages, and
  assembled scenes.
- Keep anatomy visible in document order on mobile.
- Preserve reduced-motion behavior and non-color state cues.

## File boundaries

Expected implementation scope:

- Modify `apps/specimens/src/app.tsx` to own pathname/query selection, top-bar
  controls, responsive navigation, and page composition.
- Create `apps/specimens/src/specimen-definitions.tsx` for typed component,
  introductory-page, and assembled-scene definitions.
- Create `apps/specimens/src/specimen-pages.tsx` for focused library and
  assembled page renderers.
- Modify `apps/specimens/src/specimens.css` for the new documentation and
  assembled shells.
- Modify `apps/specimens/src/specimens-fixes.css` only for narrow-layout,
  text-resize, and reduced-motion guards that remain appropriately isolated.
- Update `scripts/verify-contracts.mjs` when structural class assertions change.
- Update `scripts/visual-review.mjs` to navigate focused component and
  assembled-scene query URLs.

The public package and registry output should not change unless implementation
reveals a directly coupled layout bug in a public component.

## Validation

The implementation is complete when:

1. Overview, every component, every block, and all five assembled scenes are
   reachable through visible navigation and stable URLs.
2. Desktop library captures show the complete left inventory, focused main
   page, and right page-context rail.
3. Desktop assembled captures show one selected scene with a large stage and
   anatomy treatment, without the current global hero.
4. Mobile captures show complete component/scene navigation, readable preview
   content, stacked anatomy, and no document-level horizontal overflow at
   320px and 390px.
5. Library search opens the selected focused page rather than merely filtering
   a card grid.
6. Browser Back and Forward restore selected pages.
7. Light/dark and cozy/compact controls retain their current persistence and
   behavior.
8. Existing package tests, architecture contracts, type checking, production
   build, and targeted visual review scenarios pass.

## Out of scope

- Reintroducing Moss, Ember, or Ice accent themes.
- Adding React Router or another navigation dependency.
- Changing public component APIs for purely specimen-shell concerns.
- Removing `index.html` or `Components.dc.html`.
- Recreating every prose paragraph from the legacy references verbatim.
