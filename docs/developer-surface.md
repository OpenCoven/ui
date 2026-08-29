# Developer surface integration contract

OpenCoven UI exposes presentation primitives for development tooling. It does not own runtime discovery, credentials, authority, orchestration, session mutation, or execution.

## Canonical ownership

| Concern | Canonical producer | UI responsibility |
| --- | --- | --- |
| Cave/Coven read models | `@opencoven/sdk` packages | Normalize returned state into view models and render it |
| User-facing local CLI | `@opencoven/cli` (`coven`) | Render commands, status, and receipts supplied by the host |
| Session/runtime authority | Coven daemon (`coven.daemon.v1`) | Display authority state explicitly; never infer permission |
| Orchestration authority | Psyche | Display task/lease/approval/receipt state supplied by the client |
| Protected mutation | Threads + Coven | Present pending/proposed/committed state without performing the mutation |
| Production application behavior | Cave | Consume these components where appropriate; Cave remains product authority |

## Current SDK status

The TypeScript SDK is experimental. Its first public release is intentionally read-only: discovery, compatibility, pairing, health, and canonical reads are in scope; message sending, streaming, attachments, task handoffs, GitHub mutation, and offline mutation queues are deferred.

Do not make a UI control look executable merely because an SDK type exists. Use `ConnectionStatus` authority labels and blocked/proposal states until a canonical producer supplies explicit authority.

## Current CLI status

The canonical user CLI is `@opencoven/cli`, invoked as `coven`.

```bash
npm install -g @opencoven/cli
coven doctor
```

The SDK repository also contains a private experimental `@opencoven/dev-cli`. That workspace is for repository development and must not be advertised as the public OpenCoven CLI.

## Adapter pattern

Keep integration code outside the UI package:

```ts
import type {
  CommandReceiptProps,
  ConnectionStatusProps,
} from '@opencoven/ui';

export function toCaveConnection(result: CaveHealth): ConnectionStatusProps {
  return {
    name: 'Cave client',
    kind: 'SDK',
    state: result.ok ? 'connected' : 'degraded',
    authority: 'read-only',
    version: result.protocolVersion,
    meta: result.instanceId,
  };
}

export function toCliReceipt(result: CovenCommandResult): CommandReceiptProps {
  return {
    channel: 'cli',
    command: result.command,
    status: result.exitCode === 0 ? 'success' : 'failed',
    exitCode: result.exitCode,
    duration: result.duration,
  };
}
```

Then render the normalized values:

```tsx
import { DeveloperSurface } from '@opencoven/ui';

<DeveloperSurface
  project="OpenCoven/coven-cave"
  branch="main"
  connections={connections}
  activity={receipts}
/>
```

The UI package performs no import-time I/O and should not add a dependency on `@opencoven/sdk` or `@opencoven/cli`. This prevents dependency cycles, keeps package consumption lightweight, and preserves the security boundary: adapters retrieve and verify state; components present it.

## Registry installation

```bash
pnpm dlx shadcn@latest add https://ui.opencoven.ai/r/connection-status.json
pnpm dlx shadcn@latest add https://ui.opencoven.ai/r/command-receipt.json
pnpm dlx shadcn@latest add https://ui.opencoven.ai/r/developer-surface.json
```

The assembled reference is available at `/developer` in the specimen app.
