# Codio Electron In-App Browser App

## 目标

实现 Codio：一个开源 Electron App。左侧是基于 `codex app-server` 的
chat/agent 工作区，右侧是 In-App Browser。它不复刻 Codex.app 私有代码，
但要复刻我们已经逆向并文档化的关键行为模型：Electron `webview` + guest
`webContents`、按 `conversationId + windowId` 维护浏览器路由、持久化
partition、以及通过本地 native pipe 暴露 Browser Use 风格的 IAB
backend。

最终状态应当是：开发者可以本地启动 Codio，在左侧通过 Codex app-server
创建/恢复 thread、发起 turn 并渲染 item/delta/tool 结果，右侧浏览器能打开
页面；Codex 通过插件发现并调用 Codio 的 IAB backend，Browser Use client
能用 `tabId -> webContents` 的路径执行基础 CDP 自动化。

## 范围

- 包含：
  - Electron desktop app 骨架。
  - 左 Codex app-server chat、右 browser 的首屏工作台。
  - `codex app-server` 连接、初始化、thread/turn/item 渲染。
  - Codex 插件/Browser Use backend 的本地集成路径。
  - Electron main/renderer/preload 的安全边界。
  - IAB route/session/page/tab 数据模型。
  - 一个开源 `BrowserSessionRegistry` 等价实现。
  - `<webview>` attach 生命周期、persistent partition 和 guest
    `webContents` 管理。
  - Browser Use 风格 native pipe JSON-RPC server。
  - IAB backend 的最小协议子集：`getInfo`、`createTab`、`getTabs`、
    `attach`、`detach`、`executeCdp`。
  - 最小自动化验收：打开页面、读标题、执行 `Runtime.evaluate`、导航。
  - 相关文档、history、测试命令和本地启动说明。
- 不包含：
  - 直接复用或搬运 Codex.app 私有实现。
  - 第一阶段实现 Chrome extension backend。
  - 在 Electron renderer 内自行实现 LLM chat/runtime。
  - 第一阶段实现多账号、云同步、自动更新、生产级签名和 notarization。
  - 第一阶段实现 Chrome 用户 profile 接管、`claimUserTab`、
    `finalizeTabs` 等 Chrome-extension-only 能力。

## 背景

- 相关文档：
  - `docs/wiki/browser-client/runtime/iab-architecture.md`
  - `docs/wiki/browser-client/runtime/chrome-extension-architecture.md`
  - `docs/wiki/browser-client/runtime/backend-discovery.md`
  - `docs/wiki/browser-client/runtime/transport-rpc.md`
  - `docs/wiki/browser-client/automation/command-surface.md`
  - `docs/wiki/codio/codex-app-server-integration.md`
  - <https://github.com/openai/codex/blob/main/codex-rs/app-server/README.md>
  - `docs/FRONTEND.md`
  - `docs/SECURITY.md`
  - `docs/RELIABILITY.md`
- 相关代码路径：
  - `packages/browser-client-rewrite/browser-client.mjs`
- 计划新增：`apps/desktop/`
- 已新增：`packages/browser-use-protocol/`
  - 计划新增：`packages/electron-iab-core/`
- 已知约束：
  - Chat 的执行 runtime 是 Codex app-server，不是 Codio renderer 自己调
    模型。
  - Codex app-server 需要 `initialize` + `initialized` 握手，然后通过
    `thread/start`/`thread/resume` 和 `turn/start` 驱动会话。
  - Codio 需要渲染 app-server 的 thread/turn/item 通知流。
  - 当前仓库已开始落 Electron app 骨架，后续要继续补 app-server client、
    IAB core 和 Browser Use native pipe。
  - 先做 IAB，不把 Chrome extension path 混进首版架构。
  - Browser Use client 侧拿到的是逻辑 `tabId`；在 IAB 中它映射到内部
    `pageKey`，再映射到 Electron guest `webContents`。
  - IAB storage 使用 Electron persistent partition；会共享 cookies、
    localStorage、IndexedDB、cache 等 profile-like 状态。
  - 需要以开源可维护为前提，所有协议和约束都要落到仓库文档。

## 目标架构

