## [2026-05-08 21:05] | Task: add Chrome Web Store release path

### Execution Context

- **Agent ID**: `codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### User Query

> 准备正式发布 Chrome 插件，并确认是否可以通过 GitHub CI/CD 自动发布到
> Chrome Web Store。

### Changes Overview

**Scope:** `apps/chrome-extension`, `scripts`, `.github/workflows`, `docs`

**Key Actions:**

- **[Packaging]**: Added a Chrome extension packaging script that validates the
  MV3 manifest, checks extension JavaScript syntax, and emits a deterministic
  release zip plus package metadata under `dist/chrome-extension/`.
- **[Publishing]**: Added a Chrome Web Store API v2 upload/publish script that
  uses OAuth refresh-token credentials from environment variables and supports
  submit-for-review, staged publishing, skip-review requests, and rollout
  percentage options.
- **[CI/CD]**: Updated the release workflow so Chrome extension zip artifacts are
  included in GitHub Release assets, artifact upload, and provenance; added an
  optional workflow input to upload and submit the extension to Chrome Web
  Store.
- **[Docs]**: Documented the required Chrome Web Store secrets, first-release
  dashboard prerequisites, native host installation boundary, and release flow.
- **[CI Green]**: Adjusted Markdown lint for accumulated history docs, skipped
  Dependency Review on private repositories that do not support it, and bumped
  Go/Electron versions away from OSV-reported vulnerable baselines.

### Design Intent

Chrome Web Store extension packages cannot install native messaging host
manifests, so the browser extension and `open-browser-use` host remain separate
release artifacts. The CI path uses Google's current Chrome Web Store API v2
directly instead of a third-party action so the repository controls the exact
upload and publish behavior.

### Files Modified

- `.github/workflows/release.yml`
- `docs/CHROME_WEB_STORE_RELEASE.md`
- `docs/CICD.md`
- `docs/SUPPLY_CHAIN_SECURITY.md`
- `docs/releases/feature-release-notes.md`
- `.markdownlint.json`
- `.github/workflows/supply-chain-security.yml`
- `apps/desktop/package.json`
- `go.mod`
- `pnpm-lock.yaml`
- `package.json`
- `scripts/ci.sh`
- `scripts/package-chrome-extension.sh`
- `scripts/publish-chrome-web-store.mjs`
- `scripts/release-package.sh`
