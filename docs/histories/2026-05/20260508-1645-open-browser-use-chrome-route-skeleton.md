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