```text
Codio Electron App
  main process
    CodexAppServerClient
      initialize / initialized
      thread/start or thread/resume
      turn/start
      item and turn notification stream
    BrowserWindow registry
    BrowserSessionRegistry
      routeKey = windowId:conversationId
      turnRouteKey = conversationId:turnId
      pageKey = ownerWebContentsId:conversationId
      tabId -> pageKey -> guest webContents
    NativePipeServer
      Browser Use JSON-RPC over length-prefixed socket
    Electron session
      persist:open-codex-browser

  renderer process
    Chat workspace
      Codex app-server thread/turn/item renderer
      conversation + turn state
      turn route capture/release IPC
    Browser workspace
      webview per active conversation
      loading/error/url/title state
      cursor overlay later

  preload
    narrow IPC bridge
    no Node globals in renderer

Browser Use client
  discover backend type iab
  getInfo/createTab/getTabs/executeCdp

Codex app-server
  executes Codex turns
  loads plugins/apps/MCPs
  calls Codio IAB plugin/backend during active turns
```

## 核心概念

- `conversationId`：chat 会话 ID，也是 Browser Use 请求中的 `session_id`。
  首版应优先绑定到 app-server `threadId`。
- `turnId`：一次 agent turn 的 ID，用来绑定本轮工具调用。
- `windowId`：Electron `BrowserWindow.id`，用于区分同一会话在不同窗口
  中的浏览器路由。
- `routeKey`：`${windowId}:${conversationId}`，主进程的 browser backend
  生命周期 key。
- `turnRouteKey`：`${conversationId}:${turnId}`，一次 turn 的临时绑定。
- `pageKey`：`${ownerWebContentsId}:${conversationId}`，renderer owner
  页面里的 browser page key。
- `tabId`：对 Browser Use client 暴露的逻辑数字 ID；首版内部命名可用
  `cdpTabId`，但 API 只暴露 `tabId`。
- `persistent partition`：Electron 的持久化 browser storage bucket；
  首版统一使用 `persist:open-codex-browser`。

## 推荐实现顺序

1. 建仓库运行骨架：package manager、Electron/Vite/React/TypeScript、
   lint/typecheck/build/dev scripts。
2. 做可启动 Codio desktop shell：一个 `BrowserWindow`，左 Codex chat
   面板，右 browser 面板，布局稳定。
3. 做 renderer `<webview>`：地址栏、加载状态、错误状态、基础导航。
4. 做 main/preload 安全边界：`contextIsolation`、`sandbox`、禁用 renderer
   Node，收紧 IPC surface。
5. 做 `BrowserSessionRegistry` 内存模型：`windowId`、`conversationId`、
   `routeKey`、`pageKey`、`tabId`。
6. 做 webview attach handoff：`will-attach-webview` 解析 route-bearing
   partition，重写到 shared persistent partition，`did-attach-webview`
   记录 guest `webContents`。
7. 做 native pipe transport：Unix socket/macOS + Linux；Windows named pipe
   先留接口。
8. 做最小 IAB JSON-RPC：`getInfo`、`createTab`、`getTabs`。
9. 做 CDP bridge：`attach`、`detach`、`executeCdp` 走
   `webContents.debugger.sendCommand`。
10. 用 `packages/browser-client-rewrite/browser-client.mjs` 或独立测试脚本跑
    end-to-end smoke。
11. 补输入事件和 cursor：先支持 `Input.dispatchKeyEvent`、
    `Input.dispatchMouseEvent`、`Input.insertText`，再做可视 cursor overlay。
12. 补 Codex app-server 真连接：initialize、thread、turn、item stream。
13. 补 Codio Browser Use 插件注册和 Codex turn 内调用闭环。
14. 补多 conversation/multi-window、清理、错误恢复、权限策略和打包。

## 里程碑

### M0：项目初始化与边界收敛

- [x] 决定 package manager 和 Node 版本，并写入仓库文档。
- [x] 新增 `apps/desktop/`，选择 Electron + Vite + React + TypeScript。
- [x] 新增 workspace 配置，避免后续多包临时拼路径。
- [x] 建立 `dev`、`build`、`typecheck`、`lint`、`test` 命令。
- [x] 更新 `docs/ARCHITECTURE.md`，从模板结构替换为真实 app/package
      分层。
- [x] 更新 `docs/FRONTEND.md`，记录 desktop UI 启动和验收方式。
- [x] 更新 `docs/QUALITY_SCORE.md`，把真实质量短板替换掉模板占位。
- [x] 验证：`make check-docs`、`pnpm typecheck`、desktop app 能启动。

