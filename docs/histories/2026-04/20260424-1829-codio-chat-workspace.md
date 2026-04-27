## [2026-04-24 18:29] | Task: Codio chat workspace

### 🤖 Execution Context

- **Agent ID**: `codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### 📥 User Query

> 参考 Codex.app 和 Codex app-server 协议，先实现 Codio chat 逻辑：
> 新会话、历史会话切换、消息气泡、reasoning/tool 渲染、连续发送 steer
> 和停止。

### 🛠 Changes Overview

**Scope:** `apps/desktop`, `docs`

**Key Actions:**

- **[App-Server Client]**: 扩展主进程 client，支持 `thread/list`、
  `thread/read(includeTurns=true)`、`turn/steer` 和 `turn/interrupt`。
- **[Persistent Threads]**: 新会话默认 `ephemeral=false`，可进入左侧历史
  sidebar 并被重新打开。
- **[Renderer Workspace]**: 新增 Codex.app 风格左侧历史 sidebar，支持
  new thread、active thread 切换和历史 turn/item 恢复。
- **[Turn Controls]**: 发送时按 active turn 自动选择 `turn/start` 或
  `turn/steer`；停止按钮调用 `turn/interrupt`。
- **[Item Rendering]**: 渲染 `userMessage`、`agentMessage`、`reasoning`、
  `plan`、`commandExecution`、`mcpToolCall`、`dynamicToolCall` 和 streaming
  delta。
- **[Codex Style Pass]**: 收窄左侧为纯会话 sidebar，补折叠入口、`New chat`
  顶部样式、activity 折叠块、消息复制、结论复制、禁用输入框 resize 以及
  类似 Codex.app 的模型强度下拉。
- **[Window Chrome]**: macOS 窗口切到 `titleBarStyle = hiddenInset`，
  renderer 顶部 header/tabs/toolbar 标记为 draggable region，去掉原生
  顶部整条 title bar。

### 🧠 Design Intent (Why)

Codio 的 chat runtime 应该复用 Codex app-server 的 thread/turn/item 模型，
而不是在 Electron renderer 中自建模型协议。这样左侧 chat、右侧 IAB 和
后续 Codex plugin 调用可以共享同一个 `threadId + turnId` 路由边界。

### 📁 Files Modified

- `apps/desktop/src/main/codex-app-server.ts`
- `apps/desktop/src/main/main.ts`
- `apps/desktop/src/preload/preload.cts`
- `apps/desktop/src/renderer/main.tsx`
- `apps/desktop/src/renderer/styles.css`
- `apps/desktop/src/shared/contracts.ts`
- `docs/exec-plans/active/2026-04-24-codio-chat-workspace.md`
- `docs/exec-plans/active/2026-04-24-electron-iab-app.md`
- `docs/wiki/codio/codex-app-server-integration.md`
- `docs/QUALITY_SCORE.md`
