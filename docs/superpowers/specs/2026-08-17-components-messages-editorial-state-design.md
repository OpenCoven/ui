# Components Messages Editorial State Design

## Decision

Refine the `Messages` specimen in `Components.dc.html` using direction B,
**Editorial turn**. The message should read as a considered familiar dispatch
rather than a generic chat bubble.

## Scope

Change only the Messages view and the shared styles required to render it.
Composer, Context, Actions, navigation, token swatches, responsive behavior, and
keyboard interaction remain unchanged.

## Visual structure

The Messages specimen uses one open reading column:

1. A short violet-to-hairline rule marks the start of the familiar turn.
2. Cody's avatar and identity block form the header.
3. The identity block shows `Cody` first, then a quiet monospace provenance line
   containing role, model, and relative time.
4. Response text sits beneath the header, aligned with the identity text rather
   than the avatar. It uses a restrained serif face to distinguish authored
   response content from interface chrome.
5. A compact utility row follows the response with `Reply`, `Copy`, and token
   usage. These controls remain visibly secondary.

The specimen remains inside the existing gridded preview canvas. It does not add
a containing bubble, card shadow, status badge, or evidence chips.

## Material and type

- Keep the existing graphite palette and `--accent` violet.
- Use the existing UI and monospace stacks for identity, provenance, and
  actions.
- Add a local serif stack for response copy:
  `Georgia, "Times New Roman", serif`.
- Use the accent only for the short leading segment of the turn rule and the
  avatar treatment.
- Preserve readable contrast; provenance and actions may be quieter than body
  copy but must remain legible at the rendered desktop and mobile sizes.

## Component behavior

Selecting `Messages` continues to update the heading, specimen code, anatomy
rail, and index through the existing `selectView` function.

The Messages anatomy remains:

- **Identity** — Familiar leads the reading order.
- **Provenance** — Runtime stays quiet but visible.
- **Response** — Long-form copy owns the space.

The preview is static. Utility labels demonstrate hierarchy and do not perform
chat actions.

## Responsive behavior

At desktop widths, response content aligns under the identity block with a
left inset equal to the avatar plus header gap. At mobile widths, retain that
alignment while allowing the response line length to shrink naturally. The
specimen must not create horizontal overflow at 390px.

## Accessibility

- Preserve the visible `Cody` identity.
- Keep decorative rule and avatar treatment out of the focus order.
- Do not add inactive buttons for the static utility labels.
- Preserve the existing navigation semantics, arrow-key behavior, focus rings,
  and reduced-motion handling.

## Verification

1. Parse the inline JavaScript without syntax errors.
2. Select all four views and confirm their titles, specimen codes, and anatomy.
3. Confirm the Messages view contains the editorial rule, identity header,
   provenance, serif response, and utility row.
4. Render desktop at 1200x800 and mobile at 390x844.
5. Confirm no horizontal overflow at 390px.
6. Inspect the fresh Messages screenshot for hierarchy and contrast.

## Completion evidence

The refinement is complete only when `Components.dc.html` is changed, the
desktop and mobile renders are refreshed, interaction checks pass, and the final
handoff names the exact artifact and preview paths.
