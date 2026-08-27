# Specimen visual review

The specimen browser now produces reviewable viewport receipts for changes that
can alter its presentation. This is intentionally a render smoke test, not a
pixel-perfect golden-image suite.

## What the workflow proves

For each run, `scripts/visual-review.mjs` drives Chrome through the DevTools
Protocol without adding a browser-testing dependency to the package graph. It
checks:

- the top bar, responsive rail, and main landmark are visible;
- the page has no horizontal overflow and key assembled surfaces have no hidden internal clipping;
- light/dark scheme and cozy/compact density persist through reload;
- the library renders all 16 specimens in its three task groups;
- the assembled lab renders five tabs;
- no uncaught exception or `console.error` is emitted.

The workflow captures these viewport receipts:

| Surface | Viewport | Scheme | Density |
|---|---:|---|---|
| Library | 1440×1000 | dark | cozy |
| Library | 390×844 | dark | cozy |
| Library | 1440×1000 | light | compact |
| Assembled lab | 1440×1000 | dark | cozy |
| Assembled lab | 390×844 | dark | compact |

Every run uploads the PNGs, `summary.json`, a Markdown summary, the Vite preview
log, and a Chrome log when capture fails. Artifacts are retained for 14 days.

## Local use

Build and start the specimen preview first:

```bash
pnpm build
pnpm --filter @opencoven/specimens preview --host 127.0.0.1 --port 4173
```

Then, from another shell:

```bash
CHROME_PATH=/path/to/chrome node scripts/visual-review.mjs
```

Set `BASE_URL` when the preview is not on `http://127.0.0.1:4173`. Set
`VISUAL_OUTPUT_DIR` to change the receipt directory.

## Review policy

A green result proves the shell rendered, stayed within the requested viewport,
kept key assembled surfaces free of hidden internal clipping, and preserved its
structural contracts. It does not prove subjective visual
quality. Reviewers should still open the PNG receipts when hierarchy, spacing,
typography, responsive behavior, or component composition changed.
