## [2026-05-16 11:12] | Task: Add popup version and CLI install guidance

### 🤖 Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### 📥 User Query

> 浏览器 popup 需要显示版本，并根据 OS 展示 CLI 安装命令：Windows/Linux 显示 npm，macOS 显示 npm 和 Homebrew。

### 🛠 Changes Overview

**Scope:** Chrome extension popup UI, release metadata, and install docs.

**Key Actions:**

- **[Popup Version]**: Added an extension version pill sourced from `chrome.runtime.getManifest().version`.
- **[CLI Guidance]**: Added a CLI install panel that detects macOS, Windows, or Linux from browser platform data and renders the matching install/setup commands.
- **[Docs]**: Updated frontend notes to document the popup version and platform-specific command behavior, and removed obsolete `--copy` flags from README skill install examples.
- **[Release]**: Bumped runtime/package metadata to `0.1.38` and added the feature release note.

### 🧠 Design Intent (Why)

The popup is the first place users check connection status, so it should also answer which extension build is running and how to install the matching local CLI path. OS-specific command rendering avoids showing Homebrew to Windows/Linux users while still keeping macOS users' preferred install options visible.

### 📁 Files Modified

- `apps/chrome-extension/popup.html`
- `apps/chrome-extension/popup.css`
- `apps/chrome-extension/popup.js`
- `apps/chrome-extension/manifest.json`
- `cmd/open-browser-use/main.go`
- `packages/*/package.json`
- `packages/open-browser-use-python/pyproject.toml`
- `README.md`
- `README.zh-CN.md`
- `docs/FRONTEND.md`
- `docs/releases/feature-release-notes.md`

### ✅ Validation

- `node --check apps/chrome-extension/popup.js`
- `pnpm package:chrome-extension`
- OBU render harness against real Chrome for macOS, Windows, and Linux platform branches.
