## [2026-05-09 12:55] | Task: tag release CRX package

### Execution Context

- **Agent ID**: Codex
- **Base Model**: GPT-5
- **Runtime**: Local CLI workspace

### User Query

> tag 后 CI/CD 除了 npmjs 和 Homebrew，还要把浏览器插件打成可双击打开安装的包放到 GitHub Releases，并提一个新版本验证跑通。

### Changes Overview

**Scope:** Chrome extension packaging, GitHub Release workflow, release docs, version metadata.

**Key Actions:**

- **[CRX Packaging]**: Added a CRX3 packer that wraps the validated extension zip with a signed CRX header and emits `crx-manifest.json`.
- **[Tag Release]**: Updated `release.yml` so `v*` tag pushes create GitHub Releases with zip, CRX, and provenance.
- **[Release UX]**: Kept GitHub Release downloads to only the user-facing `.crx` and `.zip`; internal manifests, SBOM, and repo metadata stay in the workflow artifact.
- **[Version]**: Bumped Open Browser Use runtime, package, SDK, Python, and extension versions from `0.1.5` to `0.1.6`.
- **[Docs]**: Updated CI/CD, Chrome release, frontend, supply-chain, listing, and release-note docs for the CRX artifact.

### Design Intent

The existing tag path only published npm and Homebrew, while the extension package lived behind a manual release workflow and was only a Web Store zip. The CRX artifact gives GitHub Release users a directly openable browser package while preserving the zip package required by Chrome Web Store upload. The CRX signer can use `CHROME_EXTENSION_PRIVATE_KEY` for a stable self-distributed extension id, and falls back to an ephemeral key so tag releases still produce an installable artifact without extra secrets.

### Files Modified

- `.github/workflows/release.yml`
- `scripts/package-chrome-extension-crx.mjs`
- `scripts/package-chrome-extension.sh`
- `scripts/release-package.sh`
- `scripts/ci.sh`
- `apps/chrome-extension/manifest.json`
- `cmd/open-browser-use/main.go`
- `packages/open-browser-use-cli/package.json`
- `packages/open-browser-use-js/package.json`
- `packages/browser-use-protocol/package.json`
- `packages/open-browser-use-python/pyproject.toml`
- `docs/CICD.md`
- `docs/CHROME_WEB_STORE_RELEASE.md`
- `docs/FRONTEND.md`
- `docs/SUPPLY_CHAIN_SECURITY.md`
- `docs/CHROME_WEB_STORE_LISTING.md`
- `docs/releases/feature-release-notes.md`
