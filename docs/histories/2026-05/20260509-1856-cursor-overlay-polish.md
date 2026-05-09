## [2026-05-09 18:56] | Task: Polish Cursor Overlay

### 🤖 Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### 📥 User Query

> 对照官方 Chrome cursor 表现，修正 Open Browser Use cursor 太大、方向不对、缺少闲置钟摆摆动，以及移动曲线和速度差异的问题。

### 🛠 Changes Overview

**Scope:** Chrome extension cursor content script

**Key Actions:**

- **Cursor DOM**: 将页面 overlay 从直接显示 46x48 图片改为 24x24 cursor 外层、23x24 图片、12px 中心锚点和图片内部偏移/旋转。
- **Motion Model**: 增加弹簧积分、短距离 scoot、长距离 bezier 轨迹、移动拉伸和落点后 idle 钟摆摆动。
- **Runtime Robustness**: cursor animation 优先使用 `requestAnimationFrame`，同时加 60fps timer fallback，避免 pending frame 卡住后续移动。
- **Release Prep**: 将相关包和 Chrome extension 版本提升到 `0.1.18`，并补充用户可见 release note。

### 🧠 Design Intent (Why)

官方 cursor 的视觉尺寸和方向不是由图片本身决定，而是由 24px 外层容器、中心旋转锚点、内部图片偏移和弹簧动画共同形成。当前实现只用简单 CSS transition 直接移动 46x48 图片，导致尺寸、方向和运动质感都偏离官方表现。

### 📁 Files Modified

- `apps/chrome-extension/content-cursor.js`
- `apps/chrome-extension/manifest.json`
- `cmd/open-browser-use/main.go`
- `packages/browser-client-rewrite/package.json`
- `packages/browser-use-protocol/package.json`
- `packages/open-browser-use-cli/package.json`
- `packages/open-browser-use-js/package.json`
- `packages/open-browser-use-python/pyproject.toml`
- `docs/releases/feature-release-notes.md`
