## [2026-05-09 14:03] | Task: Fill Browser Use command coverage

### Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### User Query

> Check whether the missing Codex Chrome plugin agent-facing commands are covered
> by Open Computer Use and the JS/Python SDKs; if not, add coverage.

### Changes Overview

**Scope:** Chrome Browser Use command rewrite, MV3 backend, JS SDK, Python SDK,
and docs.

**Key Actions:**

- **Command coverage**: Added Browser Use command handlers for browser history,
  DOM CUA, media downloads, download wait/path, element info/screenshot,
  locator bulk reads, tab clipboard, and generic tab export.
- **SDK coverage**: Added JS and Python convenience wrappers for download
  wait/path and clipboard read/write backend methods.
- **Backend support**: Added MV3 backend RPC methods for download wait/path and
  clipboard read/write.
- **Regression guard**: Added a browser-client rewrite test that compares
  generated command metadata with implemented command handlers.
- **Release prep**: Bumped Open Browser Use runtime, package, SDK, Python, and
  extension versions from `0.1.6` to `0.1.7`.

### Design Intent (Why)

The previous rewrite covered the core Chrome extension backend RPC surface but
not the full Codex Chrome plugin agent-facing command surface. Keeping the
metadata-to-handler check in the repo makes future reverse-engineering updates
actionable instead of relying on manual comparison.

### Files Modified

- `apps/chrome-extension/background.js`
- `packages/browser-client-rewrite/browser-client.mjs`
- `packages/browser-client-rewrite/package.json`
- `packages/browser-client-rewrite/test/command-surface.test.mjs`
- `packages/open-browser-use-js/src/index.ts`
- `packages/open-browser-use-js/test/frame.test.mjs`
- `packages/open-browser-use-python/open_browser_use/client.py`
- `packages/open-browser-use-python/test_client.py`
- `docs/ARCHITECTURE.md`
- `docs/SECURITY.md`
- `docs/CHROME_WEB_STORE_LISTING.md`
- `docs/wiki/browser-client/automation/command-surface.md`
- `docs/releases/README.md`
- `docs/releases/feature-release-notes.md`
