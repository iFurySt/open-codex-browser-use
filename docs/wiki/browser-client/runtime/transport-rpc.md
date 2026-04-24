# Transport And RPC

## Native Pipe Transport

The client connects through:

```js
import.meta.__codexNativePipe.createConnection(pipePath)
```

Messages are framed as:

```text
uint32 message_length_in_native_endianness
utf8 JSON payload
```

The JSON payload is JSON-RPC 2.0.

## JSON-RPC Behavior

Confirmed behavior:

- Outgoing requests use incrementing numeric IDs.
- Incoming responses resolve or reject pending requests by ID.
- Incoming notifications are routed to registered event listeners.
- Incoming requests can be handled locally.
- The built-in local request handler includes `ping`, returning `pong`.

## Session Parameters

Browser API calls are session-scoped. The client adds the current Codex turn
metadata to backend method params:

```text
session_id
turn_id
```

Both are read from:

```text
globalThis.nodeRepl.requestMeta["x-codex-turn-metadata"]
```

If either value is missing, session API calls fail before reaching the backend.

## Observed Backend Methods

The session RPC wrapper exposes these backend methods:

- `executeCdp`
- `attach`
- `detach`
- `getTabs`
- `getUserTabs`
- `claimUserTab`
- `createTab`
- `finalizeTabs`
- `nameSession`
- `moveMouse`
- `getInfo`

## Response Metadata

Successful command use records response metadata under:

```text
codex/browserUse
```

