## [2026-05-09 10:58] | Task: 发布 npm CLI 包

### Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### User Query

> 将 open-browser-use/obu 发布到 npm，并明确发布对象是二进制 CLI，不是浏览器插件。

### Changes Overview

**Scope:** npm CLI packaging, CI/CD, docs

**Key Actions:**

- **CLI package**: 新增 `packages/open-browser-use-cli`，以 `open-browser-use`
  包名暴露 `open-browser-use` 和 `obu` 两个 bin。
- **Native binaries**: 新增 `scripts/build-npm-cli-package.sh`，发布前交叉编译
  macOS、Linux、Windows 的 `amd64` 和 `arm64` Go CLI 二进制。
- **CI/CD**: 新增 tag `v*` 触发的 npm 发布 workflow，后续通过 npm trusted
  publishing/OIDC 发布。
- **Docs**: 更新架构、CI/CD 和 README，标清 npm 包只发布 CLI 二进制，不发布
  Chrome extension。

### Design Intent (Why)

npm 用户需要拿到可直接执行的 `open-browser-use`/`obu` 命令；浏览器插件的
打包和商店发布保持独立，避免把 Chrome extension 误作为 npm 发布对象。

### Files Modified

- `packages/open-browser-use-cli/package.json`
- `packages/open-browser-use-cli/cli/open-browser-use.js`
- `packages/open-browser-use-cli/README.md`
- `scripts/build-npm-cli-package.sh`
- `.github/workflows/npm-publish.yml`
- `docs/ARCHITECTURE.md`
- `docs/CICD.md`
- `README.md`
