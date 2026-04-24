## [2026-04-24 18:12] | Task: Codio UI 调整为 Codex.app 风格

### 🤖 Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### 📥 User Query

> 现在样式整体调整一下，参考一下 codex.app 这个样式。

### 🛠 Changes Overview

**Scope:** `apps/desktop/src/renderer`

**Key Actions:**

- **[Chat Pane]**: 调整左侧为 Codex.app 风格的 thread 顶栏，使用轻量图标
  按钮、居中的 thread title 和无卡片消息流。
- **[Composer]**: 改为底部浮动输入框，包含 add context、access 状态、
  model 状态和圆形 send 按钮。
- **[Browser Pane]**: 增加 browser tab strip，保留地址栏、导航按钮和
  origin/title 区域，使右侧更接近 in-app browser 外观。
- **[Visual System]**: 改为白底、浅灰分割线、低饱和控件和更接近
  Codex.app 的间距、字号、边角。

### 🧠 Design Intent (Why)

Codio 的首版界面已经能运行，但视觉上更像普通管理台。用户要求参考
Codex.app，因此这次只收敛 UI 呈现，不改变 app-server、IAB backend、
webview route 或 CDP 行为。

### ✅ Validation

- `pnpm typecheck`
- `pnpm build`
- 启动 `pnpm dev` 后用 Computer Use 查看 Electron 窗口，确认左右分栏、
  browser tab/toolbar 和底部 composer 正常渲染。

### 📁 Files Modified

- `apps/desktop/src/renderer/main.tsx`
- `apps/desktop/src/renderer/styles.css`
