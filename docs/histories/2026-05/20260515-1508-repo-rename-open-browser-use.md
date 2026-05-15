## [2026-05-15 15:08] | Task: Rename GitHub repository references

### 🤖 Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### 📥 User Query

> gh 看下仓库名改成 open-browser-use、去掉 codex-，确认对 release 发版链路的影响，如果没有阻塞就帮忙改掉。

### 🛠 Changes Overview

**Scope:** GitHub repository metadata, release URLs, SDK import paths, package metadata, docs.

**Key Actions:**

- **[Repository Rename Prep]**: Replaced active `iFurySt/open-codex-browser-use` references with `iFurySt/open-browser-use` in README, package metadata, CLI guidance, Chrome extension popup link, release download URL, and Homebrew formula rendering.
- **[Go Module Path]**: Updated the root Go module and internal imports to `github.com/ifuryst/open-browser-use`.
- **[Release Docs]**: Updated CI/CD publishing notes so npm and PyPI trusted publisher configuration points at the renamed repository.

### 🧠 Design Intent (Why)

The project name and distribution surface already use `open-browser-use`; the GitHub repository name was the remaining mismatch. Release assets and GitHub redirects survive the rename, but future generated URLs, Go import paths, package metadata, and OIDC trusted publishing docs must use the new repository name.

### 📁 Files Modified

- `go.mod`
- `cmd/open-browser-use/main.go`
- `internal/host/relay.go`
- `packages/open-browser-use-go/`
- `packages/open-browser-use-cli/package.json`
- `packages/open-browser-use-js/package.json`
- `packages/open-browser-use-python/pyproject.toml`
- `scripts/render-homebrew-formula.sh`
- `README.md`
- `README.zh-CN.md`
- `docs/ARCHITECTURE.md`
- `docs/CICD.md`
- `skills/open-browser-use/references/sdk-and-protocol.md`
