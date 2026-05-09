## [2026-05-09 18:29] | Task: 补充 JS SDK README 用法

### 🤖 Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### 📥 User Query

> 将 Codex app browser-client 风格的 JS SDK 编排能力写到 JS SDK README，并补充 SDK 接入用法和示例，要求简洁易懂但覆盖完整。

### 🛠 Changes Overview

**Scope:** `packages/open-browser-use-js`

**Key Actions:**

- **[README]**: 新增 JS SDK README，覆盖前置条件、高层 browser/tab API、低层 client/CDP API、通知、常用方法和清理流程。
- **[Examples]**: 增加单 tab DOM snapshot、多 tab 并发编排、raw CDP 和 notification 订阅示例。

### 🧠 Design Intent (Why)

让使用者可以快速理解 JS SDK 同时支持原子能力和封装后的 Playwright-like 编排能力，并能直接复制最小 Node 示例接入真实 Chrome 会话。

### 📁 Files Modified

- `packages/open-browser-use-js/README.md`
