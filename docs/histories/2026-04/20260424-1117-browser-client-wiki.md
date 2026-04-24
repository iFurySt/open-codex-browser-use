## [2026-04-24 11:17] | Task: Browser client wiki

### Execution Context

- **Agent ID**: `codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### User Query

> 在 `docs/` 里专门开一个 wiki 记录 Browser Use client 分析信息，按主题归档
> 到不同目录和 Markdown 文件里，方便后续持续增量分析。

### Changes Overview

**Scope:** docs

**Key Actions:**

- **Wiki scaffold**: 新增 `docs/wiki/` 作为长期演进的主题知识库入口。
- **Browser client pages**: 按 backend discovery、transport/RPC、automation
  stack、command surface、policy/permissions、open questions 拆分 Browser Use
  client 逆向信息。
- **IAB architecture**: 补充 Codex in-app browser 的 `windowId`、
  `pageKey`、`cdpTabId`、Electron `webview`/`webContents`、route 和
  persistent partition 关系。
- **IAB implementation deep dive**: 追加 native pipe 生命周期、turn route
  capture/release、renderer hidden webview、main-process webview attach
  handoff、CDP/input command execution、cursor arrival handshake 和 profile
  目录观察结果。
- **Chrome extension path**: 补充非 IAB 默认 backend 路线，记录 fixed
  extension pipe、`extension` backend selection、Chrome-only claim/finalize
  能力、tab ID 语义、native host 推断拓扑和本机未发现 active extension
  backend/native host 的观测结果。
- **Atlas cross-check**: 交叉检查 `ChatGPT Atlas.app`，记录其 native macOS
  外壳、内嵌 Chromium browser framework、native messaging host 搜索路径、
  以及未发现 Browser Use-specific backend 字符串或 host manifest 的结论。
- **Cross links**: 在 references 和 architecture 文档中补充 wiki 入口说明。

### Design Intent (Why)

将首次逆向报告中的结论拆成可追加的主题页，避免后续分析继续堆到单篇长文里。
`docs/references/` 保留来源型记录，`docs/wiki/` 承载可持续维护的项目知识。

### Files Modified

- `docs/wiki/README.md`
- `docs/wiki/browser-client/README.md`
- `docs/wiki/browser-client/runtime/backend-discovery.md`
- `docs/wiki/browser-client/runtime/chrome-extension-architecture.md`
- `docs/wiki/browser-client/runtime/iab-architecture.md`
- `docs/wiki/browser-client/runtime/transport-rpc.md`
- `docs/wiki/browser-client/automation/automation-stack.md`
- `docs/wiki/browser-client/automation/command-surface.md`
- `docs/wiki/browser-client/security/policy-and-permissions.md`
- `docs/wiki/browser-client/notes/open-questions.md`
- `docs/references/README.md`
- `docs/references/browser-client-reverse-engineering.md`
- `docs/ARCHITECTURE.md`
