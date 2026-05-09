## [2026-05-09 18:42] | Task: simplify beta ZIP naming

### Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### User Query

> 安装提示要改成英文；审核期不要同时出现
> `open-browser-use-chrome-extension-<version>-manual.zip` 和
> `open-browser-use-chrome-extension-<version>.zip`。如果商店还没审核，就直接让
> manual 包使用正式 zip 文件名，等上架后再改回正式商店打包。

### Changes Overview

**Scope:** CLI setup beta, Chrome extension packaging, install guidance, release docs.

**Key Actions:**

- **[Install Guidance]**: Changed npm postinstall and Homebrew caveats back to English: `Run the following command to install:`.
- **[Beta ZIP]**: Made `setup beta` write the keyed install package back to the same ZIP path instead of creating a separate `*-manual.zip`.
- **[Release Packaging]**: Changed Chrome extension release packaging to include the stable beta manifest key directly in `open-browser-use-chrome-extension-<version>.zip`.
- **[Docs]**: Updated README, architecture, security, Chrome Web Store release docs, skill references, and release notes for the single-ZIP beta path.

### Design Intent (Why)

During Chrome Web Store review, the user-facing artifact should be the one ZIP a user can drag into Chrome. Publishing both a raw store zip and a separate manual zip makes the install path ambiguous. Until the store path is live, the release zip itself is the keyed beta install package; after store approval, packaging can switch back to the formal Web Store upload artifact.

### Files Modified

- `cmd/open-browser-use/main.go`
- `cmd/open-browser-use/main_test.go`
- `scripts/package-chrome-extension.sh`
- `packages/open-browser-use-cli/cli/postinstall.js`
- `scripts/render-homebrew-formula.sh`
- `README.md`
- `README.zh-CN.md`
- `packages/open-browser-use-cli/README.md`
- `docs/ARCHITECTURE.md`
- `docs/CHROME_WEB_STORE_RELEASE.md`
- `docs/SECURITY.md`
- `docs/releases/feature-release-notes.md`
- `skills/open-browser-use/references/installation.md`
- `skills/open-browser-use/references/troubleshooting.md`
- version metadata under `apps/`, `cmd/`, and `packages/`
