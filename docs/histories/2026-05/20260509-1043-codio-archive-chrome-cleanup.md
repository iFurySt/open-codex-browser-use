## [2026-05-09 10:43] | Task: archive Codio and clean main

### Execution Context

- **Agent ID**: `codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### User Query

> 切一个分支备份 Codio 相关内容，然后在 main 里删除 Codio 相关内容，只保留
> 较干净的 Open Browser Use Chrome 插件路线和必要 reference。

### Changes Overview

**Scope:** `apps`, `plugins`, `scripts`, `docs`, `packages`

**Key Actions:**

- **[Archive]**: Created `archive/codio-backup` with an empty archive marker
  commit before cleaning `main`.
- **[Cleanup]**: Removed the Codio Electron desktop app, Codio Browser Use
  plugin, IAB smoke script, and Codio-specific wiki/active plans.
- **[Rename]**: Renamed the root package and protocol package away from Codio
  naming.
- **[Docs]**: Updated README, architecture, frontend, security, quality, wiki,
  release notes, and history references for the Chrome-only mainline.

### Design Intent

Codio remains recoverable from the archive branch, while `main` now presents a
focused Open Browser Use Chrome extension/native host/SDK workspace. Reference
materials under `docs/references/` and `docs/wiki/browser-client/` stay in place
because they still document the observed Browser Use behavior that informed the
Chrome route.

### Files Modified

- `apps/desktop/`
- `plugins/codio-browser-use/`
- `scripts/smoke-browser-use-rpc.mjs`
- `README.md`
- `package.json`
- `packages/browser-use-protocol/package.json`
- `docs/ARCHITECTURE.md`
- `docs/FRONTEND.md`
- `docs/QUALITY_SCORE.md`
- `docs/SECURITY.md`
- `docs/wiki/README.md`
- `docs/releases/feature-release-notes.md`