### M1：Electron Shell 与基础 UI

- [x] 创建主进程入口，启动单个 `BrowserWindow`。
- [x] 配置 preload，renderer 不直接访问 Node API。
- [x] 创建左 chat、右 browser 的 split layout。
- [x] 左侧实现最小 conversation 列表、消息区、输入框。
- [x] 右侧实现 browser toolbar：back、forward、reload、stop、URL input。
- [x] 右侧实现 `<webview>` 容器和加载/error/empty 状态。
- [x] 建立 renderer state：`conversationId`、`activeUrl`、`title`、
      `loading`。
- [x] 验证：本地启动后可以通过 IAB CDP smoke 打开
      `https://example.com` 并读到标题 `Example Domain`。

### M2：IAB Session/Page/WebContents 模型

- [x] 在 main process 实现 `BrowserSessionRegistry`。
- [x] 记录 `BrowserWindow.id` 到 window registry。
- [x] 为每个 conversation 建 `routeKey = windowId:conversationId`。
- [x] 为每个 owner renderer webContents 建
      `pageKey = ownerWebContentsId:conversationId`。
- [x] 维护 `tabsById`、`tabIdsByPageKey`、`routeKeysByTabId`、
      `selectedTabIdsByRouteKey`。
- [x] 首版约束：每个 `(windowId, conversationId)` 只有一个 active browser
      page。
- [x] 定义并实现销毁路径：window close、conversation route release、
      webview destroyed。
- [ ] 补 renderer crash 后的 route/tab 恢复和清理验证。
- [ ] 验证：切换两个 conversation 时，各自 page/tab state 不串。

### M3：Persistent Partition 与 webview Attach Handoff

- [x] Renderer 创建 webview 时先使用 route-bearing partition：
      `persist:open-codex-browser-route:<encoded conversationId>`。
- [x] Main process 在 `will-attach-webview` 解析 conversationId。
- [x] Main process 拒绝未知 route 的 webview attach。
- [x] Main process 重写 partition/session 到
      `persist:open-codex-browser`。
- [x] 配置 guest webview：`sandbox=true`、`nodeIntegration=false`、
      `contextIsolation=true`。
- [x] 配置 preload：首版可以为空或只暴露严格限定的页面辅助能力。
- [x] 在 `did-attach-webview` 拿到 guest `webContents` 并写入 page state。
- [x] 记录 profile 路径和清理方式到文档。
- [ ] 验证：重启 app 后 cookies/localStorage 在 shared partition 内保留。

### M4：Native Pipe 与 JSON-RPC Transport

- [x] 新增 `packages/browser-use-protocol/`，定义 JSON-RPC frame、request、
      response、error 和 method types。
- [x] 实现 length-prefixed JSON-RPC server。
- [x] macOS/Linux 支持 `/tmp/codex-browser-use/<uuid>.sock`。
- [x] 预留固定 socket alias 或 discovery 文件，用于本地调试。
- [x] Windows named pipe 先定义接口，后续实现。
- [x] 实现 `getInfo()`，返回：
      `type=iab`、`name`、`version`、`capabilities`、`metadata`。
- [x] metadata 包含 `codexSessionId` 等兼容字段时要明确它们的开源语义，
      不强依赖 Codex 私有命名。
- [x] 加连接日志和请求日志，默认脱敏。
- [x] 验证：独立 Node 脚本能连上 socket 并调用 `getInfo`。

### M5：IAB Backend 协议最小子集

- [x] 实现 `createTab(session_id, turn_id, url?)`。
- [x] 实现 `getTabs(session_id, turn_id)`。
- [x] 实现 `attach(tabId)`，内部调用 `webContents.debugger.attach("1.3")`。
- [x] 实现 `detach(tabId)`。
- [x] 实现 `executeCdp({ target: { tabId }, method, commandParams })`。
- [x] 转发 CDP debugger `message` event，带上逻辑 `tabId`。
- [x] 对未知 tab、非当前 route、未 attach、webContents destroyed 给明确
      JSON-RPC error。
- [x] IAB-only behavior：`getUserTabs()` 返回空数组，
      `claimUserTab()`/`finalizeTabs()` 返回明确 unsupported error。
