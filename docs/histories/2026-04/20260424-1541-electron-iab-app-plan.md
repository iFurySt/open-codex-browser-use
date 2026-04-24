## [2026-04-24 15:41] | Task: 规划 Electron IAB App

### 🤖 Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### 📥 User Query

> 现在我们来实现一个 Electron App，左边是 chat 框，右边是 In-App
> Browser。功能很大，先把具体 todo 和长期推进计划落到仓库里，后续陆续
> 实现。
>
> 补充：App 名为 Codio；chat 最终基于 Codex app-server 执行和渲染；
> Codex 通过插件与 Codio Electron IAB backend 交互。

### 🛠 Changes Overview

**Scope:** `apps/desktop`, root workspace config, docs/wiki, docs/exec-plans

**Key Actions:**

- **[Plan]**: 新增 Electron In-App Browser App 的 active execution plan，
  拆分为项目初始化、Electron shell、webview/session、native pipe、CDP
  bridge、turn route、Browser Use 兼容、安全、测试和打包等里程碑。
- **[Architecture]**: 更新顶层架构文档，记录计划中的 `apps/desktop`、
  `packages/browser-use-protocol` 和 `packages/electron-iab-core` 分层。
- **[Codio App]**: 新增 pnpm workspace 和 `apps/desktop` Electron/Vite/
  React/TypeScript 骨架，落左 chat、右 browser split layout。
- **[IAB Shell]**: Main process 配置安全 webPreferences、preload IPC、
  route-bearing webview partition、shared persistent partition 和初版
  `BrowserSessionRegistry`。
- **[IAB Registry]**: 扩展 `BrowserSessionRegistry`，维护
  `routeKey -> pageKey -> tabId -> guest webContents` 映射，并在
  `did-attach-webview` 后跟踪 guest 页面 URL/title/destroyed 状态。
- **[Codex App-Server]**: 新增 wiki 说明 Codio chat 基于 Codex app-server
  thread/turn/item 通知流，而不是 renderer 自建模型 runtime。
- **[Codex App-Server Client]**: 实现 main process stdio client，启动
  `codex app-server --listen stdio://`，完成 `initialize`/`initialized`、
  ephemeral `thread/start`、`thread/resume`、`turn/start` 和通知转发。
- **[Chat Rendering]**: Renderer 订阅 Codex app-server 事件，渲染
  `thread/started`、`turn/started`、`item/agentMessage/delta`、
  `item/started`、`item/completed`、`warning` 和 `turn/completed`。
- **[Repo Hygiene]**: 补充 Electron/Vite 构建产物 ignore，避免提交本地
  `dist-main` 和 `dist-renderer`。
- **[Docs Hygiene]**: 清理既有 wiki 页尾多余空行，使仓库文档范围的
  markdownlint 通过。
- **[Browser Use Protocol]**: 新增 `@codio/browser-use-protocol` package，
  实现 length-prefixed JSON-RPC frame、socket connection helper 和
  protocol frame 单测。
- **[IAB Backend]**: 新增 main process Browser Use native pipe server 和
  IAB backend，监听 `/tmp/codex-browser-use/<uuid>.sock`，支持
  `getInfo/createTab/getTabs/attach/detach/executeCdp`。
- **[CDP Smoke]**: 新增 `scripts/smoke-browser-use-rpc.mjs`，验证 native
  pipe 能驱动 Electron guest `webContents` 执行 `Page.navigate`、
  `Runtime.evaluate` 和 `Page.captureScreenshot`。
- **[Lifecycle & Security]**: 补 window/route release 清理、registry 单测、
  native pipe 脱敏日志，以及 socket 目录/文件权限收紧。
- **[Discovery]**: native pipe 启动时写
  `/tmp/codex-browser-use/latest.json`，便于本地调试和后续 plugin adapter
  发现 Codio socket。
- **[Turn Route]**: 增加 browser turn route capture/release IPC，main
  process 维护 `conversationId:turnId`，IAB backend 在活跃 turn route
  存在时校验 `session_id + turn_id + tabId`。
- **[Compatibility]**: 新增 open IAB compatibility 文档，对 Browser Use
  command surface 标注已支持、部分支持和待实现项。
- **[Plugin Skeleton]**: 新增 `plugins/codio-browser-use`，包含 Codex plugin
  manifest、browser skill 和 Codio IAB discovery helper。
- **[Platform Path]**: NativePipeServer 增加 Windows named pipe 路径分支；
  macOS/Linux socket discovery 保持 `/tmp/codex-browser-use/latest.json`。
- **[Wiki]**: 新增 Codio Browser Use IAB backend 文档，记录 socket、
  profile 路径、ID 映射、方法子集、验证方式和当前缺口。
- **[Troubleshooting]**: 补 Codio 本地启动、socket、CDP attach 和 profile
  清理排障文档，并更新功能发布记录。

### 🧠 Design Intent (Why)

这个功能跨度很大，直接开写会把 Electron UI、Browser Use 协议、CDP bridge、
session/profile 隔离和安全策略混在一起。先把长期计划落到仓库，明确首版只做
IAB backend，并把后续每个阶段的验收标准拆清楚，方便多轮持续推进。

Codio 的 chat runtime 明确交给 Codex app-server，是为了复用 Codex 的
thread/turn/item、插件、Apps、MCP 和权限模型；Electron App 专注在桌面壳、
IAB profile/webContents 管理和本地 Browser Use backend。

### 📁 Files Modified

- `package.json`
- `pnpm-workspace.yaml`
- `pnpm-lock.yaml`
- `.gitignore`
- `apps/desktop/package.json`
- `apps/desktop/src/main/main.ts`
- `apps/desktop/src/main/browser-session-registry.ts`
- `apps/desktop/src/main/browser-use/iab-backend.ts`
- `apps/desktop/src/main/browser-use/native-pipe-server.ts`
- `apps/desktop/src/main/codex-app-server.ts`
- `apps/desktop/src/preload/preload.cts`
- `apps/desktop/src/renderer/main.tsx`
- `apps/desktop/src/renderer/styles.css`
- `apps/desktop/test/browser-session-registry.test.mjs`
- `packages/browser-use-protocol/package.json`
- `packages/browser-use-protocol/src/index.ts`
- `packages/browser-use-protocol/test/frame.test.mjs`
- `scripts/smoke-browser-use-rpc.mjs`
- `plugins/codio-browser-use/.codex-plugin/plugin.json`
- `plugins/codio-browser-use/skills/browser/SKILL.md`
- `plugins/codio-browser-use/scripts/discover-codio-iab.mjs`
- `docs/exec-plans/active/2026-04-24-electron-iab-app.md`
- `docs/ARCHITECTURE.md`
- `docs/FRONTEND.md`
- `docs/QUALITY_SCORE.md`
- `docs/wiki/codio/codex-app-server-integration.md`
- `docs/wiki/codio/browser-use-iab-backend.md`
- `docs/wiki/codio/troubleshooting.md`
- `docs/wiki/codio/plugin-integration.md`
- `docs/wiki/open-iab/compatibility.md`
- `docs/wiki/README.md`
- `docs/SECURITY.md`
- `docs/releases/feature-release-notes.md`
- `docs/wiki/browser-client/automation/automation-stack.md`
- `docs/wiki/browser-client/automation/command-surface.md`
- `docs/wiki/browser-client/runtime/backend-discovery.md`
- `docs/wiki/browser-client/runtime/transport-rpc.md`
- `docs/wiki/browser-client/security/policy-and-permissions.md`
