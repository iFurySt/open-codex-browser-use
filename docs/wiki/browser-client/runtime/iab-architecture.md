# IAB Architecture

This page records the current working model for the Codex in-app browser
backend, referred to as `iab` by `browser-client.mjs`.

## Evidence Snapshot

Confirmed against:

- Browser client artifact:
  `~/.codex/plugins/cache/openai-bundled/browser-use/0.1.0-alpha1/scripts/browser-client.mjs`
- Codex app bundle:
  `/Applications/Codex.app/Contents/Resources/app.asar`
- Codex app version observed locally: `26.422.21637`
- Main-process bundle area: `.vite/build/main-DCRKtMoS.js`
- Renderer webview bundle area:
  `webview/assets/use-model-settings-Ds_s4Jfi.js`
- Runtime socket observed locally:
  `/tmp/codex-browser-use/<uuid>.sock`, owned by the Codex app main process.
- Runtime storage observed locally:
  `~/Library/Application Support/Codex/Partitions/codex-browser-app/`

The bundle is minified, so names such as `BrowserSessionRegistry` describe the
observed class role rather than source-authored symbol names unless otherwise
noted.

## Key Concepts

### BrowserWindow

`BrowserWindow` is an Electron desktop window. In this app it is a top-level
Codex window. Its numeric ID is exposed as `BrowserWindow.id`.

The IAB route includes this ID because the same Codex conversation can be
opened or rebound in more than one desktop window.

### webContents

`webContents` is Electron's controller object for one loaded page. It can:

- load URLs
- read URL/title/loading state
- receive page lifecycle events
- execute JavaScript
- attach the Electron debugger and send CDP commands

There are two important `webContents` roles in IAB:

- owner `webContents`: the Codex React UI inside a `BrowserWindow`
- guest `webContents`: the actual page embedded in a browser sidebar webview

### webview

`<webview>` is an Electron renderer-side DOM element that embeds another page
inside the Codex UI. It is similar to an iframe at the UI level, but Electron
backs it with a separate guest `webContents`.

The renderer keeps browser sidebar webviews keyed by `conversationId`.

## Route Model

IAB has two route keys:

```text
routeKey = `${windowId}:${conversationId}`
turnRouteKey = `${conversationId}:${turnId}`
```

The `windowId` is the Electron `BrowserWindow.id`. The `conversationId` is the
Codex conversation/session ID used by browser-use calls as `session_id`.

When the browser-use client connects to an IAB backend, it filters discovered
backends by `metadata.codexSessionId`, which is the `conversationId`.

## Backend Lifecycle

The IAB backend is created lazily by the app main process. The relevant
responsibilities are split between two observed classes:

```text
BrowserSessionRegistry
  browserUseNativePipeEnabled: boolean
  backendStatesByRouteKey: Map<routeKey, BackendState>
  hostsByRouteKey: Map<routeKey, BrowserUseHost>
  turnRoutes: Map<turnRouteKey, RouteBinding>
  windows: Map<windowId, WindowRecord>

BrowserUseHost
  routeKey
  conversationId
  windowId
  page/webContents cache
```

`BrowserSessionRegistry.setBrowserUseNativePipeEnabled(true)` ensures a backend
for every registered `(windowId, conversationId)` route. Disabling it disposes
all backend states.

The backend is also turn-scoped. The renderer sends:

```text
browser-use-turn-route-capture
browser-use-turn-route-release
```

The main process records:

```text
turnRouteKey = `${conversationId}:${turnId}`
```

and resolves browser-use requests for a turn through that route binding. This is
why IAB requests require both `session_id` and `turn_id`; a socket may advertise
the same conversation, but actual command serving is constrained to the captured
turn route.

## Page Key

`pageKey` is a Codex app internal page identifier. It is not an Electron or
Chrome primitive.

Observed shape:

```text
pageKey = `${ownerWebContentsId}:${conversationId}`
```

Where:

- `ownerWebContentsId` is the `webContents.id` of the Codex UI hosting the
  browser sidebar.
- `conversationId` identifies the Codex conversation.

The page key identifies "the browser sidebar page for this conversation in this
Codex UI owner".

## Logical Tab Mapping

The browser-use client sees only logical tab IDs. In IAB these are numeric
`cdpTabId` values assigned by the Codex app.

IAB keeps explicit maps:

```text
tabIdsByPageKey: Map<pageKey, cdpTabId>
tabsById: Map<cdpTabId, { cdpTabId, pageKey, routeKey, webContents, title, url, active }>
routeKeysByTabId: Map<cdpTabId, routeKey>
selectedTabIdsByRouteKey: Map<routeKey, cdpTabId>
```

Effective lookup:

