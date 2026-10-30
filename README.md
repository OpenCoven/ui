# OpenCoven UI

OpenCoven UI is the modular component library, block library, specimen app, and
shadcn registry for OpenCoven agent surfaces.

The package and registry share one TypeScript source tree. The specimen app
imports the same public modules consumers receive, so documentation cannot
quietly drift back into copied HTML.

## Foundation

| Decision        | Value                                         |
| --------------- | --------------------------------------------- |
| Component base  | Base UI for new interactive primitives        |
| shadcn style    | `base-nova`                                   |
| Scaffold seed   | Zinc                                          |
| Brand semantics | OpenCoven web profile `1.0.0`                 |
| Action          | Coven Violet `#8e3dff` dark / `#7a22ee` light |
| Presence        | `#b991ff` dark / `#5e2a8a` light              |
| Density         | `default` and explicit `compact` variants     |
| Language        | Strict TypeScript                             |
| Styling         | Tailwind CSS 4 and CSS custom properties      |
| Icons           | Lucide                                        |
| Distribution    | `@opencoven/ui` package and shadcn registry   |

Zinc supplies scaffold structure only. The package's colors and display/reading/mono font roles,
and the 4/8/12/16/24/32/48/64/96px spacing scale map to the pinned canonical
brand profile. Package fonts use its local/system fallback stacks without
bundled font files or third-party font requests. Components consume semantic tokens such
as `background`, `card`, `presence`, `success`, and the canonical
`tool-read`/`tool-write`/`tool-exec`/`tool-net` mappings.

## Workspace

```text
.
├── apps/specimens/              React/Vite component library and six-scene lab
├── packages/ui/
│   └── src/
│       ├── components/ui/       Base UI and native primitives
│       ├── components/          Coven composed components
│       ├── blocks/              Reusable operational surfaces
│       ├── lib/                 Shared utilities
│       └── styles/              Semantic tokens and themes
├── registry/                    Categorized registry source fragments
├── public/r/                    Generated shadcn artifacts
├── registry.json               Generated root registry
└── docs/migration/              Legacy audit and migration evidence
```

## Develop

```bash
pnpm install
pnpm dev
```

The specimen app opens at `http://127.0.0.1:5173/`. Its assembled lab is at
`http://127.0.0.1:5173/lab`.

The catalog retains the original `index.html` proportions: a 248px component
sidebar, flexible main column, and 216px context rail within a 1680px shell.
Main gutters follow the original `clamp(24px, 5vw, 72px)`. Below 1281px the
context rail disappears and the sidebar becomes 232px; at 880px and below, a
native grouped picker replaces the sidebar. All 16 component and block links
share the rendered catalog's inventory and search results. Hash links support
direct navigation, while the selected entry follows page scrolling.

Library and Lab use one fixed compact layout, without density controls or
density labels. Public component density props remain available to consumers.

