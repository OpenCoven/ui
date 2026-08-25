# Architecture decisions

## Monorepo boundary

The repository uses a pnpm workspace because three independently verifiable
products now share one implementation:

1. `@opencoven/ui`, the typed and tree-shakeable package.
2. The shadcn registry generated from the package source.
3. The Vite specimen app that imports package exports.

A single application directory would blur package exports, registry targets,
and showcase-only code. The workspace keeps those contracts explicit without
introducing a task runner or application framework.

## Primitive systems

- **Base UI is the default** for new interactive primitives. Button, Tabs,
  Tooltip, and Dropdown Menu use current Base UI composition directly.
- **Native HTML remains preferred** when it already supplies the correct
  behavior. Input, Textarea, Progress semantics, Separator, Card, and several
  display components do not need a headless primitive.
- **Radix:** none retained or migrated. The legacy repository contained no
  Radix dependency or public component API.
- **React Aria:** not introduced. The current scope has no virtualized
  collection, advanced selection model, date/grid/tree behavior, or
  product-wide internationalization requirement that justifies its interaction
  architecture.

## Registry generation

The official schema supports `include`, but shadcn 4.19 validates each included
chunk as a confinement boundary and rejects source paths outside the chunk.
Duplicating package source into every registry category would violate the
single-source requirement.

Categorized fragments therefore live in `registry/`, and
`scripts/compose-registry.mjs` deterministically generates the root
`registry.json`. Official validation and `shadcn build` run against that root.
`scripts/normalize-registry-aliases.mjs` then converts package-internal imports
to standard consumer aliases in generated artifacts. CI fails if regeneration
changes tracked output.

## Themes and density

`base-nova`, Zinc, and CSS variables are fixed in both `components.json` files.
Zinc is only the neutral scaffold. `packages/ui/src/styles/globals.css`
replaces the permanent contract with Coven semantic tokens, including lavender
presence and immutable read/write/exec/net mappings.

Default Nova density is comfortable for desktop chat and workflow surfaces.
`density="compact"` is explicit on controls and blocks intended for tables,
rails, inspectors, and high-volume operational lists. There is no global
"Mira" mode or arbitrary one-off compression.

## Legacy retirement

The old HTML artifacts remain parity references, not production sources. Their
mapping is in `docs/migration/legacy-to-modern.md`. They can be removed only
after a later visual receipt verifies all legacy pages and assembled scenes
across schemes, densities, keyboard behavior, reduced motion, and 390px layout.