- [x] 验证：通过 pipe 调用 `Page.navigate`、`Runtime.evaluate`、
      `Page.captureScreenshot`。

### M6：Turn Route 与 Chat 集成

- [x] 实现 Codex app-server client transport，首选 stdio，保留 unix socket
      和 websocket 适配点。
- [x] 实现 app-server `initialize` 请求和 `initialized` 通知。
- [x] 实现 `thread/start`、`thread/resume` 的最小 UI 数据流。
- [x] 实现 `thread/list` 和 durable resume UI。
- [x] 左侧 chat 每次发送消息调用 `turn/start` 并记录 app-server `turnId`。
- [x] 渲染 `item/started`、`item/agentMessage/delta`、`item/completed`、
      `turn/completed`、reasoning、command output 和工具调用通知。
- [x] Renderer 在 turn 开始时发 `browser-use-turn-route-capture` IPC。
- [x] Main process 维护 `turnRouteKey = conversationId:turnId`。
- [x] 主要 backend request 校验 `session_id + turn_id` 对应捕获 route。
- [x] Turn 结束时发 `browser-use-turn-route-release` IPC。
- [ ] 实现 turn 超时和异常释放。
- [ ] 在真实 app-server 接入前，UI 可以显示 disconnected/pending 状态，
      但不把 mock 视为最终 chat runtime。
- [x] 验证：旧 turnId 不能继续控制当前 webview。

### M6.5：Codio Plugin 集成

- [x] 定义 Codio Browser Use 插件 manifest 和本地开发安装路径。
- [ ] 让 Codex app-server 能发现 Codio 插件。
- [x] 插件把 Browser Use backend 指向 Codio main process 暴露的 native
      pipe。
- [ ] 在 Codex turn metadata 中传递 `session_id` 和 `turn_id`。
- [ ] 验证：Codex turn 内调用 Browser Use 工具时能命中 Codio IAB route。

### M7：Browser Use Client 兼容验收

- [ ] 用现有 `packages/browser-client-rewrite/browser-client.mjs` 做本地
      smoke harness。
- [ ] 支持 `setupAtlasRuntime({ backend: "iab" })` 风格发现，或提供兼容
      socket discovery adapter。
- [ ] 验证 `browser.tabs.new`、`browser.tabs.list`、`browser.cdp.send`。
- [x] 验证 Playwright selector bridge 的可行性，先记录缺口。
- [x] 对比 `docs/wiki/browser-client/automation/command-surface.md`，标注
      已支持、部分支持、未支持。
- [x] 输出一份 `docs/wiki/open-iab/compatibility.md`。

### M8：输入、光标与可视反馈

- [ ] 支持 `Input.dispatchMouseEvent`，先尝试原生 CDP，必要时补
      `executeJavaScript` fallback。
- [ ] 支持 `Input.dispatchKeyEvent`。
- [ ] 支持 `Input.insertText`。
- [ ] 支持 `Input.synthesizeScrollGesture` 或记录明确不支持。
- [ ] Renderer 画 browser-use cursor overlay。
- [ ] Main/renderer 做 cursor arrived handshake。
- [ ] 支持 browser bounds、DPR、缩放后的坐标换算。
- [ ] 验证：自动点击、输入、滚动在 webview 内位置正确。

### M9：安全、权限与站点策略

- [x] 默认禁用 guest Node。
- [x] 限定 IPC channel 白名单。
- [x] 限定 webview permission request 策略。
- [x] 明确下载、文件上传、媒体权限的首版策略。
- [x] Socket 默认仅当前用户可访问，检查文件权限。
- [ ] 设计本地连接授权：开发模式 token，未来可做签名/peer check。
- [x] 记录 profile 数据位置、清理命令和隐私边界。
- [ ] 添加安全测试：未知 origin、未知 route、未知 method、跨 turn 访问。

### M10：多会话、多窗口与生命周期

- [ ] 支持多个 conversation 独立 browser state。
- [ ] 支持一个 conversation 在不同 BrowserWindow 中各自 route。
- [x] 支持窗口关闭时清理 route/tab/debugger attach。
- [ ] 支持 app crash/reload 后不残留 socket。
- [ ] 支持 renderer reload 后重新 attach webview。
- [ ] 明确首版是否支持真正多 tab；如果支持，新增 browser tab strip。
- [ ] 验证：两窗口同一 conversation 不互相抢 guest webContents。