```text
browser-use tab.id
  -> cdpTabId
  -> tabsById.get(cdpTabId)
  -> { pageKey, routeKey, webContents }
  -> webContents.debugger.sendCommand(...) or webContents.executeJavaScript(...)
```

So `cdpTabId` is not a native Chrome tab ID. It is a compatibility ID that lets
the browser-use API look like a tabbed browser while the implementation targets
Electron `webContents`.

## Native Pipe Transport

IAB serves the browser-use API over a local native pipe. On macOS/Linux the
socket root is:

```text
/tmp/codex-browser-use/
```

The server creates a randomized socket path:

```text
/tmp/codex-browser-use/<uuid>.sock
```

On Windows the base path is the named pipe namespace:

```text
\\.\pipe\codex-browser-use
```

The transport is JSON-RPC 2.0 framed with a 4-byte length prefix:

```text
uint32 message_length
utf8 JSON-RPC payload
```

The main-process pipe server registers public methods from the IAB API object,
so browser-use method names such as `getInfo`, `createTab`, `attach`,
`detach`, and `executeCdp` dispatch directly into IAB handlers.

On macOS packaged builds can enable peer authorization through:

```text
/Applications/Codex.app/Contents/Resources/native/browser-use-peer-authorization.node
```

The addon authorizes the connecting process from the socket file descriptor.
This is separate from browser profile isolation; it protects who can talk to the
local IAB pipe.

## Single-Page Route Semantics

The current IAB route model appears to expose one active browser sidebar page
per `(windowId, conversationId)` route.

Observed state shapes:

```text
BrowserSessionRegistry
  windows: Map<windowId, WindowState>

WindowState
  threads: Map<conversationId, ThreadState>

ThreadState
  page: PageState | null

Renderer webviews
  Map<conversationId, webview>
```

The code has `tabsById` and `selectedTabIdsByRouteKey`, but these wrap and track
Electron pages as browser-use tabs. They do not imply a Chrome-like multi-tab UI
inside one IAB route.

## Renderer Webview Lifecycle

The renderer owns the DOM-side `<webview>` objects. It keeps maps by
`conversationId`:

```text
snapshots: Map<conversationId, BrowserSnapshot>
webviews: Map<conversationId, BrowserSidebarWebview>
browserUseActiveStates: Map<conversationId, { turnId }>
browserUseCursorStates: Map<conversationId, CursorState>
```

When a `browser-sidebar-state` snapshot has `tabType = WEB`, the renderer
creates or reuses a hidden webview. When the tab type is no longer web, it
disposes the webview for that conversation.

The renderer creates the webview like this:

```text
container = document.createElement("div")
webview = document.createElement("webview")
webview.setAttribute("data-browser-sidebar-conversation-id", conversationId)
webview.setAttribute("partition", `persist:codex-browser-app-route:${encodeURIComponent(conversationId)}`)
webview.setAttribute("src", initialUrl || "about:blank")
document.body.append(container)
```

Visible browser panels and browser-use control are both projections of the same
webview. If the panel is visible, the container is positioned at the browser
panel bounds. If browser-use is active while the panel is hidden, the container
is kept as an almost invisible fixed element so the guest page stays alive and
automation can still target it.

## Webview Attach Handoff

The main process listens to the owner `webContents`:

```text
ownerWebContents.on("will-attach-webview", ...)
ownerWebContents.on("did-attach-webview", ...)
```

During `will-attach-webview`, main process:

- reads the route-bearing partition to recover `conversationId`
- rejects the attachment if no matching thread/page exists
- rewrites `partition` to the shared `persist:codex-browser-app`
- sets the configured browser `session`
- injects `comment-preload.js`
- enforces `sandbox = true`, `nodeIntegration = false`,
  `contextIsolation = true`, and `devTools = true`

During `did-attach-webview`, main process receives the guest `webContents` and
attaches it to the `PageState`. That is the moment Codex can map:

```text
conversationId -> pageKey -> guest webContents -> cdpTabId
```

The page then gets event listeners for navigation, favicon updates, load
failures, destruction, render-process-gone, context menu, zoom, comments, and
runtime sync.

## Storage Partition

Electron uses `partition` as a browser storage boundary. A persistent partition
is a named profile-like storage bucket.

The renderer initially creates webviews with a route-bearing partition:

```text
persist:codex-browser-app-route:<encoded conversationId>
```

The main process reads this value during webview attachment to recover the
`conversationId`, then rewrites the attached webview to use:

```text
persist:codex-browser-app
```

The main process also configures that partition through:

```text
session.fromPartition("persist:codex-browser-app")
```

Observed local storage path:

```text
~/Library/Application Support/Codex/Partitions/codex-browser-app/
```

