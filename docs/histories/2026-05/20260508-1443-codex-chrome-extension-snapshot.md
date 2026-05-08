## [2026-05-08 14:43] | Task: snapshot Codex Chrome extension

### 🤖 Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### 📥 User Query

> Inspect the installed Codex Chrome Web Store extension and unpack it for the
> extension backend path, complementing the existing IAB analysis.

### 🛠 Changes Overview

**Scope:** `docs/references`, `docs/wiki/browser-client/runtime`

**Key Actions:**

- **Captured extension snapshot**: Copied the installed Codex Chrome extension
  version `1.1.4` into `docs/references/codex-chrome-extension-1.1.4/raw/`.
- **Generated readable sources**: Added formatted copies of the minified
  background, content script, popup JS, and popup CSS entry points.
- **Updated architecture notes**: Replaced inferred Chrome extension backend
  topology with the confirmed native messaging plus MV3 service worker flow.

### 🧠 Design Intent (Why)

The repository already had IAB reverse-engineering notes. The public Chrome
extension path is now locally observable, so preserving a versioned snapshot and
documenting the confirmed transport split keeps future Agent work from relying
on chat-only context or stale inference.

### 📁 Files Modified

- `docs/references/README.md`
- `docs/references/codex-chrome-extension-1.1.4/`
- `docs/wiki/browser-client/runtime/chrome-extension-architecture.md`
