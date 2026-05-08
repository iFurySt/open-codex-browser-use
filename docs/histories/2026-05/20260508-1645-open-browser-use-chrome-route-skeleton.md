## [2026-05-08 16:45] | Task: scaffold Open Browser Use Chrome route

### 🤖 Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### 📥 User Query

> Implement an open Open Browser Use Chrome extension route with an MV3
> extension, a Go native host/CLI named `open-browser-use` / `obu`, and JS/TS
> plus Python SDKs. Keep rewriting readable code instead of copying the Codex
> extension snapshot.

### 🛠 Changes Overview

**Scope:** `apps/chrome-extension`, `cmd/open-browser-use`, `internal`,
`packages/open-browser-use-*`, `docs`

**Key Actions:**

- **Added execution plan**: Created an active plan for the Chrome route,
  milestone validation, and real Chrome smoke requirements.
- **Added Go host skeleton**: Implemented native-endian JSON frame helpers,
  a native messaging stdio to Unix socket relay, and basic CLI subcommands.
- **Added MV3 extension skeleton**: Implemented readable service worker
  handlers for tab/session/CDP/history operations and a small cursor content
  script.
- **Added SDKs**: Added JS/TS and Python clients for JSON-RPC over the local
  Unix socket.
- **Updated docs**: Extended architecture and security notes for the new
  Chrome route.

### 🧠 Design Intent (Why)

The repository now has a public Chrome extension reference snapshot. This
change starts the open implementation with explicit source boundaries and
tests, instead of relying on copied minified code or Codex-specific trusted
runtime injection.

### 📁 Files Modified

- `apps/chrome-extension/`
- `cmd/open-browser-use/`
- `internal/host/`
- `internal/wire/`
- `packages/open-browser-use-js/`
- `packages/open-browser-use-python/`
- `docs/ARCHITECTURE.md`
- `docs/SECURITY.md`
- `docs/exec-plans/active/2026-05-08-open-browser-use-chrome-route.md`

## [2026-05-08 17:20] | Update: add CLI socket discovery and manifest install

### 🛠 Changes Overview

**Scope:** `cmd/open-browser-use`, `internal/host`, `docs`

**Key Actions:**

- Added an active socket registry at `/tmp/open-browser-use/active.json` so
  CLI commands can discover the current native host socket without a manual
  `--socket` argument.
- Added `install-manifest`, `open-tab`, and `navigate` CLI commands for the
  Chrome route.
- Added lifecycle test coverage for active socket registry writes and cleanup.
- Updated architecture, security, and execution plan docs for the new CLI
  behavior.

### 🧠 Design Intent (Why)

The Chrome route needs to be usable by local SDKs and scripts without copying
ephemeral socket paths by hand. The registry keeps discovery explicit and
local-user scoped while preserving direct `--socket` override support.

## [2026-05-08 17:45] | Update: add browser event forwarding and SDK wrappers

### 🛠 Changes Overview

**Scope:** `apps/chrome-extension`, `packages/open-browser-use-*`, `docs`

**Key Actions:**

- Added MV3 forwarding for `chrome.debugger.onEvent` as `onCDPEvent`.
- Added MV3 forwarding for `chrome.downloads` lifecycle changes as
  `onDownloadChange`.
- Added cursor arrival acknowledgement from the content script so `moveMouse`
  can wait for cursor delivery when requested.
- Added JS SDK JSON-RPC notification subscription support.
- Added higher-level JS/Python SDK wrappers for user tabs, history, claiming
  tabs, finalization, session naming, mouse movement, and turn cleanup.

### 🧠 Design Intent (Why)

The browser backend needs to expose both request/response commands and
asynchronous browser events. This keeps the open route closer to the observed
Codex Chrome extension behavior while preserving readable, maintainable source.

## [2026-05-08 18:05] | Update: align socket naming and extension manifest

### 🛠 Changes Overview

**Scope:** `internal/host`, `apps/chrome-extension`, `docs`

**Key Actions:**

- Changed the default native host socket filename to a UUID v4 shape under
  `/tmp/open-browser-use/`.
- Added host test coverage that asserts default socket paths use UUID
  filenames.
- Removed a stale `cursor.png` web accessible resource from the MV3 manifest.
- Updated architecture and execution plan docs for the socket path guarantee.

### 🧠 Design Intent (Why)

The user-facing route explicitly promises `/tmp/open-browser-use/<uuid>.sock`.
Matching that contract now avoids baking pid-derived paths into SDKs, scripts,
or future smoke tests.

## [2026-05-08 18:20] | Update: persist logical active tab

### 🛠 Changes Overview

**Scope:** `apps/chrome-extension`, `docs`

**Key Actions:**

- Persisted each session's logical active tab id in `chrome.storage.local`.
- Restored logical active tab selection from persisted session state after MV3
  service worker restarts.
- Updated architecture and execution plan docs for the persisted session
  semantics.

### 🧠 Design Intent (Why)

The MV3 service worker can suspend at any time. Persisting the logical active
tab keeps `getTabs` stable after restart instead of falling back to whichever
Chrome tab happens to be active in a window.
