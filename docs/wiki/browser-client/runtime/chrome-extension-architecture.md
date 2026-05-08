# Chrome Extension Backend Architecture

This page tracks the non-IAB Browser Use path, selected as `backend: "chrome"`.

## Evidence Snapshot

Confirmed from the readable `browser-client.mjs` rewrite:

- `setupAtlasRuntime()` defaults to `backend: "chrome"` when no backend is
  supplied.
- `backend: "chrome"` is translated to discovery kind `extension`.
- The selected backend is the first discovered candidate whose
  `info.type === "extension"`.
- Unlike IAB, extension backend selection is not filtered by
  `metadata.codexSessionId`.
- Session RPC calls still carry `session_id` and `turn_id` from
  `globalThis.nodeRepl.requestMeta["x-codex-turn-metadata"]`.
- `browser.user.claimTab` and `browser.tabs.finalize` are client-gated to the
  Chrome backend.

Observed on this machine on 2026-05-08 after installing the public Codex Chrome
extension:

- Chrome profile `Default` contained extension
  `hehggadaopoacecdllhhajmbjkdcmajg` version `1.1.4`.
- The installed extension snapshot is preserved in
  `docs/references/codex-chrome-extension-1.1.4/`.
- The extension is MV3 and uses `background.service_worker = "background.js"`.
- The manifest requests `nativeMessaging`, `debugger`, `tabs`, `tabGroups`,
  `downloads`, `history`, `scripting`, `storage`, and `<all_urls>`.
- Chrome's native messaging host manifest for `com.openai.codexextension`
  allows only `chrome-extension://hehggadaopoacecdllhhajmbjkdcmajg/` and points
  to the Codex Chrome plugin `extension-host` binary.
- A running `extension-host` process was launched by Google Chrome with the
  extension origin as its argument and owned a Unix socket under
  `/tmp/codex-browser-use/`.

Observed on this machine on 2026-04-24:

- `/tmp/codex-browser-use.sock` was not present.
- The only active Browser Use socket was a dynamic IAB socket under
  `/tmp/codex-browser-use/<uuid>.sock`, owned by the Codex app process.
- Chrome's user `NativeMessagingHosts` directory did not contain an OpenAI or
  Codex browser-use native host manifest.
- `~/Library/Application Support/OpenAI/ChatGPT Atlas/NativeMessagingHosts`
  existed but was empty.
- The packaged Codex resources contained the Browser Use client plugin and
  `browser-use-peer-authorization.node`, but no visible packaged
  `chrome-internal` plugin payload.
- The Codex main bundle contains a `chrome-internal` bundled plugin descriptor
  enabled only for internal build flavors (`Dev`, `InternalAlpha`, `Nightly`,
  `Owl`).

## Atlas.app Cross Check

`/Applications/ChatGPT Atlas.app` was checked as a possible source for the
Chrome-extension backend. The useful observations are:

- Atlas is not an Electron app. It is a native macOS app signed as
  `com.openai.atlas`.
- The outer app embeds a Chromium-style browser app at
  `Contents/Support/ChatGPT Atlas.app`, signed as `com.openai.atlas.web`.
- The embedded browser framework is
  `ChatGPT Atlas Framework.framework/Versions/147.0.7727.102`.
- The embedded browser `Info.plist` declares Chromium document/extension types
  such as `org.chromium.extension` for `.crx`.
- `OwlBridge.dylib` and the embedded Chromium framework contain generic
  Chromium strings for `chrome-extension://`, `chrome.debugger`, CDP, and native
  messaging.
- The Chromium framework contains the native messaging host lookup path
  `/Library/OpenAI/ChatGPT Atlas/NativeMessagingHosts`, but that directory did
  not exist on this machine.
- The user-level
  `~/Library/Application Support/OpenAI/ChatGPT Atlas/NativeMessagingHosts`
  directory existed but was empty.
- Searching Atlas executables for Browser Use-specific strings such as
  `codex-browser-use`, `/tmp/codex`, `browser-use`, `setupAtlasRuntime`, or
  `com.openai.codex` did not find a Browser Use backend implementation.

Interpretation: Atlas confirms that OpenAI has a Chromium-based browser product
with native messaging and extension machinery, but the installed Atlas bundle
does not expose the Codex Browser Use `extension` backend contract observed in
`browser-client.mjs`.

## Selection And Transport

The effective client-side route is:

```text
setupAtlasRuntime({ backend: "chrome" })
  -> resolveBackend("chrome")
  -> discoverBackend("extension")
  -> first backend where resolved info.type == "extension"
  -> BrowserContext(api, runtime, info)
```

The native pipe transport is the same framing used by IAB:

```text
uint32 native-endian JSON length
JSON-RPC 2.0 payload
```

The candidate list is:

```text
/tmp/codex-browser-use/*          dynamic candidates on macOS/Linux
/tmp/codex-browser-use-iab.sock   fixed IAB fallback
/tmp/codex-browser-use.sock       fixed extension fallback
```

On Windows the fixed extension pipe is:

```text
\\.\pipe\codex-browser-use
```

The fixed extension pipe has a special fallback info object:

```json
{
  "name": "Chrome",
  "version": "0.0.1",
  "type": "extension",
  "capabilities": {
    "fileUploads": false
  }
}
```

That means an older or simpler extension backend can be selected through the
well-known pipe even if `getInfo()` is unavailable. Dynamic extension backends
must return `type: "extension"` from `getInfo()`.

The extension backend appears global from the client perspective. Multiple
Codex sessions may connect to the same extension backend, and every session RPC
call carries `session_id` and `turn_id`. Any per-session tab grouping or cleanup
therefore has to happen in the backend, not in client-side backend discovery.

## Runtime Shape

After selection, the high-level client object is shared with IAB:

