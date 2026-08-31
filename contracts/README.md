# Portable web interaction contract v1.0.0

`web-interactions.v1.json` is the framework-neutral semantic and interaction contract owned by `OpenCoven/ui`. `test-vectors.v1.json` is the shared conformance suite. `fixtures/reference.html` demonstrates the native-first baseline without importing React, Tailwind, Base UI, or the specimen app.

Visual identity and token values remain owned by `OpenCoven/brand`. Product state, authority, protocol, and runtime behavior remain owned by the corresponding product repositories.

## Stable hooks

Consumers expose `data-oc-primitive`, `data-oc-part`, and optional `data-oc-state` hooks named by the contract. These are testing semantics, not a styling API, and never replace native attributes such as `href`, `open`, `disabled`, `aria-expanded`, `aria-selected`, or `aria-busy`.

## Conformance

Run every applicable vector with JavaScript enabled and disabled, keyboard-only input, 320 px width, 200% zoom/reflow, reduced motion, and forced colors where supported. Each vector returns `pass`, `fail`, or `unsupported-with-reason`; unsupported is never counted as pass.

Ordinary navigation is not an application menu. Mobile navigation is not a modal. Tabs do not perform remote mutation. Tooltips contain no essential or interactive content. Progress is measured, not decorative. Download links remain browser-native; page JavaScript never owns installer bytes. Dialogs are reserved for true modal tasks. Guided proof remains semantic and complete without canvas, WebGL, drag, or motion.

## Versioning

Patch changes clarify wording without changing behavior. Minor changes add backward-compatible primitives, parts, states, or vectors. Major changes remove/rename hooks or alter required keyboard, focus, failure, or progressive-enhancement behavior. Consumers pin an immutable revision and run the shared vectors before updating.
