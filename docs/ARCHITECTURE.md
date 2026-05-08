# 架构总览

这个仓库当前目标是实现 Open Browser Use：一套开源 Browser Use 风格的
浏览器自动化基础设施。

当前有两条并行路线：

- Codio：Electron In-App Browser App。左侧是基于 `codex app-server` 的
  chat/agent 工作区，右侧是 Electron `webview` 驱动的浏览器工作区，并在
  主进程中暴露 Browser Use 风格的 IAB backend。
- Chrome route：MV3 Chrome extension + Go native messaging host + SDK。
  这条路线用于接管用户真实 Chrome profile 中的 tabs、debugger、history
  和 tab groups。

当前长期执行计划：

- `docs/exec-plans/active/2026-04-24-electron-iab-app.md`

已有 Browser Use / Codex IAB 逆向知识沉淀在：

- `docs/wiki/browser-client/`

## 预期的仓库结构

- `apps/desktop/`：Electron desktop app，包含 main、preload、renderer、
  Codex app-server client、BrowserSessionRegistry 和 IAB backend。
- `apps/chrome-extension/`：Open Browser Use MV3 Chrome extension，包含
  readable service worker、cursor content script 和 popup。
- `cmd/open-browser-use/`：Go native messaging host 和 CLI 主入口。二进制
  正式名是 `open-browser-use`，预期可安装 `obu` alias。
- `internal/host/`：Go native messaging stdio 到本地 Unix socket 的中继。
- `internal/wire/`：Open Browser Use native frame codec。
- `packages/browser-client-rewrite/`：当前 Browser Use client 的可读重写
  和协议行为参考。
- `packages/browser-use-protocol/`：Browser Use JSON-RPC native pipe frame、
  请求/响应类型和测试工具。
- `packages/electron-iab-core/`：计划新增的 Electron IAB session、page、
  tab、CDP bridge 和 webContents 管理核心。
- `packages/open-browser-use-js/`：JavaScript/TypeScript SDK。
- `packages/open-browser-use-python/`：Python SDK。
- `packages/`：其他跨应用复用的库、契约和共享能力。
- `infra/`：部署、基础设施和环境定义。
- `scripts/`：仓库级自动化脚本，供人和 Agent 直接调用。
- `docs/`：仓库知识库，也是本地规则和上下文的正式来源。
- `docs/wiki/`：长期演进的主题知识库，用于沉淀可持续追加的调研、
  逆向和架构理解。

## 边界建议

- 业务逻辑优先沉淀到可复用包里，不要一开始就散落在各个 app 中。
- 基础设施和运行编排要显式版本化，不要藏在手工操作里。
- 避免隐式跨包耦合；一旦仓库成形，就把允许的依赖方向写清楚。
- 只要架构有变化，就同步更新这份文档。

## 目标运行拓扑

```text
apps/desktop
  Electron main process
    Codex app-server client
    BrowserSessionRegistry
    Browser Use native pipe server
    webContents/CDP bridge

  Electron renderer process
    left chat workspace backed by Codex app-server
    right in-app browser webview

  Electron preload
    narrow IPC bridge

packages/browser-use-protocol
  JSON-RPC frame and method contracts

packages/electron-iab-core
  future extraction point for route/page/tab/session abstractions
```

首版优先实现 IAB backend，不在同一阶段实现 Chrome extension backend。
IAB 的浏览器状态来自 Electron persistent partition；conversation/window
隔离是应用层 route 和 tab 映射，不等同于独立浏览器 profile。
当前 shared partition 是 `persist:open-codex-browser`，macOS dev profile
路径是 `~/Library/Application Support/Codio/Partitions/open-codex-browser/`。

Chat 的最终执行路径不是在 Electron renderer 里自行调用模型，而是连接
`codex app-server`。Codio 负责渲染 thread/turn/item 事件，并通过 Codex
插件把本地 IAB backend 暴露给 Codex turn 使用。

Browser Use IAB backend 目前通过 `/tmp/codex-browser-use/<uuid>.sock` 暴露，
支持 `getInfo`、`createTab`、`getTabs`、`attach`、`detach` 和
`executeCdp`。当前 smoke 已验证 `Page.navigate`、`Runtime.evaluate` 和
`Page.captureScreenshot` 能走到 Electron guest `webContents`。

## Open Browser Use Chrome Route

Chrome route 的目标拓扑：

```text
upper-layer runtime / SDK / CLI
  -> /tmp/open-browser-use/<uuid>.sock
  -> open-browser-use Go native host
  -> Chrome Native Messaging stdio
  -> Open Browser Use MV3 service worker
  -> chrome.tabs / chrome.debugger / chrome.history / chrome.tabGroups
  -> user's real Chrome profile
```

Chrome native messaging host name 固定为：

```text
com.ifuryst.open-computer-use.extension
```

当前 M1 骨架已经提供：

- native-endian 4-byte length-prefixed JSON frames。
- `open-browser-use host`：启动 Chrome native messaging stdio 到 SDK Unix
  socket 的中继，并写入 `/tmp/open-browser-use/active.json` 供 CLI/SDK
  自动发现当前活跃 socket。
- `open-browser-use manifest`：输出 Chrome native messaging host manifest。
- `open-browser-use install-manifest`：把 native messaging host manifest
  写入 Chrome 默认位置，或通过 `--output` 写到指定路径。
- `open-browser-use call/info/tabs/open-tab/navigate`：通过 socket 发送
  JSON-RPC 请求；未显式传入 `--socket` 时会读取 active socket registry。
- MV3 extension core handlers：`getInfo`、`createTab`、`getTabs`、
  `getUserTabs`、`getUserHistory`、`claimUserTab`、`finalizeTabs`、
  `nameSession`、`attach`、`detach`、`executeCdp`、`moveMouse`、
  `turnEnded`。
- JS 和 Python SDK：直接连接 Unix socket 发送 Browser Use JSON-RPC。

当前 SDK 不内置 Codex 风格的站点限制、turn policy 或二次确认。上层应用
可以自由调用；生产集成如果需要安全策略，应在上层 runtime 或 host 前置网关
中实现。

## 新项目需要补齐的内容

- 核心产品面和运行拓扑。
- 包分层与依赖边界。
- 数据流与存储模型。
- 可观测性方案和本地开发模式。
