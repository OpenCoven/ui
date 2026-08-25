# OpenCoven UI

OpenCoven UI is the modular component library, block library, specimen app, and
shadcn registry for OpenCoven agent surfaces.

The package and registry share one TypeScript source tree. The specimen app
imports the same public modules consumers receive, so documentation cannot
quietly drift back into copied HTML.

## Foundation

| Decision        | Value                                       |
| --------------- | ------------------------------------------- |
| Component base  | Base UI for new interactive primitives      |
| shadcn style    | `base-nova`                                 |
| Scaffold seed   | Zinc                                        |
| Brand semantics | Coven-owned CSS variables                   |
| Presence        | Lavender `#9386d0` in dark mode             |
| Density         | `default` and explicit `compact` variants   |
| Language        | Strict TypeScript                           |
| Styling         | Tailwind CSS 4 and CSS custom properties    |
| Icons           | Lucide                                      |
| Distribution    | `@opencoven/ui` package and shadcn registry |

Zinc supplies neutral scaffolding only. Components consume semantic tokens such
as `background`, `card`, `presence`, `success`, and the canonical
`tool-read`/`tool-write`/`tool-exec`/`tool-net` mappings.

## Workspace

```text
.
├── apps/specimens/              React/Vite component library and five-state lab
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
