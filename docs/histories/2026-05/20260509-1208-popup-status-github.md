## [2026-05-09 12:08] | Task: polish popup status and GitHub entry

### Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### User Query

> 提升 Chrome extension popup 的视觉完成度，展示当前连接情况，用红绿点或 icon 表示状态，并增加能跳转到 GitHub repo 的 section。

### Changes Overview

**Scope:** Chrome extension popup

**Key Actions:**

- **Status UI**: 将单行 native host 状态改为连接面板，展示 Connected、Reconnecting、Disconnected、Unknown 等状态及红绿状态点。
- **Diagnostics**: 展示 native host name、last checked、重试次数和错误信息，popup 打开后每 5 秒刷新一次。
- **GitHub Entry**: 新增 GitHub repo section 和 `View repo` 入口，点击后打开 `https://github.com/iFurySt/open-codex-browser-use`。

### Design Intent (Why)

Popup 是工具面，核心目标是让用户第一眼看懂 extension 和 native host 是否连通，同时提供一个低干扰的开源仓库入口。状态色使用绿色表示可用、红色表示断开或未知、橙色表示正在重连，避免只靠文案传达连接健康度。

### Files Modified

- `apps/chrome-extension/popup.html`
- `apps/chrome-extension/popup.css`
- `apps/chrome-extension/popup.js`
