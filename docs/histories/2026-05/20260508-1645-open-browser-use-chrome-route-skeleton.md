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

## [2026-05-08 18:35] | Update: accept Chrome native messaging origin argv

### 🛠 Changes Overview

**Scope:** `cmd/open-browser-use`, `docs`

**Key Actions:**

- Treated `chrome-extension://...` argv values as Chrome native messaging
  launch mode so the binary starts the stdio host instead of failing as an
  unknown CLI subcommand.
- Added a focused Go test for native messaging launch argument detection.
- Updated architecture docs to record the Chrome launch behavior.

### 🧠 Design Intent (Why)

Chrome can pass the caller extension origin as an argument when launching a
native messaging host. The CLI must accept that launch shape for real Chrome
installation smoke to work.

## [2026-05-08 18:45] | Update: use short fixed socket root

### 🛠 Changes Overview

**Scope:** `cmd/open-browser-use`, `internal/host`

**Key Actions:**

- Changed the default socket root from platform temp directories to fixed
  `/tmp/open-browser-use`.
- Updated CLI defaults to use the host package's default socket root.

### 🧠 Design Intent (Why)

macOS temp directories can be long enough to make Unix socket bind fail once a
UUID filename is appended. The fixed `/tmp/open-browser-use/<uuid>.sock` path
matches the intended contract and stays below socket path limits.

## [2026-05-08 18:55] | Update: make popup wake native host status

### 🛠 Changes Overview

**Scope:** `apps/chrome-extension`

**Key Actions:**

- Changed the popup status check from storage-only reads to
  `chrome.runtime.sendMessage({ type: "GET_NATIVE_HOST_STATUS" })`.

### 🧠 Design Intent (Why)

MV3 service workers are event-driven. Sending a runtime message from the popup
gives users and smoke tests a deterministic way to wake the service worker and
trigger native host connection logic.

## [2026-05-08 19:05] | Update: use Chrome-compatible native host name

### 🛠 Changes Overview

**Scope:** `apps/chrome-extension`, `internal/host`, `cmd/open-browser-use`,
`docs`

**Key Actions:**

- Changed the real Chrome native messaging host name to
  `com.ifuryst.open_browser_use.extension`.
- Added a Go test that asserts the host name uses Chrome-compatible
  characters.
- Updated architecture, security, and execution plan docs.

### 🧠 Design Intent (Why)

Chrome rejects native messaging host names containing hyphens before it even
looks up the manifest. The underscore host name preserves the project identity
while satisfying Chrome's native messaging name rules.

## [2026-05-08 19:20] | Update: tolerate unscriptable startup tabs

### 🛠 Changes Overview

**Scope:** `apps/chrome-extension`

**Key Actions:**

- Made cursor content-script injection best-effort during tab creation and
  claiming.
- Kept `moveMouse` strict: it still fails if the cursor script cannot be
  injected into the target page.

### 🧠 Design Intent (Why)

Chrome does not allow extension script injection into `about:blank`. Agent tabs
are created on `about:blank` before CDP navigation, so tab creation must not
fail just because the cursor overlay is not yet injectable.

## [2026-05-08 19:35] | Update: fix executeCdp target tab validation

### 🛠 Changes Overview

**Scope:** `apps/chrome-extension`

**Key Actions:**

- Fixed `executeCdp` session-tab validation to read `target.tabId` instead of
  requiring a duplicate top-level `tabId`.
- Verified the real Chrome route by opening a tab, navigating to Google search,
  reading `document.title` through CDP, querying Chrome history, and finalizing
  session tabs.

### 🧠 Design Intent (Why)

Browser Use style CDP calls carry the Chrome tab id in `params.target.tabId`.
The service worker should validate that target shape directly so CLI and SDK
callers can use the same protocol payload.

## [2026-05-08 19:50] | Update: expand CLI parity and session cleanup

### 🛠 Changes Overview

**Scope:** `cmd/open-browser-use`, `apps/chrome-extension`, `docs`

