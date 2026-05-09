## [2026-05-09 17:51] | Task: Add high-level JS SDK browser API

### Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### User Query

> Add SDK wrappers similar to Codex browser-client so callers can keep atomic
> JSON-RPC/CDP APIs while also using packaged browser/tab helpers.

### Changes Overview

**Scope:** JavaScript SDK, tests, architecture docs, and release notes.

**Key Actions:**

- Added `connectOpenBrowserUse`, `OpenBrowserUseBrowser`, `OpenBrowserUseTab`,
  `OpenBrowserUseCdp`, and `OpenBrowserUseTabPlaywright`.
- Kept the existing `OpenBrowserUseClient` atomic request and method wrapper
  surface intact.
- Added high-level tab helpers for `goto`, `waitForLoadState`, `domSnapshot`,
  `evaluate`, and `close`.
- Added Playwright-like aliases for `tab.playwright.waitForLoadState` and
  `tab.playwright.domSnapshot`.
- Covered the high-level flow with a fake native socket test that verifies
  navigation, CDP event wait, load-state fast path, and DOM snapshot behavior.

### Design Intent (Why)

The Codex browser client layers a browser/tab/playwright-like runtime over raw
JSON-RPC and CDP. The JS SDK now follows that shape for common automation flows
without importing Codex-specific `nodeRepl`, site policy, approval, or display
behavior into the reusable SDK.

### Files Modified

- `packages/open-browser-use-js/src/index.ts`
- `packages/open-browser-use-js/dist/index.js`
- `packages/open-browser-use-js/dist/index.d.ts`
- `packages/open-browser-use-js/test/frame.test.mjs`
- `docs/ARCHITECTURE.md`
- `docs/releases/feature-release-notes.md`
