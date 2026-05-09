## [2026-05-09 11:15] | Task: Homebrew tap 发布

### Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### User Query

> 将 open-browser-use/obu 发布到 Homebrew，并让后续通过 GitHub tag 触发更新 tap。

### Changes Overview

**Scope:** Homebrew formula generation and release CI/CD.

**Key Actions:**

- **Formula renderer**: 新增 `scripts/render-homebrew-formula.sh`，根据版本和
  tag archive sha256 生成 `open-browser-use.rb`。
- **Tap workflow**: 新增 `homebrew-publish.yml`，tag `v*` 推送后更新
  `iFurySt/homebrew-open-browser-use` tap。
- **npm idempotency**: `npm-publish.yml` 在目标版本已存在时跳过发布，支持当前
  `v0.1.4` 已手动发布 npm 后继续打 tag。

### Design Intent (Why)

Homebrew 从 GitHub tag 源码构建 Go CLI，保持 tap formula 小而可审计；npm
workflow 对已存在版本幂等，避免手动首发和 tag 首发之间互相阻塞。

### Files Modified

- `.github/workflows/homebrew-publish.yml`
- `.github/workflows/npm-publish.yml`
- `scripts/render-homebrew-formula.sh`
- `docs/CICD.md`

### Follow-up: binary formula

用户在 `brew install open-browser-use` 时发现 Homebrew 会安装 Go 并在本机
`go build`，这和“已经打包好二进制”的预期不一致。

- Release 流水线新增 CLI 预编译 tarball：darwin/linux x amd64/arm64。
- Homebrew tap 流水线改为等待 GitHub Release asset 出现，下载实际 tarball
  计算 sha256，再渲染 binary formula。
- Homebrew formula 不再声明 `depends_on "go"`，安装阶段只安装 release tarball
  里的 `open-browser-use` 并创建 `obu` symlink。
- 将 Open Browser Use 发布版本元数据提升到 `0.1.21`，用于触发新的 tag release。
- 同步更新架构、CI/CD 和供应链文档，明确 Homebrew 安装不再在用户机器上编译。

新增/修改文件：

- `.github/workflows/release.yml`
- `.github/workflows/homebrew-publish.yml`
- `scripts/build-cli-release-archives.sh`
- `scripts/release-package.sh`
- `scripts/render-homebrew-formula.sh`
- `apps/chrome-extension/manifest.json`
- `cmd/open-browser-use/main.go`
- `packages/browser-client-rewrite/package.json`
- `packages/browser-use-protocol/package.json`
- `packages/open-browser-use-cli/package.json`
- `packages/open-browser-use-js/package.json`
- `packages/open-browser-use-python/pyproject.toml`
- `docs/releases/feature-release-notes.md`
- `docs/ARCHITECTURE.md`
- `docs/CICD.md`
- `docs/SUPPLY_CHAIN_SECURITY.md`
