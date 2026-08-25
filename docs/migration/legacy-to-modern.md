# Legacy-to-modern migration matrix

## Audit boundary

This inventory covers the two committed legacy artifacts at `0acd192`:

- `index.html` — component reference with 12 components, four blocks, four
  foundation pages, search, Preview/Code/Prompt tabs, two color schemes, four
  accents, and default/compact density.
- `Components.dc.html` — five assembled scenes: Composer, Messages, Context,
  Actions, and Cards.

Both files are framework-free, custom HTML/CSS/JavaScript. They contain no
Radix, Base UI, or React Aria implementations. There are therefore no stable
Radix components to retain and no primitive-system migrations to justify.

## Foundations

| Legacy source                               | Classification | Behavior to preserve                                                              | Modern owner                                         | Registry item                    |
| ------------------------------------------- | -------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------- |
| Root color variables in both HTML files     | Token/theme    | Dark and light neutral structure; lavender presence; read/write/exec/net meanings | `packages/ui/src/styles/globals.css`                 | `coven-theme` (`registry:theme`) |
| `--r-1` through `--r-4`                     | Token          | One 4/8/12/16px radius scale                                                      | `packages/ui/src/styles/globals.css`                 | `coven-theme`                    |
| `--dur-*`, `--ease`, pulse/slide keyframes  | Token/motion   | Reduced motion removes pulse and translation                                      | `packages/ui/src/styles/globals.css`                 | `coven-theme`                    |
| UI, editorial serif, and mono stacks        | Typography     | Comparable numbers use mono tabular figures                                       | `.numeric`, package component classes                | `coven-theme`                    |
| Inline SVG collections                      | Icon/asset     | Decorative icons stay hidden; action icons inherit labels                         | `lucide-react` at call sites                         | package dependency               |
| `data-theme`, `data-accent`, `data-density` | Theme/state    | Persisted theme and explicit compact density                                      | specimen app state; `data-density` package selectors | `coven-theme`                    |

The old Moss, Ember, and Ice accent demos are documentation-only variants.
They are not promoted to brand themes. The modern contract keeps lavender
`presence` authoritative and reserves read/write/exec/net and status hues for
meaning.

## Components

| Legacy item        | Legacy base                    | States and interaction                                                          | Modern module                                         | Type                                   |
| ------------------ | ------------------------------ | ------------------------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------- |
| Mode switch        | Custom native buttons          | Chat/Do/Plan; one pressed; keyboard focus                                       | `components/mode-switch.tsx`                          | composed component                     |
| Send control       | Custom native buttons          | ready/running/disabled; one filled action; no footprint shift                   | `components/ui/button.tsx`, `blocks/composer.tsx`     | Base UI primitive + block              |
| Completion palette | Static custom listbox specimen | selected/hovered; Arrow keys, Enter, Escape specified but not fully implemented | `components/ui/tabs.tsx` and future command-menu item | Base UI primitive; parity gap recorded |
| Attachment chip    | Custom native button           | ready/uploading/failed; remove; progress semantics                              | `components/attachment-chip.tsx`                      | composed component                     |
| Stat trio          | Custom HTML                    | comparable metrics, one semantic emphasis maximum                               | `components/metric-display.tsx`                       | composed component                     |
| Plan row           | Custom HTML                    | pending/active/done; non-color state cues; reduced pulse                        | `components/plan-row.tsx`                             | composed component                     |
| Timeline           | Custom HTML                    | read/write/exec/net/running; append-only                                        | `components/activity-item.tsx`                        | composed component                     |
| File row           | Custom HTML                    | M/A/D/R, left-truncated path, numeric diff                                      | `components/resource-row.tsx`                         | composed component                     |
| Tool mix           | Custom HTML                    | fixed tool-class order, accessible text equivalent                              | `components/tool-mix.tsx`                             | composed component                     |
| Failure surface    | Custom native buttons          | durable error, neutral stderr, ghost actions                                    | `components/failure-surface.tsx`                      | composed component                     |
| Context meter      | Custom progress track          | normal/warning; fixed threshold; no layout shift                                | `components/context-meter.tsx`                        | composed component                     |
| Budget pill        | Custom HTML                    | normal/warning/over; text and shape cues                                        | `components/budget-pill.tsx`                          | composed component                     |

## Blocks and assembled scenes

| Legacy item                            | Coverage                                                   | Modern module                                          | Registry type         |
| -------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------ | --------------------- |
| Composer block and Composer lab scene  | Draft, attachment, mode, model, send                       | `blocks/composer.tsx`                                  | `registry:block`      |
| Run rail block                         | Metrics, activity, context, budget                         | `blocks/run-rail.tsx`                                  | `registry:block`      |
| Transcript turn and Messages lab scene | Familiar identity, provenance, response, utility hierarchy | `blocks/transcript-turn.tsx`                           | `registry:block`      |
| Session header                         | Branch/task title, live state, spend                       | `blocks/session-header.tsx`                            | `registry:block`      |
| Context lab scene                      | Repository/task provenance and access state                | `components/resource-row.tsx` examples                 | `registry:component`  |
| Actions lab scene                      | Explicit verb, consequence, keyboard hint                  | Base UI `Button` examples                              | `registry:ui`         |
| Cards lab scene                        | PR, pending proposal, attachment, handoff                  | specimen compositions using package Card-like surfaces | documentation example |

## Shared chrome and documentation

| Legacy implementation              | Modern destination                                   |
| ---------------------------------- | ---------------------------------------------------- |
| Hash router and generated sidebar  | React specimen catalog state                         |
| Search and Command-K focus         | `apps/specimens/src/app.tsx`                         |
| Preview/Code/Prompt tabs           | Base UI Tabs in specimen app                         |
| Theme/accent/density local storage | specimen app theme controls                          |
| Toast copy feedback                | status region in specimen app                        |
| Embedded prompt strings            | `docs/components.md`                                 |
| Two duplicated token blocks        | one package stylesheet and one registry theme source |
| Two duplicated component renderers | package modules consumed by specimens and registry   |

## Accessibility, responsive, and motion baseline

- Both artifacts have visible `:focus-visible` treatment and semantic labels for
  primary controls.
- The lab implements roving navigation across its five view buttons with arrow
  keys. The library supports Command-K focus and tab selection by click.
- Progress and listbox examples contain ARIA semantics, but several specimens
  are static demonstrations rather than complete widgets.
- Both artifacts include mobile breakpoints and avoid horizontal overflow at
  390px.
- Both artifacts include `prefers-reduced-motion`; the modern package must keep
  feedback while removing pulses, translation, decorative scaling, and smooth
  scrolling.
- Hover details must use positioned overlays and never change document flow.

## Parity and retirement decision

The legacy files remain committed until the React specimens cover all 12
component pages, four blocks, five assembled scenes, both schemes, both
densities, keyboard interaction, and 390px behavior. Their markup is
deprecated, not deleted. Removal requires a later parity receipt with visual
artifacts and is intentionally outside the initial architecture migration.
