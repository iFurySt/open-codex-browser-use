## [2026-05-09 14:52] | Task: guided Chrome setup

### 🤖 Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### 📥 User Query

> 评估并实现通过 npm/Homebrew 安装 CLI 后统一运行 `open-browser-use setup`，
> 同时在 Chrome Web Store 审核期支持从 GitHub Releases 安装最新 CRX。

### 🛠 Changes Overview

**Scope:** CLI setup flow, npm package postinstall, Homebrew formula renderer, install docs.

**Key Actions:**

- **[CLI]**: 新增 `open-browser-use setup`，注册 native messaging host 并写入
  Chrome External Extensions JSON，引导 Chrome 安装 Web Store 扩展。
- **[Release CRX]**: 新增 `open-browser-use setup release`，下载或打开 release
  CRX，并从 CRX3 头读取真实 extension id 来注册 native host；`setup offline`
  作为别名保留。
- **[Installers]**: npm `postinstall` 和 Homebrew caveats 改为提示用户显式运行
  `open-browser-use setup`，不再在安装阶段静默注册。
- **[Docs]**: 更新 README、架构、Chrome Web Store 发布/Listing、安全和 release
  notes，记录新的安装路径。
- **[Release]**: 将 CLI、extension、JS/Python package 和协议包版本统一 bump 到
  `0.1.8`，用于发布 guided setup 变更；安装验证发现 GitHub API 403 后，再
  发布 `0.1.9`，把 release CRX 下载改为直接拉当前 CLI 版本的 GitHub Release
  asset。
- **[CI Reliability]**: 远端 CI 暴露 relay notification 测试竞态后，等待
  accept loop 登记两个 SDK client，并给 notification read 加 deadline；发布
  `0.1.10` 修复 CI 超时。

### 🧠 Design Intent (Why)

浏览器扩展安装和高权限 native host 注册都应该是显式用户动作。`setup` 把安装后的
一次性配置收口到可重复运行的 CLI 命令；`setup release` 解决商店审核期没有 Web
Store 扩展可拉取的问题，并避免自分发 CRX id 与 Web Store id 不一致导致
Native Messaging `allowed_origins` 失配。

### 📁 Files Modified

- `cmd/open-browser-use/main.go`
- `cmd/open-browser-use/main_test.go`
- `packages/open-browser-use-cli/cli/postinstall.js`
- `packages/open-browser-use-cli/README.md`
- `packages/open-browser-use-cli/package.json`
- `packages/open-browser-use-js/package.json`
- `packages/open-browser-use-python/pyproject.toml`
- `packages/browser-use-protocol/package.json`
- `packages/browser-client-rewrite/package.json`
- `apps/chrome-extension/manifest.json`
- `internal/host/relay_test.go`
- `scripts/render-homebrew-formula.sh`
- `README.md`
- `README.zh-CN.md`
- `docs/ARCHITECTURE.md`
- `docs/CHROME_WEB_STORE_RELEASE.md`
- `docs/CHROME_WEB_STORE_LISTING.md`
- `docs/SECURITY.md`
- `docs/releases/feature-release-notes.md`
