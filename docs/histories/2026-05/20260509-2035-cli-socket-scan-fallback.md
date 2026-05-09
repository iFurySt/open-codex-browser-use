## [2026-05-09 20:35] | Task: Harden CLI socket discovery

### 🤖 Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### 📥 User Query

> Investigate why `open-browser-use info` and `open-browser-use user-tabs`
> failed with missing `/tmp/open-browser-use/active.json` while the Chrome
> extension popup still showed the native host as connected.

### 🛠 Changes Overview

**Scope:** `cmd/open-browser-use`, Open Browser Use docs and skill reference.

**Key Actions:**

- **CLI recovery**: Added socket-dir scanning when the active socket registry is
  missing, so commands can still connect to a live native host socket.
- **Stale registry recovery**: Kept stale registry cleanup and added fallback
  scanning after removing a stale active socket record.
- **Socket self-healing**: Repaired `active.json` after a fallback connection and
  removed stale socket files found under the active `--socket-dir`.
- **Release**: Bumped Open Browser Use package metadata to `0.1.22` for a patch
  release.
- **Coverage**: Added a Go unit test for the missing-registry/live-socket case
  and adjusted environment-sensitive setup status assertions.
- **Docs**: Updated architecture and troubleshooting references to describe the
  registry-first, socket-dir fallback behavior.

### 🧠 Design Intent (Why)

The extension popup proves the Native Messaging connection is alive, but CLI and
SDK calls rely on Unix socket discovery. If `active.json` disappears while a
host process is still listening, the CLI should recover from local socket state
instead of forcing users to restart Chrome or pass `--socket` manually.

### 📁 Files Modified

- `cmd/open-browser-use/main.go`
- `cmd/open-browser-use/main_test.go`
- `apps/chrome-extension/manifest.json`
- `packages/browser-use-protocol/package.json`
- `packages/browser-client-rewrite/package.json`
- `packages/open-browser-use-cli/package.json`
- `packages/open-browser-use-js/package.json`
- `packages/open-browser-use-python/pyproject.toml`
- `docs/ARCHITECTURE.md`
- `docs/releases/feature-release-notes.md`
- `skills/open-browser-use/references/troubleshooting.md`
- `docs/histories/2026-05/20260509-2035-cli-socket-scan-fallback.md`