The app uses the [docs UI](https://docs.opencoven.ai/docs/guide/getting-started)
neutral backgrounds (`#121212` dark, `#f5f5f5` light), with Cave's **Coven**
default lavender accents, Inter for documentation headings and interface text,
and JetBrains Mono for code and numeric labels. EB Garamond remains available
through the Cave editorial token but is not preloaded for documentation pages.
The Cave reference is
[`foundations.css` at `47afd756`](https://github.com/OpenCoven/coven-cave/blob/47afd75644ad9e28136f480b4185409541adb68f/src/styles/globals/foundations.css).
Color conveys interaction or semantic state, not catalog categories.
Dark is the initial scheme; saved light preferences are respected.
`coven-theme.css` scopes these aliases to the app, including portaled menus.
The official mark, shared spacing scale, and public package/registry tokens stay
unchanged.

The three Latin variable fonts are self-hosted, with no runtime font requests
to third parties. Their SIL Open Font License 1.1 files are included alongside
each font in `public/fonts/`.

Component headings link directly to their specimens. Search announces the
result count and provides a clear action beside the query; Escape clears the
query while the search field is focused.
The slim desktop header centers search between balanced side columns, with
navigation on the left and an icon-only theme action on the right. Below
1088px, search occupies its own centered row with touch-sized controls.

The presentation follows [shadcn's component documentation](https://ui.shadcn.com/docs/components/button):
sans-serif headings, quiet grouped navigation, a unified neutral shell, and
text-only Preview/Source tabs above a bordered canvas. The OpenCoven mark,
original column widths, complete catalog, and stateful demos remain intact.

The library uses a compact documentation header and one specimen per row, with
a single bounded preview canvas rather than nested outer cards. Small controls
retain their intrinsic width on mobile; composed surfaces use the available
space. Install/Import tabs and their code panels use the full content width
beneath the preview. It keeps live previews above syntax-highlighted install commands,
imports, and full component source, with copy controls and explicit
clipboard-failure feedback. The shared code renderer supports Bash,
TypeScript/TSX, and CSS. Each specimen has Preview/Source tabs in a fixed-size
preview area, so opening source does not change the card or page height.
Preview or Escape returns to the same component state; source scrolls inside
that area. Supported states live in a separate, always-visible footer rather
than a tab.

Related specimens expose **Open in Lab** links to their matching scene.
Scene URLs such as `/lab#run-rail` are shareable; scene changes replace the
current fragment without adding history entries. Browser hash history preserves
mounted drafts, and unknown scene fragments normalize to Composer.
**View in library** returns to the relevant specimen.

The Lab
fits the viewport and offers six scenes through tabs, previous/next controls,
and touch swipes. Only the active scene scrolls when space is limited or text
is enlarged; the page and navigation stay fixed. Demo actions are local and
do not send agent requests.

The monochrome crown/lotus mark in `public/opencoven-mark.svg` is vendored
unchanged from `OpenCoven/brand`'s `web/assets/mark.svg`, pinned to commit
`798e2f5f2f1a69f5d156ccc0a9aafc4f7da55fc8`.

## Consume the package

```bash
pnpm add @opencoven/ui
```

Import the theme once, then import named modules:

```tsx
import "@opencoven/ui/globals.css";
import { Composer, ToolClassBadge } from "@opencoven/ui";
```

Component and block subpaths are also exported:

```tsx
import { ModeSwitch } from "@opencoven/ui/components/mode-switch";
import { RunRail } from "@opencoven/ui/blocks/run-rail";
```

## Consume the registry

After the generated registry is deployed at `ui.opencoven.ai`, add the
namespace to `components.json`:

```json
{
  "registries": {
    "@opencoven": "https://ui.opencoven.ai/r/{name}.json"
  }
}
```

Then install source you own:

```bash
pnpm dlx shadcn@latest add @opencoven/button
pnpm dlx shadcn@latest add @opencoven/composer
```

`pnpm check` runs `deploy:check`, which asserts every generated registry item
is published byte-identical in the deploy output and that the SPA rewrite does
not capture `/r/*`. After a deploy, `pnpm live:check` fetches every item from
the deployed origin and confirms a missing item returns 404 rather than the
app shell:

```bash
pnpm live:check                      # defaults to registry.json homepage
pnpm live:check https://preview-url  # or a specific deployment
```

To test the registry before deployment:

```bash
pnpm registry:build
python3 -m http.server 4321 -d public/r
pnpm dlx shadcn@latest add http://127.0.0.1:4321/composer.json
```

`registry.json` is composed from categorized fragments. `shadcn build` then
creates `public/r`, and a deterministic normalization pass converts package
imports to standard consumer aliases. Do not hand-edit either generated
surface.

## Components and blocks

The initial migration includes:

- Base UI primitives: Button, Tabs, Tooltip, and Dropdown Menu.
- Native primitives: Input, Textarea, Badge, Progress, Separator, and Card.
- Composer components: Mode Switch, Send Control, Completion Palette, and
  Attachment Chip.
- Operational components: Metric Display, Status Indicator, Plan Row, Activity
  Item, Resource Row, Tool Mix, Failure Surface, Context Meter, Budget Pill,
  Search Field, Empty State, and Error State.
- Blocks: Composer, Run Rail, Transcript Turn, and Session Header.

Composer accepts an optional `tools` slot for supporting controls and supports
Ctrl/Cmd+Enter to send a non-empty draft while idle. Run Rail accepts optional
`plan` and `resources` arrays using the public Plan Row and Resource Row props;
omit them to retain the metrics/activity/limits composition.
Send Control only displays its options action when `onOpenOptions` is supplied.

No Radix implementation existed to retain. No React Aria dependency was added;
the current component set does not require its collection or
internationalization architecture.

## Quality gates

```bash
pnpm check
```

This runs formatting, linting, strict type checking, unit and interaction tests,
automated accessibility checks, architecture/design contract checks, official
registry validation and builds, generated-artifact freshness, clean-consumer
registry installation, package and specimen production builds, and package
export checks.

CI runs the same command on every pull request and push to `main`.

The Visual review workflow also runs `scripts/visual-review.mjs` and
`scripts/mobile-quality-review.mjs` against the production app. It publishes
individual specimens and Lab scenes, contact sheets, and browser measurements.
Coverage includes every specimen's source overlay, real keyboard/mouse and
clipboard flows, touch navigation, theme persistence, forced colors, RTL,
narrow screens, and 200% text.

## Legacy migration

`index.html` and `Components.dc.html` remain as parity references. They are not
the package or deployed specimen source. Their complete component, token,
interaction, accessibility, responsive, and motion mapping lives in
[`docs/migration/legacy-to-modern.md`](docs/migration/legacy-to-modern.md).

Do not remove them until a later visual parity receipt covers all 12 legacy
component pages, four blocks, five assembled scenes, both schemes, both
densities, keyboard behavior, and 390px layout.

## Contribution rules

1. Add reusable behavior to `packages/ui`; never implement a private specimen
   substitute.
2. New interactive primitives use Base UI unless an architecture decision
   records a concrete constraint.
3. Keep color semantic: greys structure the interface, and color communicates
   presence, status, or tool class.
4. Use the 4/8/12/16px radius scale and shared density tokens.
5. Comparable numbers use the `numeric` utility.
6. Keep one filled action per surface.
7. Pair every colored state with text, shape, weight, or iconography.
8. Preserve complete feedback under `prefers-reduced-motion`.
9. Add registry metadata and tests with every public component.
10. Run `pnpm check` before opening a pull request.
