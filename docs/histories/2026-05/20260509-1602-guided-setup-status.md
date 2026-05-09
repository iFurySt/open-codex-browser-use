## [2026-05-09 16:02] | Task: improve guided setup status

### 🤖 Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `CLI workspace`

### 📥 User Query

> 优化 `open-browser-use` 和 `setup` 输出：直接运行 CLI 时展示 CLI 版本、
> 浏览器插件安装/版本状态和安装命令；`setup` / `setup release` 输出要更
> 适合用户阅读，按步骤展示动作，提醒手动安装或升级浏览器插件；offline/release
> 路径打开 Chrome 扩展页和 Finder/文件管理器，引导拖入 ZIP。

### 🛠 Changes Overview

**Scope:** Go CLI, setup UX, docs, npm CLI package notes.

**Key Actions:**

- **[CLI Status]**: 将无参数 `open-browser-use` 改为状态页，展示 CLI 版本、
  浏览器插件安装/连接状态、插件版本和下一步安装/升级命令。
- **[Setup Output]**: 把 `setup` 和 `setup release/offline` 输出改为带 emoji
  的步骤化结果，避免直接暴露一串技术路径后就结束。
- **[Manual Install]**: `setup release/offline` 在默认路径下打开
  `chrome://extensions/`，并在 Finder/文件管理器中定位 release ZIP，提示用户
  拖入 Chrome 扩展页面手动安装。
- **[Manual ZIP Key Fix]**: `setup release/offline` 现在会从已写入稳定 key 的
  unpacked 目录重新生成 `*-manual.zip`，避免用户拖入原始 release ZIP 后生成与
  native host allowed origin 不一致的 extension id。
- **[Detection]**: 复用 `getInfo` 做权威运行态版本检测，并在无法连接时 best-effort
  扫描 Chrome profile 中的扩展 manifest 版本。
- **[Docs]**: 同步 README、架构、安全、Chrome Web Store 发布、skill 安装和
  npm CLI 包说明。
- **[Release]**: 将 CLI、Chrome extension、JS SDK、Python SDK、protocol package
  和 npm CLI package 版本提升到 `0.1.12`，并跟进发布 `0.1.13` 修复 keyed manual
  ZIP 安装路径；随后发布 `0.1.14` 同步 Homebrew caveat 文案。

### 🧠 Design Intent (Why)

安装失败最常见的断点不是 native host 注册，而是用户不清楚浏览器插件是否已安装、
是否启用、版本是否匹配。CLI 先给出可执行状态和下一步命令，setup 再用步骤化输出
解释已经完成和还需要人工确认的动作，可以降低安装期排查成本。

### 📁 Files Modified

- `cmd/open-browser-use/main.go`
- `cmd/open-browser-use/main_test.go`
- `README.md`
- `README.zh-CN.md`
- `docs/ARCHITECTURE.md`
- `docs/SECURITY.md`
- `docs/CHROME_WEB_STORE_RELEASE.md`
- `docs/releases/feature-release-notes.md`
- `skills/open-browser-use/references/installation.md`
- `skills/open-browser-use/references/troubleshooting.md`
- `packages/open-browser-use-cli/README.md`
- `packages/open-browser-use-cli/cli/postinstall.js`
- `scripts/render-homebrew-formula.sh`
