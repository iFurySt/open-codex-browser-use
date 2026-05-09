## [2026-05-09 18:08] | Task: rename manual setup command to beta

### 🤖 Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### 📥 User Query

> 安装后不要再提示 `open-browser-use setup release`；干掉 `setup release`，
> 只保留 `setup` 和 `setup beta`（原来的 offline 路径），安装提示改成：
> `执行以下命令安装： open-browser-use setup beta`。

### 🛠 Changes Overview

**Scope:** Go CLI, npm CLI package, Homebrew formula renderer, docs, skill references, version metadata.

**Key Actions:**

- **[CLI]**: 将手动安装入口从 `setup release/offline` 改为 `setup beta`，并让状态输出中的备用安装命令指向 `open-browser-use setup beta`。
- **[Install Guidance]**: 将 npm `postinstall` 和 Homebrew caveats 缩短为只提示执行 `open-browser-use setup beta`。
- **[Docs]**: 同步 README、架构、安全、Chrome Web Store 发布和 skill 安装/排障文档，并记录 `0.1.16` 用户可感知变更。

### 🧠 Design Intent (Why)

Chrome Web Store 条目上架前，用户真正需要的是一条稳定的审核期安装路径。
把 `release` 和 `offline` 两个名字收口为 `beta`，可以降低安装后提示的分叉和误解；
后续商店上架后再把默认提示切回正式 `setup` 路径。

### 📁 Files Modified

- `cmd/open-browser-use/main.go`
- `cmd/open-browser-use/main_test.go`
- `packages/open-browser-use-cli/cli/postinstall.js`
- `scripts/render-homebrew-formula.sh`
- `README.md`
- `README.zh-CN.md`
- `packages/open-browser-use-cli/README.md`
- `docs/ARCHITECTURE.md`
- `docs/SECURITY.md`
- `docs/CHROME_WEB_STORE_RELEASE.md`
- `docs/releases/feature-release-notes.md`
- `skills/open-browser-use/references/installation.md`
- `skills/open-browser-use/references/troubleshooting.md`
- version metadata under `apps/`, `cmd/`, and `packages/`
