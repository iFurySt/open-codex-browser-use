# 架构总览

这个仓库当前目标是实现 Codio：一个开源 Electron In-App Browser App。
左侧是基于 `codex app-server` 的 chat/agent 工作区，右侧是 Electron
`webview` 驱动的浏览器工作区，并在主进程中暴露 Browser Use 风格的 IAB
backend。

当前长期执行计划：

- `docs/exec-plans/active/2026-04-24-electron-iab-app.md`

已有 Browser Use / Codex IAB 逆向知识沉淀在：

- `docs/wiki/browser-client/`

## 预期的仓库结构

- `apps/desktop/`：Electron desktop app，包含 main、preload、renderer、
  Codex app-server client、BrowserSessionRegistry 和 IAB backend。
- `packages/browser-client-rewrite/`：当前 Browser Use client 的可读重写
  和协议行为参考。
- `packages/browser-use-protocol/`：Browser Use JSON-RPC native pipe frame、
  请求/响应类型和测试工具。
- `packages/electron-iab-core/`：计划新增的 Electron IAB session、page、
  tab、CDP bridge 和 webContents 管理核心。
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

## 新项目需要补齐的内容

- 核心产品面和运行拓扑。
- 包分层与依赖边界。
- 数据流与存储模型。
- 可观测性方案和本地开发模式。
