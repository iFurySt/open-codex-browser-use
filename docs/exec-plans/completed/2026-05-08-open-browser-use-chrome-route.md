# Open Browser Use Chrome Route

Status: completed on 2026-05-09.

## Goal

Build an open implementation of the Browser Use Chrome route under the project
name **Open Browser Use**.

The first target is a locally installable MV3 Chrome extension, a Go native
messaging host/CLI named `open-browser-use` with `obu` as the intended alias,
and SDKs that let upper-layer runtimes call the browser backend directly.

## Deliverables

- MV3 Chrome extension source in `apps/chrome-extension/`.
- Go native host and CLI in `cmd/open-browser-use/`, with reusable packages
  under `internal/`.
- Unix socket bridge rooted at `/tmp/open-browser-use/<uuid>.sock`.
- Chrome native messaging host name:
  `com.ifuryst.open_browser_use.extension`.
- JavaScript/TypeScript SDK in `packages/open-browser-use-js/`.
- Python SDK in `packages/open-browser-use-python/`.
- Repository docs and histories updated with each milestone.

## Non-Goals

- Do not copy or reuse Codex's minified extension implementation.
- Do not depend on Codex `node_repl` trust injection or any closed native pipe
  bridge.
- Do not add runtime policy restrictions to the SDKs. Policy is left to the
  upper-layer application.

## Milestones

### M1: Protocol Skeleton

- Add the extension/host/SDK directories.
- Implement native-message and socket framing.
- Implement the Go host relay between Chrome Native Messaging stdio and local
  Unix socket clients.
- Implement the extension's core request handlers in readable source.
- Add JS and Python SDK clients for JSON-RPC over the local socket.
- Add unit-level validation for framing and SDK basics.

### M2: Browser Capability Parity

- Harden tab group persistence across MV3 service worker restarts.
- Complete downloads, file chooser, cursor overlay, and CDP event forwarding.
- Add CLI subcommands for common SDK operations.
- Add integration tests with a fake native host/extension peer.

### M3: Real Chrome Install And Smoke

- Generate or document the native host manifest installation path.
- Load the unpacked extension in Chrome.
- Verify opening a tab, navigation, screenshot/CDP, history, user tab claim,
  and finalization against a real Chrome profile.

## Verification Plan

- `go test ./...`
- `pnpm --filter @open-browser-use/sdk-js test`
- Python smoke using `python -m unittest`.
- `node --check apps/chrome-extension/background.js`
- Real Chrome unpacked extension smoke before declaring the goal complete.

Final verification on 2026-05-09:

- `go test ./...`
- `pnpm -r --if-present test`
- `python -m unittest` from `packages/open-browser-use-python/`
- `node --check apps/chrome-extension/background.js`
- `node --check apps/chrome-extension/content-cursor.js`
- `node --check apps/chrome-extension/popup.js`
- `make ci`

## Risks

- MV3 service workers can suspend, so session state must be persisted enough to
  recover tab groups and debugger state.
- Chrome `debugger` permission is powerful and can conflict with DevTools or
  other debuggers.
- Native messaging stdout must contain only framed JSON messages; logs must go
  to stderr.
- Multiple SDK clients can share one extension host, so host-side request ID
  remapping is required.

## Progress

- 2026-05-08: M1 skeleton landed with extension, Go host relay, JS/Python SDKs,
  architecture/security docs, and unit-level framing/relay/SDK validation.
- 2026-05-08: M2 CLI discovery started with active socket registry,
  `install-manifest`, `open-tab`, and `navigate` commands.
- 2026-05-08: M2 browser event parity advanced with CDP event forwarding,
  download change forwarding, cursor arrival acknowledgement, and broader
  JS/Python SDK method wrappers.
- 2026-05-08: Install readiness advanced by switching default socket names to
  UUID filenames under `/tmp/open-browser-use/` and removing stale manifest
  resource references.
- 2026-05-08: MV3 restart resilience advanced by persisting logical active tab
  ids in session state.
- 2026-05-08: M2 CLI parity advanced with direct subcommands for SDK core
  methods, stricter `finalizeTabs` validation, and active session cleanup on
  `turnEnded` / finalization.
- 2026-05-08: CLI startup behavior tightened so no-arg `open-browser-use` /
  `obu` prints versioned help instead of starting the native host; Chrome
  native messaging still enters host mode through the Chrome-provided extension
  origin argv.
- 2026-05-08: Open Browser Use package, extension, CLI, SDK, and runtime
  self-reported versions bumped to `0.1.2` for the CLI startup patch release.
- 2026-05-08: Open Browser Use package, extension, CLI, SDK, and runtime
  self-reported versions bumped to `0.1.3` for the Chrome Web Store icon-ready
  patch release.
- 2026-05-09: M2/M3 closeout landed file chooser interception and file setting,
  stale active socket cleanup, fake native host/extension peer relay coverage,
  full local CI coverage for Go/JS/Python/extension checks, and version `0.1.4`.
