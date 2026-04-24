# Codex App-Server Integration

This page records the Codio chat integration with `codex app-server`.

## Source Snapshot

Confirmed from the upstream README on 2026-04-24:

- `codex app-server` is the interface Codex uses to power rich clients such as
  the Codex VS Code extension.
- The protocol is JSON-RPC 2.0-like, with the `jsonrpc` field omitted on the
  wire.
- Supported transports include stdio, websocket, unix socket, and off.
- Clients must send `initialize`, then send an `initialized` notification
  before normal requests.
- The top-level conversation primitives are Thread, Turn, and Item.
- `thread/start`, `thread/resume`, and `thread/fork` establish the conversation
  being displayed.
- `turn/start` begins a user turn; output arrives through notifications such
  as `turn/started`, `item/started`, `item/agentMessage/delta`,
  `item/completed`, and `turn/completed`.
- The app-server exposes plugin/app APIs including `plugin/list`,
  `plugin/read`, `plugin/install`, `app/list`, and MCP server tool/resource
  operations.

Primary source:

- <https://github.com/openai/codex/blob/main/codex-rs/app-server/README.md>

## Codio Runtime Model

```text
Codio renderer
  chat surface
    thread list
    turn composer
    streamed item renderer
  browser surface
    Electron webview

Codio main process
  CodexAppServerClient
    initialize / initialized
    thread/start or thread/resume
    turn/start
    notification stream
  BrowserSessionRegistry
    conversationId + windowId route
    tabId -> pageKey -> guest webContents
  IAB backend
    Browser Use JSON-RPC native pipe

Codex app-server
  Codex turn execution
  plugin/app/MCP discovery
  tool calls into Codio IAB plugin
```

Codio should not implement its own model chat runtime. The Electron app is the
desktop shell and renderer; Codex app-server remains the turn executor.

## Current Implementation

Implemented in:

- `apps/desktop/src/main/codex-app-server.ts`
- `apps/desktop/src/main/main.ts`
- `apps/desktop/src/preload/preload.cts`
- `apps/desktop/src/renderer/main.tsx`
- `docs/wiki/codio/browser-use-iab-backend.md`

Current behavior:

- The renderer asks main process to connect through `window.codio.connectCodex`.
- Main process starts `codex app-server --listen stdio://`.
- The app-server wire format is newline-delimited JSON-RPC-like messages with
  the `jsonrpc` field omitted.
- Main process sends `initialize`, then an `initialized` notification.
- The sidebar reads durable thread history through `thread/list`, sorted by
  `updated_at desc`.
- Selecting a history row calls `thread/read` with `includeTurns=true`, then
  maps stored turn items back into chat messages.
- The first user message creates a persistent thread through `thread/start`.
- User messages call `turn/start` with a text input item when no active turn is
  running.
- If the selected thread already has an active turn, follow-up input calls
  `turn/steer` with `expectedTurnId`.
- The stop button calls `turn/interrupt` for the active `threadId + turnId`.
- App-server notifications are forwarded to renderer over the narrow preload
  IPC surface.
- Renderer handles `thread/started`, `turn/started`,
  `item/agentMessage/delta`, `item/reasoning/*`,
  `item/commandExecution/outputDelta`, `item/started`, `item/completed`,
  `warning`, and `turn/completed`.

## Chat Flow

```text
Codio starts
  -> connect to codex app-server
  -> initialize(clientInfo.name = "codio")
  -> initialized

User opens or creates conversation
  -> thread/list for sidebar
  -> thread/read(includeTurns=true) when selecting history
  -> thread/start(ephemeral=false) for a new saved conversation
  -> render thread/started and stored items

User sends message
  -> thread/start if no thread exists
  -> turn/start(threadId, input)
  -> turn/steer(threadId, input, expectedTurnId) if a turn is already active
  -> turn/interrupt(threadId, turnId) when stop is requested
  -> render item and delta notifications
  -> mark turn complete on turn/completed
```

The `conversationId` used by IAB should be tied to the app-server `threadId`
unless a later compatibility layer requires a different stable ID.

Browser route capture now has two layers. The renderer keeps a conversation
level route for the webview, then captures `conversationId + turnId` after
`turn/start` returns. The IAB backend uses that turn route to reject stale turn
access when an active turn route exists. Timeout release and real plugin-driven
tool-call validation are still pending.

## Plugin And IAB Interaction

The intended integration is:

1. Codio exposes an IAB Browser Use backend from the Electron main process.
2. A Codex plugin/app surface tells Codex how to discover and call that backend.
3. During a Codex turn, Browser Use calls include `session_id` and `turn_id`.
4. Codio maps those values to the active Electron route and guest
   `webContents`.
5. Results stream back through app-server item/tool notifications and are
   rendered in the chat pane.

This keeps browser automation inside Codio while preserving Codex app-server as
the authoritative chat and turn runtime.

## Open Questions

- Should Codio generate TypeScript schema artifacts through
  `codex app-server generate-ts`, or maintain a small handwritten client first?
- How should the Codio Browser Use plugin be distributed and registered with
  Codex during local development?
- Which additional app-server item types should map to first-class chat UI
  components after the initial `reasoning`/tool/command coverage?
