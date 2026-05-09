## [2026-05-09 12:38] | Task: native host auto-registration

### Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### User Query

> Chrome Web Store extension ID 已确定为 `bgjoihaepiejlfjinojjfgokghnodnhd`。统一让 Chrome native messaging manifest 指向稳定软链位置，并让 npm/brew 安装 CLI 后自动创建软链和 manifest；`open-browser-use install-manifest` 默认使用商店 extension id。

### Changes Overview

**Scope:** CLI native host registration, npm CLI package, Homebrew formula, docs.

**Key Actions:**

- **Stable Link**: `install-manifest` 默认创建稳定 native host link，manifest 的 `path` 写入该 link，而不是 npm、brew 或 dev 的真实安装路径。
- **Default Store ID**: CLI 默认使用 Chrome Web Store extension id `bgjoihaepiejlfjinojjfgokghnodnhd`，普通用户可以直接运行 `open-browser-use install-manifest` 修复注册。
- **npm Auto Registration**: npm 包新增 `postinstall`，安装后 best-effort 自动调用真实 Go binary 注册 native host。
- **Homebrew Auto Registration**: Homebrew formula renderer 新增 `post_install` 和 caveats，brew 安装后 best-effort 自动注册并提供修复命令。
- **Docs Sync**: README、架构、Chrome Web Store 和 npm 包说明同步为新的 prod 安装路径。

### Design Intent (Why)

Chrome extension 只能按固定 host name 找 Native Messaging manifest，用户不应该理解 npm、brew 或 dev binary 的实际路径。通过稳定软链把 Chrome manifest 和真实 binary 位置解耦，可以让商店插件 + CLI 安装成为默认可用路径，同时保留显式 `--extension-id` 给 unpacked dev extension。

### Files Modified

- `cmd/open-browser-use/main.go`
- `cmd/open-browser-use/main_test.go`
- `packages/open-browser-use-cli/cli/postinstall.js`
- `packages/open-browser-use-cli/package.json`
- `packages/open-browser-use-cli/README.md`
- `scripts/render-homebrew-formula.sh`
- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/CHROME_WEB_STORE_RELEASE.md`
- `docs/CHROME_WEB_STORE_LISTING.md`
