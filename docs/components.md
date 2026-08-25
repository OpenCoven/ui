# Component and block catalog

Install any registry item with:

```bash
pnpm dlx shadcn@latest add @opencoven/<item>
```

Package consumers import named exports from `@opencoven/ui` or the documented
subpath. Every item supports light and dark schemes through semantic CSS
variables, visible focus, and reduced-motion-safe feedback. `className` is
available on visual roots unless noted.

## Primitives

| Item            | Import                                   | Base            | Main API and variants                                                                                                          | States and accessibility                                                                                                 |
| --------------- | ---------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `button`        | `@opencoven/ui/components/button`        | Base UI         | `variant`: primary, presence, outline, secondary, ghost, destructive, link; `density`: default, compact; `size`: default, icon | Native button semantics, visible focus, disabled and invalid states. Primary/presence are the only filled variants.      |
| `input`         | `@opencoven/ui/components/input`         | Native input    | Native props; `density`: default, compact                                                                                      | Label through standard HTML; disabled, invalid, focus, and placeholder states.                                           |
| `textarea`      | `@opencoven/ui/components/textarea`      | Native textarea | Native props; `density`: default, compact                                                                                      | Resizable by default; composer block deliberately disables resize.                                                       |
| `badge`         | `@opencoven/ui/components/badge`         | Native span     | `variant`: neutral, presence, success, warning, destructive, information                                                       | Text is always present, so color is never the only channel.                                                              |
| `progress`      | `@opencoven/ui/components/progress`      | Native ARIA     | `value`, `max`, required `label`                                                                                               | Clamps invalid values and exposes min/max/current semantics.                                                             |
| `separator`     | `@opencoven/ui/components/separator`     | Native          | `orientation`, `decorative`                                                                                                    | Decorative by default; semantic separators expose orientation.                                                           |
| `card`          | `@opencoven/ui/components/card`          | Native          | Card, CardHeader, CardContent, CardFooter                                                                                      | Neutral structure only; no domain data or routing.                                                                       |
| `tabs`          | `@opencoven/ui/components/tabs`          | Base UI Tabs    | `variant`: default, line; `density`: default, compact; horizontal/vertical                                                     | Base UI handles arrows, activation, focus, and panel relationships.                                                      |
| `tooltip`       | `@opencoven/ui/components/tooltip`       | Base UI Tooltip | Provider, root, trigger, content; side/alignment offsets                                                                       | Portal and collision-aware positioner prevent layout shift. Translation collapses under reduced motion.                  |
| `dropdown-menu` | `@opencoven/ui/components/dropdown-menu` | Base UI Menu    | Root, trigger, content, label, item                                                                                            | Arrow navigation, Escape dismissal, focus return, portal positioning, and viewport collision handling come from Base UI. |

## Composed components

| Item                 | Purpose                                         | Main API and variants                          | States                                     | Correct use / avoid                                                                |
| -------------------- | ----------------------------------------------- | ---------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------- |
| `mode-switch`        | Select Chat, Do, or Plan authority              | Controlled `value`, `onValueChange`, density   | selected, hover, focus, disabled           | Keep exactly three modes. Do not use it for unrelated filters.                     |
| `send-control`       | Submit or stop a run without changing footprint | `running`, send/stop/options handlers, density | ready, running, disabled                   | Count the split button as the surface's one filled action.                         |
| `completion-palette` | Choose a slash command                          | trigger, typed commands, selection callback    | closed, open, focused, disabled            | Use command labels and one-line consequences. Avoid generic app navigation.        |
| `attachment-chip`    | Show one attached file                          | name, meta, state, progress, remove callback   | ready, uploading, failed                   | Failure reason occupies the meta slot. Do not expand into an inline preview.       |
| `metric-display`     | Show a comparable value                         | value, label, unit, tone, density              | neutral, success, warning, information     | Use semantic emphasis at most once in a metric group.                              |
| `status-indicator`   | Show execution state                            | status and optional label                      | pending, active, complete, blocked         | Icon and label carry state before color.                                           |
| `plan-row`           | Show one stable task step                       | title, status, duration, density               | pending, active, complete, blocked         | Do not reorder after execution begins.                                             |
| `tool-class-badge`   | Identify read/write/exec/net                    | required canonical `tool`                      | four tool classes                          | Never redefine the mappings at a call site.                                        |
| `activity-item`      | Record one tool event                           | tool, target, duration/running, density        | four tool classes, running                 | Append in execution order; collapse bursts rather than dropping them.              |
| `resource-row`       | Show a file or attached resource                | path, operation, diff, metadata, selection     | M, A, D, R, neutral                        | Paths preserve the basename and respect direction.                                 |
| `tool-mix`           | Summarize tool distribution                     | typed values and label                         | populated, empty                           | Order is always read, exec, write, net; accessible text carries exact percentages. |
| `failure-surface`    | Preserve a command failure and next moves       | command, exit code, output, ghost actions      | failed, retried through parent composition | Keep stderr neutral and trimmed. Do not replace durable errors with toasts.        |
| `context-meter`      | Show context-window use and threshold           | used, total, threshold, density                | normal, warning, full                      | The threshold is stable for the session; the number and hue both change.           |
| `budget-pill`        | Show spend against a limit                      | used, limit, currency                          | normal, warning, over                      | Icon, border, text weight, and text state accompany color.                         |
| `search-field`       | Search a known collection                       | Input props and optional shortcut              | empty, populated, focus, disabled          | Placeholder grammar is `Search <items>…`; shortcut is secondary.                   |
| `empty-state`        | Direct the first useful action                  | title, description, action                     | empty                                      | Explain what can be added; do not use mood copy.                                   |
| `error-state`        | Explain a persistent error and remedy           | title, description, action                     | error                                      | Name what failed and the corrective action.                                        |

## Blocks

| Item              | Typed inputs                                                             | Required examples                            | Composition rules                                                                                      |
| ----------------- | ------------------------------------------------------------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `composer`        | controlled draft/mode, attachments, send/stop callbacks, model, density  | empty, populated, running, disabled          | Composes public Textarea, Attachment Chip, Mode Switch, and Send Control. No routing or request logic. |
| `run-rail`        | metrics, activity, context, budget, density                              | populated, loading, empty, error, restricted | Composes public operational components. Consumers own streaming and fetching.                          |
| `transcript-turn` | familiar identity, model/time provenance, response, utilities, artifacts | streaming, complete, with artifacts          | Editorial response typography is separate from utility metadata.                                       |
| `session-header`  | task title, branch, execution status, optional budget                    | pending, active, complete, blocked           | One-line session contract; consumers own navigation.                                                   |

## Composition examples

The production specimen app in `apps/specimens/src/app.tsx` is the canonical
example set. It renders every migrated legacy component, all four blocks, and
the Composer, Messages, Context, Actions, and Cards assembled scenes from
package exports.

Incorrect examples are enforced as contracts rather than maintained as visual
anti-patterns: tests reject missing state labels, inconsistent tool mappings,
multiple filled action groups, absent reduced-motion rules, and unsupported
theme or radius configuration.
