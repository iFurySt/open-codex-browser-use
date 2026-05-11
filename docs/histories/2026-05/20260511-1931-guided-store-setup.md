## [2026-05-11 19:31] | Task: guided store setup

### 🤖 Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### 📥 User Query

> 希望 `setup` 时打开 Open Browser Use 的 Chrome Web Store 页面，让用户自己安装和重启。

### 🛠 Changes Overview

**Scope:** CLI setup flow, install docs, release notes.

**Key Actions:**

- **[CLI]**: `open-browser-use setup` now opens the public Chrome Web Store listing after registering the native host and writing the External Extensions hint.
- **[Automation Escape Hatch]**: Added `setup --no-open` for tests, CI, and headless environments that should only write setup files.
- **[Release]**: Bumped Open Browser Use runtime/package versions from `0.1.34` to `0.1.35`.
- **[Docs]**: Updated README, npm package README, Chrome Web Store release/listing docs, bundled skill installation reference, and feature release notes.

### 🧠 Design Intent (Why)

Chrome's external extension hint can be delayed until Chrome restart and does not give the user a visible place to act. Opening the store listing makes the remaining human step explicit while keeping native host registration repeatable from the CLI.

### 📁 Files Modified

- `cmd/open-browser-use/main.go`
- `cmd/open-browser-use/main_test.go`
- `apps/chrome-extension/manifest.json`
- `packages/open-browser-use-cli/package.json`
- `packages/open-browser-use-js/package.json`
- `packages/open-browser-use-python/pyproject.toml`
- `packages/browser-use-protocol/package.json`
- `packages/browser-client-rewrite/package.json`
- `README.md`
- `README.zh-CN.md`
- `packages/open-browser-use-cli/README.md`
- `docs/ARCHITECTURE.md`
- `docs/CHROME_WEB_STORE_RELEASE.md`
- `docs/CHROME_WEB_STORE_LISTING.md`
- `docs/releases/feature-release-notes.md`
- `skills/open-browser-use/references/installation.md`