This partition stores browser data such as cookies, local storage, IndexedDB,
and cache. It is shared by IAB webviews. Conversation/window separation is an
application-level routing abstraction, not a separate cookie profile.

Observed contents include `Cookies`, `Session Storage`, `WebStorage`,
`GPUCache`, `DawnWebGPUCache`, `TransportSecurity`, and Chromium preference
files.

## Command Execution

The browser-use command path is:

```text
browser-client.mjs
  -> native pipe JSON-RPC
  -> IAB API method
  -> cdpTabId lookup
  -> guest webContents
```

For ordinary CDP commands, IAB attaches Electron's debugger to the guest
`webContents` using protocol version `1.3` and calls:

```text
webContents.debugger.sendCommand(method, commandParams)
```

Debugger `message` events are re-emitted to browser-use clients as CDP events
with the logical `tabId`.

Some `Input.*` CDP commands are special. IAB does not forward all of them to
Chromium directly. It supports a small translated set:

```text
Input.dispatchKeyEvent
Input.dispatchMouseEvent
Input.insertText
Input.synthesizeScrollGesture
```

Those commands are converted into JavaScript and executed inside the guest page
with:

```text
webContents.executeJavaScript(...)
```

The translation exists to preserve focus and DOM behavior in the embedded
Electron webview. Unsupported `Input.*` commands fail explicitly.

Navigation commands are also checked before execution. When a browser-use CDP
command implies navigation, IAB asks the browser sidebar manager to assert and
track the pending navigation for the target `pageKey`.

## Cursor Handshake

IAB also mirrors browser-use cursor state into the renderer. A cursor command
does not only call CDP. The backend sends:

```text
browser-sidebar-browser-use-cursor-state
```

to the owner renderer for the route. The renderer draws the cursor overlay and
then reports arrival with:

```text
browser-use-cursor-arrived
```

The main process checks that the arrival came from the owner `webContents` for
the captured `turnRouteKey`, then resolves the backend-side cursor wait.

This is why cursor movement can wait for visual arrival even though the actual
page is a guest webview.

## End-To-End Flow

```text
agent.browser.tabs.new()
  -> browser-client.mjs JSON-RPC over native pipe
  -> Codex.app IAB backend for routeKey = windowId:conversationId
  -> open or find ThreadState.page for conversationId
  -> attach renderer <webview>
  -> receive guest webContents
  -> assign or reuse cdpTabId
  -> return logical tab info to browser-use client
```

For later commands:

```text
agent/browser-use command with tab.id and turn_id
  -> cdpTabId
  -> tabsById
  -> Electron guest webContents
  -> debugger CDP command, translated page JavaScript, or navigation call
```

## Architecture Sketch

```text
Codex BrowserWindow #12
  owner webContents #100
    Codex React UI
      conversation A
        pageKey = "100:A"
        routeKey = "12:A"
        <webview partition="persist:codex-browser-app">
          guest webContents #201
          logical cdpTabId = 1

      conversation B
        pageKey = "100:B"
        routeKey = "12:B"
        <webview partition="persist:codex-browser-app">
          guest webContents #202
          logical cdpTabId = 2

Shared browser storage:
  ~/Library/Application Support/Codex/Partitions/codex-browser-app/
```

## Implementation Sketch

```text
Renderer
  browser-sidebar-state
    -> ensure hidden <webview> for conversationId
    -> <webview
         data-browser-sidebar-conversation-id=conversationId
         partition=persist:codex-browser-app-route:<conversationId>
       >

Main process
  will-attach-webview
    -> decode conversationId from partition
    -> rewrite partition/session to persist:codex-browser-app
    -> configure preload/sandbox/contextIsolation

  did-attach-webview
    -> PageState.view.webContents = guestWebContents
    -> pageKey = ownerWebContents.id + ":" + conversationId
    -> BrowserSessionRegistry.recordGuestAttached(...)

IAB API
  createTab(session_id, turn_id)
    -> resolve turnRouteKey
    -> open/find BrowserUseHost
    -> open/find PageState
    -> updateTabForPage(page, routeKey)
    -> return { id: cdpTabId, title, url, active }

  executeCdp(tabId, method, params)
    -> validate tab belongs to route
    -> attach webContents.debugger
    -> sendCommand(...) or executeJavaScript(input translation)
```

## Practical Interpretation

- Browser-use clients only receive `tab.id`, which is IAB's `cdpTabId`.
- `pageKey` and `webContents` remain Codex.app internals.
- `windowId` keeps browser-use commands bound to the correct Codex desktop
  window.
- `turn_id` keeps commands bound to the active turn route, not just the
  conversation.
- One `(windowId, conversationId)` route maps to one browser sidebar page in the
  observed implementation.
- Browser state such as cookies is shared across IAB pages through the
  `persist:codex-browser-app` partition.
