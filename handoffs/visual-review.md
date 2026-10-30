# Specimen visual review

The specimen browser produces reviewable viewport receipts for changes that can
alter its presentation. These checks are render and responsive-contract smoke
tests, not a pixel-perfect golden-image suite.

## Library and assembled-browser receipts

`scripts/visual-review.mjs` drives Chrome through the DevTools Protocol without
adding a browser-testing dependency to the package graph. It checks:

- the top bar, responsive rail, and main landmark are visible;
- the page has no horizontal overflow and key assembled surfaces have no hidden
  internal clipping;
- light/dark scheme and cozy/compact density persist through reload;
- the library renders all 16 specimens in its three task groups;
- the assembled lab renders five tabs;
- no uncaught exception or `console.error` is emitted.

| Surface | Viewport | Scheme | Density |
| --- | ---: | --- | --- |
| Library | 1440×1000 | dark | cozy |
| Library | 390×844 | dark | cozy |
| Library | 1440×1000 | light | compact |
| Assembled lab | 1440×1000 | dark | cozy |
| Assembled lab | 390×844 | dark | compact |

## Mobile quality receipts

`scripts/mobile-quality-review.mjs` adds a stricter library-surface matrix. It
checks the 16-card catalog at 320, 375, 390, and 430 px; light and dark schemes;
cozy and compact density; RTL direction; reduced-motion behavior; and a 200%
root-text-size simulation. It also verifies that every card retains its tab
root, tab list, active panel, full-width stacked layout, and at least a 44 px tab
target. Session and transcript blocks must remain unellipsized and free of
internal overflow.

The 200% case is a deterministic text-resizing stress case, not a claim that it
emulates every browser zoom or operating-system accessibility implementation.
Its purpose is to catch rem-scaled viewport floors, fixed-size controls, and
other layout assumptions that make enlarged text force page-level horizontal
scrolling.

## Developer-surface receipts

`scripts/developer-visual-review.mjs` checks the isolated `/developer` reference
surface at desktop and mobile sizes, in dark and light schemes, compact and cozy
density, and at 200% root text sizing. It verifies:

- the expected four integration cards and three invocation receipts render;
- authority and receipt text is present rather than encoded by color alone;
- the known no-op showcase controls remain absent;
- scheme, density, and reduced-motion settings are active;
- heading relationships contain no duplicate DOM IDs;
- the page and each developer card remain free of horizontal/internal clipping;
- no uncaught exception or `console.error` is emitted.

| Surface | Viewport | Scheme | Density | Text scale |
| --- | ---: | --- | --- | ---: |
| Developer surface | 1440×1000 | dark | cozy | 100% |
| Developer surface | 390×844 | dark | compact | 100% |
| Developer surface | 1440×1000 | light | compact | 100% |
| Developer surface | 390×900 | dark | cozy | 200% |

Every run uploads both receipt sets as PNGs with machine-readable and Markdown
summaries. The visual artifact also includes the Vite preview log, and each
runner writes a bounded Chrome log when its capture process fails. Artifacts are
retained for 14 days.

## Local use

Build the registry, package, and specimen preview first:

```bash
pnpm registry:build
pnpm build
pnpm --filter @opencoven/specimens preview --host 127.0.0.1 --port 4173
```

Then, from another shell:

```bash
CHROME_PATH=/path/to/chrome node scripts/visual-review.mjs
CHROME_PATH=/path/to/chrome node scripts/developer-visual-review.mjs
CHROME_PATH=/path/to/chrome node scripts/mobile-quality-review.mjs
```

Set `BASE_URL` when the preview is not on `http://127.0.0.1:4173`. Set
`VISUAL_OUTPUT_DIR` or `MOBILE_OUTPUT_DIR` to change the corresponding receipt
directory. `CHROME_DEBUGGING_PORT`, `DEVELOPER_CHROME_PORT`, and
`MOBILE_CHROME_PORT` may be overridden when the default local ports are occupied.

## Review policy

A green result proves the named surface rendered, stayed within the requested
viewport, preserved the asserted structural and accessibility relationships,
and emitted no observed runtime error. It does not prove subjective visual
quality or product-level authority behavior. Reviewers should still open the
PNG receipts whenever hierarchy, spacing, typography, responsive behavior,
component composition, or state semantics changed.
