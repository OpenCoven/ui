# Developer surface integration contract

OpenCoven UI exposes presentation primitives for development tooling. It does
not own runtime discovery, credentials, authority, orchestration, session
mutation, execution, or receipt provenance.

## Canonical ownership

| Concern                         | Canonical producer               | UI responsibility                                                                                        |
| ------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Cave/Coven read models          | `@opencoven/sdk` packages        | Normalize returned state into bounded view models and render it                                          |
| User-facing local CLI           | `@opencoven/cli` (`coven`)       | Render presentation-safe operation labels, state, and receipts supplied by the host                      |
| Session/runtime authority       | Coven daemon (`coven.daemon.v1`) | Display authority state explicitly; never infer permission                                               |
| Orchestration authority         | Psyche                           | Display task, lease, approval, and receipt state supplied by the client                                  |
| Protected mutation              | Threads + Coven                  | Present pending, proposed, committed, denied, or recovery-required state without performing the mutation |
| Production application behavior | Cave                             | Consume these components where appropriate; Cave remains product authority                               |

## Current SDK status

The TypeScript SDK repository is experimental and not ready for public
production consumption. Its source packages are currently private and not
published. The intended first public release is deliberately read-only:
discovery, compatibility, pairing, health, and canonical reads are in scope;
message sending, streaming, attachments, task handoffs, GitHub mutation, and
offline mutation queues are deferred.

Do not make a UI control look executable merely because an SDK type exists. Use
`ConnectionStatus` authority labels and blocked or proposal states until a
canonical producer supplies explicit authority.

## Current CLI status

The canonical user CLI is `@opencoven/cli`, invoked as `coven`. The package is
live, while the SDK repository's `@opencoven/dev-cli` remains a private
repository-development workspace and must not be presented as the public CLI.

```bash
npm install -g @opencoven/cli
coven doctor
```

The Coven daemon remains the authority boundary. The CLI is a client and must
not be treated as proof that an operation was authorized or completed.

## View-model contract

`DeveloperSurface` accepts stable, host-owned identifiers so React keys do not
depend on labels, commands, or array positions:

```ts
import type { DeveloperConnection, DeveloperReceipt } from "@opencoven/ui";

const connections: DeveloperConnection[] = [
  {
    id: "coven-daemon-primary",
    name: "Coven daemon",
    kind: "Daemon",
    state: "connected",
    authority: "local-authority",
    meta: "coven.daemon.v1",
  },
];

const receipts: DeveloperReceipt[] = [
  {
    id: "doctor-latest",
    channel: "cli",
    displayCommand: "coven doctor",
    status: "succeeded",
    receiptId: "receipt:doctor:01",
    exitCode: 0,
  },
];
```

The item `id` is presentation identity used by the component tree. `receiptId`
is optional evidence identity supplied by the canonical producer. They are not
interchangeable, and neither grants authority.

## Protected-data contract

`CommandReceipt.displayCommand` is intentionally named as display data. It must
already be bounded and redacted before it reaches the UI package.

Never pass any of the following as `displayCommand`, `summary`, `receiptId`,
`meta`, or another visible field without a separately reviewed disclosure
contract:

- raw process arguments or shell command lines;
- prompts, message bodies, terminal output, source code, or repository content;
- bearer tokens, invite material, credentials, cookies, private keys, or
  certificates;
- environment maps, infrastructure URLs, or unredacted user paths;
- arbitrary provider responses or error payloads.

A display label such as `session.create · project=[redacted]` is acceptable only
when the host intentionally produced that safe projection. Renaming raw data to
`displayCommand` does not sanitize it.

## Receipt-state contract

The component renders, but does not derive, these host-supplied states:

| State               | Meaning                                                                  |
| ------------------- | ------------------------------------------------------------------------ |
| `accepted`          | The canonical producer accepted the request; execution is not yet proved |
| `running`           | The canonical producer reports active execution                          |
| `succeeded`         | A terminal success was reported                                          |
| `failed`            | A terminal failure was reported                                          |
| `blocked`           | Policy, capability, approval, or validation prevented execution          |
| `unknown`           | The effect or terminal state cannot currently be proved                  |
| `recovery-required` | Operator or producer reconciliation is required before retry             |

Do not translate PTY creation, transport connection, local UI transition, or
process spawn into `accepted` or `succeeded` unless the owning protocol defines
that event as authoritative.

## Adapter pattern

Keep integration code outside the UI package:

```ts
import type { DeveloperConnection, DeveloperReceipt } from "@opencoven/ui";

export function toCaveConnection(result: CaveHealth): DeveloperConnection {
  return {
    id: `cave:${result.instanceId}`,
    name: "Cave client",
    kind: "SDK",
    state: result.ok ? "connected" : "degraded",
    authority: "read-only",
    version: result.protocolVersion,
    meta: result.instanceId,
  };
}

export function toCliReceipt(result: CovenCommandResult): DeveloperReceipt {
  return {
    id: result.uiRecordId,
    channel: "cli",
    displayCommand: result.redactedDisplayCommand,
    status: result.receiptStatus,
    receiptId: result.receiptId,
    exitCode: result.exitCode,
    duration: result.duration,
    timestamp: result.timestamp,
  };
}
```

Then render the normalized values:

```tsx
import { DeveloperSurface } from "@opencoven/ui";

<DeveloperSurface
  project="OpenCoven/coven-cave"
  branch="main"
  connections={connections}
  activity={receipts}
/>;
```

Use `headingLevel={3}` when embedding the block below an existing level-two
section. Each rendered instance generates unique heading relationships, so
multiple surfaces may coexist without duplicate DOM IDs.

The UI package performs no import-time I/O and does not depend on
`@opencoven/sdk` or `@opencoven/cli`. This prevents dependency cycles, keeps
package consumption lightweight, and preserves the security boundary: adapters
retrieve, validate, bound, and redact state; components present it.

## Registry installation

```bash
pnpm dlx shadcn@latest add https://ui.opencoven.ai/r/connection-status.json
pnpm dlx shadcn@latest add https://ui.opencoven.ai/r/command-receipt.json
pnpm dlx shadcn@latest add https://ui.opencoven.ai/r/developer-surface.json
```

The assembled reference is available at `/developer` in the specimen app.