### M11：可观测性与测试

- [x] 单元测试：protocol frame encode/decode。
- [x] 单元测试：registry route/page/tab 映射。
- [x] 集成测试：启动 Electron app，连接 native pipe，执行 CDP。
- [ ] UI smoke：截图确认左 chat、右 browser 都渲染。
- [ ] 失败路径测试：webview destroyed、navigation fail、debugger detach。
- [ ] 日志分层：main、renderer、backend RPC、CDP event。
- [x] CI 接入：至少跑 docs、typecheck、unit tests。

### M12：打包与开源交付

- [ ] 选择打包工具：Electron Forge、electron-builder 或 Vite Electron
      生态方案。
- [ ] 产出 macOS unsigned dev build。
- [ ] 后续补 Windows/Linux build matrix。
- [x] 写 README quick start。
- [x] 写 troubleshooting：webview 权限、socket、profile、debugger attach。
- [x] 写 release notes 模板。
- [ ] 暂不做 notarization；等功能稳定后单独建 release plan。

## 风险

- 风险：一开始同时做 UI、Agent、RPC、CDP，复杂度会失控。
  - 缓解方式：先把 App shell 和 IAB backend 解耦，按里程碑验收。
- 风险：Electron `webview` 安全边界配置不严。
  - 缓解方式：M1 就确立 preload/IPC/sandbox 约束，M9 专门补安全验收。
- 风险：Browser Use client 兼容目标不清，后期返工。
  - 缓解方式：M4/M5 就复用当前 wiki 的 transport/RPC/command surface。
- 风险：CDP input 在 webview 内焦点/坐标不稳定。
  - 缓解方式：先支持导航和 Runtime，再单独做 M8 input/cursor。
- 风险：persistent partition 会让会话隔离被误解成 profile 隔离。
  - 缓解方式：文档明确 profile 共享，conversation/window 是应用层隔离。
- 风险：socket 被其他本地进程访问。
  - 缓解方式：开发期校验权限和 token，发布前设计授权机制。

## 验证方式

- 命令：
  - `make check-docs`
  - `pnpm dev`
  - `pnpm typecheck`
  - `pnpm build`
  - `pnpm test`
  - `node scripts/smoke-browser-use-rpc.mjs`
- 手工检查：
  - 启动 App，左侧 chat、右侧 browser 布局稳定。
  - 右侧 browser 能打开页面、刷新、后退、前进。
  - 切换 conversation 后浏览器状态不串。
  - 重启后 shared partition 中的站点状态符合预期。
- 观测检查：
  - native pipe 创建、连接、断开有日志。
  - CDP attach/detach 和 `executeCdp` 有可追踪 request id。
  - webview attach/destroy/crash/navigation fail 有明确日志。

## 进度记录

- [x] 2026-04-24：基于已沉淀的 Codex IAB 逆向结果，建立开源 Electron
      IAB App 长期执行计划。
- [x] 2026-04-24：补充产品名 Codio、Codex app-server chat runtime、以及
      Codex 插件调用 Codio IAB backend 的集成方向。
- [x] 2026-04-24：完成 pnpm workspace、`apps/desktop` Electron/Vite/React
      骨架、preload IPC、split layout、webview toolbar 和初版
      `BrowserSessionRegistry` route capture。
- [x] 2026-04-24：验证 `pnpm typecheck`、`pnpm build`、`pnpm test`、
      `make check-docs` 和 built Electron start smoke 通过。
- [x] 2026-04-24：实现 Codex app-server stdio client，支持启动
      `codex app-server --listen stdio://`、`initialize`/`initialized`、
      ephemeral `thread/start`、`thread/resume`、`turn/start`，并把
      item/turn/status 通知通过 IPC 渲染到左侧 chat。
- [x] 2026-04-24：修正 sandbox preload 输出为 CommonJS `.cjs`，验证
      `pnpm dev` 能拉起 Electron、Vite、main watch 和
      `codex app-server --listen stdio://` 子进程。
- [x] 2026-04-24：扩展 `BrowserSessionRegistry`，落
      `routeKey -> pageKey -> tabId -> guest webContents` 映射，并在
      `did-attach-webview` 时记录 guest `webContents`、URL 和 title。