**Key Actions:**

- Added direct CLI subcommands for SDK core methods: `ping`, `user-tabs`,
  `history`, `claim-tab`, `finalize-tabs`, `name-session`, `cdp`,
  `move-mouse`, and `turn-ended`.
- Kept `call` as the unrestricted JSON-RPC escape hatch for any method/params.
- Tightened `finalizeTabs` to reject unknown or duplicate keep entries.
- Cleared active session state after `turnEnded` or full finalization.
- Verified the new CLI route against real Chrome by opening a tab, naming the
  session, using `cdp` for navigation and title evaluation, querying history,
  finalizing tabs, and confirming the session tab list is empty.

### 🧠 Design Intent (Why)

The CLI should be useful both as a smoke-test driver and as a small operational
tool for upper-layer runtimes. Session cleanup also keeps download forwarding
scoped to actual browser-control activity instead of stale group metadata.

## [2026-05-08 20:00] | Update: verify alias and remaining Chrome capabilities

### 🛠 Changes Overview

**Scope:** `docs`, local install smoke

**Key Actions:**

- Installed the local `obu` symlink to the same `open-browser-use` binary.
- Documented the symlink-based alias convention.
- Verified additional real Chrome capabilities: `Target.getTargets`,
  `Page.captureScreenshot`, `move-mouse`, `finalize-tabs` handoff cleanup, and
  `claim-tab` against a temporary user tab.

### 🧠 Design Intent (Why)

The project promises `open-browser-use` as the binary and `obu` as the short
operator-facing alias. The extra smoke covers Chrome route behaviors that are
not exercised by basic navigation alone.

## [2026-05-08 20:15] | Update: migrate CLI to Cobra

### 🛠 Changes Overview

**Scope:** `cmd/open-browser-use`, `go.mod`, `docs`

**Key Actions:**

- Replaced the hand-written subcommand switch and standard-library `flag`
  parsing with a Cobra command tree.
- Preserved the native messaging launch path: no-arg and
  `chrome-extension://...` launches still enter host mode directly.
- Added Cobra-level tests for `version`, `-v`, and unknown command handling.
- Rebuilt the local `open-browser-use` binary and verified `obu version`,
  `open-browser-use -v`, `--help`, and `manifest` smoke commands.

### 🧠 Design Intent (Why)

Cobra gives the CLI a maintainable command structure as subcommands grow, while
the explicit native messaging bypass keeps Chrome startup behavior stable.

## [2026-05-08 20:30] | Update: bump Open Browser Use to 0.1.1

### 🛠 Changes Overview

**Scope:** `cmd/open-browser-use`, `apps/chrome-extension`, `packages`,
`apps/desktop`, `docs`

**Key Actions:**

- Bumped the Open Browser Use CLI, Chrome extension, JS SDK, Python SDK,
  browser-use protocol package, desktop package, and runtime self-reported
  versions from `0.1.0` to `0.1.1`.
- Left external reference and reverse-engineering source versions unchanged.

### 🧠 Design Intent (Why)

The version bump marks the Cobra CLI migration and Chrome route smoke-tested
milestones as a new patch-level development release.

## [2026-05-08 20:45] | Update: make no-arg CLI startup informational

### 🛠 Changes Overview

**Scope:** `cmd/open-browser-use`, `docs`

**Key Actions:**

- Changed no-arg `open-browser-use` / `obu` startup to print versioned Cobra
  help instead of entering native host relay mode.
- Kept Chrome native messaging startup on the Chrome-provided
  `chrome-extension://...` origin argv.
- Added a CLI test that asserts no-arg startup includes the version, usage, and
  host command.
- Documented that the MV3/native messaging host manifest points at an executable
  path, while Chrome supplies the extension origin argv at runtime.

### 🧠 Design Intent (Why)

Running the binary manually should be discoverable and non-blocking. Chrome
native messaging still has a dedicated startup signal via the standard origin
argv, so the extension path stays compatible without making plain `obu`
surprising.