```text
BrowserContext
  cdp            -> executeCdp / attach / detach
  tabs           -> createTab / getTabs / finalizeTabs
  browserUser    -> getUserTabs / claimUserTab
  ui             -> moveMouse
  cua            -> CDP input helpers
  playwright     -> Playwright-injected selector bridge
  dev            -> Runtime console log capture
  security       -> site policy and origin permission checks
```

The important difference is `browserInfo.type`:

- IAB sets `ctx.isIabBackend = true`, so some input commands use an IAB focus
  token and the backend translates supported `Input.*` CDP commands through the
  Electron `webContents`.
- Chrome extension mode sets `ctx.isIabBackend = false`, so the client sends
  ordinary CDP input commands to the extension backend.

## Extension-Only Capabilities

The Chrome path exposes user-browser concepts that do not exist in the IAB
sidebar model:

- `browser_user_open_tabs` calls `getUserTabs()` and returns open user browser
  tabs.
- `browser_user_claim_tab` calls `claimUserTab(tabId)` and is rejected unless
  `info.type === "extension"`.
- `finalize_tabs` calls `finalizeTabs(keep)` and is rejected unless
  `info.type === "extension"`.

This implies a backend model with at least two tab sets:

```text
user tabs      existing Chrome tabs visible to the user
session tabs   tabs created or claimed by the Browser Use session
```

`claimUserTab()` moves an existing user tab into the controllable session set.
`finalizeTabs()` lets the backend decide which session tabs remain open and
what status they should have after Browser Use cleanup.

IAB deliberately does not implement these operations:

- `getUserTabs()` returns an empty list.
- `claimUserTab()` throws a Chrome-backend-only error.
- `finalizeTabs()` throws a Chrome-backend-only error.

## Tab ID Semantics

From the client side, the tab identifier is just the numeric `tabId` returned by
the backend:

```text
getTabs/createTab/claimUserTab -> TabInfo.id
executeCdp({ target: { tabId }, method, commandParams })
```

In IAB, that number is a backend-created `cdpTabId` mapped to a Codex
`pageKey` and then to an Electron `webContents`.

For the Chrome extension path, no Codex `pageKey` appears in the client
contract. The backend may use a Chrome tab ID directly or maintain its own
mapping. The only confirmed requirement is that the same numeric ID must work
for `attach`, `detach`, `getTabs`, `executeCdp`, and cleanup calls.

## Confirmed Backend Topology

The 2026-05-08 installed extension snapshot confirms this topology for the
public Chrome extension route:

```text
Codex turn / node_repl
  |
  | setupAtlasRuntime({ backend: "chrome" })
  v
browser-client.mjs
  |
  | native pipe JSON-RPC
  v
Chrome extension native host
  |
  | Chrome native messaging
  v
Chrome extension background/service worker
  |
  | chrome.tabs / chrome.debugger or equivalent browser APIs
  v
Chrome windows, tabs, and targets
```

The split is now confirmed at source level for the extension side:

- The MV3 service worker constructs a native transport with
  `com.openai.codexextension`.
- The transport uses `chrome.runtime.connectNative(...)`, maintains connection
  status in `chrome.storage.local.NATIVE_HOST_STATUS`, and retries through a
  Chrome alarm.
- The service worker registers Browser Use request handlers for `getInfo`,
  `createTab`, `getTabs`, `getUserTabs`, `getUserHistory`, `claimUserTab`,
  `finalizeTabs`, `nameSession`, `attach`, `detach`, `executeCdp`, and
  `moveMouse`.
- `executeCdp` and CDP events are backed by `chrome.debugger`.
- `getUserTabs` uses `chrome.tabs.query({})`; `getUserHistory` uses
  `chrome.history.search(...)`.
- `createTab`, `claimUserTab`, `finalizeTabs`, and `nameSession` use Chrome tab
  groups to represent the Codex browser session.
- The content script is injected with `chrome.scripting.executeScript(...)`
  when a tab needs the Codex cursor overlay.

## Profile And Isolation

No Codex Electron persistent partition is involved in the Chrome extension
path. The controlled browser state is expected to be the user's Chrome profile
where the extension is installed and active.

That means profile-level state such as cookies, site data, permissions, and
history belongs to Chrome, not to Codex. Browser Use session isolation is an
application-layer concept: the backend receives `session_id` and `turn_id`,
tracks tabs created or claimed for that session, and can clean up or preserve
them through `finalizeTabs()`.

This differs from IAB, where the page lives inside Codex's Electron
`webContents` and storage is tied to a Codex-managed persistent partition.

## Contrast With IAB

| Area | Chrome extension backend | IAB backend |
| --- | --- | --- |
| Default selection | default `backend: "chrome"` | explicit `backend: "iab"` |
| Backend type | `extension` | `iab` |
| Owner process | Chrome-launched Codex `extension-host` plus MV3 service worker | Codex Electron main process |
| Socket | dynamic `extension-host` socket under `/tmp/codex-browser-use/`, or fixed extension fallback | dynamic route socket or fixed IAB fallback |
| Session match | no client-side `codexSessionId` filter | must match `metadata.codexSessionId` |
| Page primitive | Chrome tab ID | Electron `webContents` behind Codex `pageKey` |
| User tabs | list and claim supported | not supported |
| Finalization | supported | not supported |
| Profile | user's Chrome profile, inferred | Electron persistent partition under Codex app data |

## Open Implementation Questions

- What is the full Rust `extension-host` implementation behind the native
  messaging bridge?
- How does the native host multiplex multiple Codex clients against the same
  Chrome extension instance?
- What are the exact security checks in the native host before accepting
  connections to its `/tmp/codex-browser-use/` socket?
- How often does the public Chrome Web Store extension change, and should this
  repo keep versioned snapshots for later diffs?