- [x] 2026-04-24：新增 `packages/browser-use-protocol`，实现 native pipe
      frame encode/decode、JSON-RPC socket connection 和协议单测。
- [x] 2026-04-24：实现 Browser Use IAB native pipe backend，支持
      `/tmp/codex-browser-use/<uuid>.sock`、`getInfo/createTab/getTabs`、
      `attach/detach/executeCdp` 和 IAB-only unsupported 行为。
- [x] 2026-04-24：新增 `scripts/smoke-browser-use-rpc.mjs`，验证
      `getInfo/getTabs`、CDP `Page.navigate`、`Runtime.evaluate` 和
      `Page.captureScreenshot`，本地结果为 `https://example.com/`、
      `Example Domain` 和约 44 KB PNG。
- [x] 2026-04-24：补 registry route/window release 单测，并让 window close
      时清理 route/tab 映射；native pipe 目录和 socket 权限收紧为
      `0700/0600`。
- [x] 2026-04-24：显式设置 Electron app name 为 Codio，配置 shared
      browser partition 默认拒绝 webview permission request。
- [x] 2026-04-24：补 README quick start、Codio troubleshooting wiki 和
      功能发布记录。
- [x] 2026-04-24：native pipe 启动后写
      `/tmp/codex-browser-use/latest.json` 作为本地 discovery 文件。
- [x] 2026-04-24：新增 turn route capture/release IPC，main process 维护
      `conversationId:turnId` 映射，IAB backend 在活跃 turn route 存在时
      校验 `session_id + turn_id + tabId`。
- [x] 2026-04-24：新增 open IAB compatibility 文档，标注 Browser Use
      command surface 当前支持、部分支持和缺口。
- [x] 2026-04-24：新增 `plugins/codio-browser-use` 插件骨架，包含
      `.codex-plugin/plugin.json`、skill 和 discovery helper。
- [x] 2026-04-24：NativePipeServer 增加 Windows named pipe 路径分支；
      macOS/Linux discovery 行为不变。
- [x] M0：项目初始化与边界收敛。
- [x] M1：Electron Shell 与基础 UI。
- [ ] M2：IAB Session/Page/WebContents 模型。
- [ ] M3：Persistent Partition 与 webview Attach Handoff。
- [ ] M4：Native Pipe 与 JSON-RPC Transport。
- [x] M5：IAB Backend 协议最小子集。
- [ ] M6：Turn Route 与 Chat 集成。
- [ ] M7：Browser Use Client 兼容验收。
- [ ] M8：输入、光标与可视反馈。
- [ ] M9：安全、权限与站点策略。
- [ ] M10：多会话、多窗口与生命周期。
- [ ] M11：可观测性与测试。
- [ ] M12：打包与开源交付。

## 决策记录

- 2026-04-24：首条主线只做 Electron IAB，不做 Chrome extension backend。
  原因是 IAB 可完全在开源 Electron App 内闭环验证，而 extension backend
  依赖额外浏览器扩展和 native host 分发。
- 2026-04-24：首版每个 `(windowId, conversationId)` 只暴露一个 browser
  page。原因是这与已观察到的 Codex IAB 路由语义一致，也能显著降低首版
  tab 生命周期复杂度。
- 2026-04-24：首版使用 shared persistent partition
  `persist:open-codex-browser`。原因是要先复刻 IAB profile 共享语义；
  conversation/window 隔离放在应用层 route/tab 映射中完成。
- 2026-04-24：Browser Use 兼容层从 native pipe JSON-RPC 最小子集做起。
  原因是 `getInfo/createTab/getTabs/executeCdp` 足以形成可验证闭环，input、
  cursor、Playwright bridge 可以在此基础上逐步补齐。
- 2026-04-24：产品名确定为 Codio。
- 2026-04-24：Codio chat 不自建 LLM runtime，最终基于 Codex
  app-server 的 thread/turn/item 模型执行和渲染。原因是 app-server 是
  Codex 富客户端的官方接口，也能让 Codex 插件、Apps、MCP 和权限策略留在
  Codex 运行时内。
- 2026-04-24：Codio app-server thread 改为默认持久化。原因是左侧历史
  sidebar 已接入 `thread/list` 和 `thread/read(includeTurns=true)`，
  新会话需要能被 durable resume UI 重新打开。
