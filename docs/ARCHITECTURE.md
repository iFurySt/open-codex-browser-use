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
  正式名是 `open-browser-use`，可通过同路径 symlink 或 shell alias 暴露为
  `obu`。
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
com.ifuryst.open_browser_use.extension
```

Chrome native messaging host name 只能使用小写字母、数字、underscore 和
dot；hyphen 版本 `com.ifuryst.open-computer-use.extension` 会被
`chrome.runtime.connectNative` 直接拒绝。

当前 M1 骨架已经提供：

- native-endian 4-byte length-prefixed JSON frames。
- `open-browser-use host`：启动 Chrome native messaging stdio 到 SDK Unix
  socket 的中继；默认 socket 路径是
  `/tmp/open-browser-use/<uuid>.sock`，并写入
  `/tmp/open-browser-use/active.json` 供 CLI/SDK 自动发现当前活跃 socket。
  Chrome native messaging 以 `chrome-extension://...` origin 参数启动二进制时，
  CLI 会自动进入 host mode。
- 无参数运行 `open-browser-use` 或 `obu` 只输出版本和用法提示，不再启动
  native host；手工启动 host 使用 `open-browser-use host`。
- `open-browser-use manifest`：输出 Chrome native messaging host manifest。
- `open-browser-use install-manifest`：把 native messaging host manifest
  写入 Chrome 默认位置，或通过 `--output` 写到指定路径。
- 本地安装后可以把 `obu` 指向同一个二进制，例如
  `ln -sfn ~/.local/bin/open-browser-use ~/.local/bin/obu`。
- CLI 命令层使用 Cobra 实现；Chrome native messaging
  `chrome-extension://...` origin 参数启动时会绕过 Cobra，直接进入 host mode。
  这依赖 Chrome Native Messaging 的标准启动形状：MV3 service worker 调用
  `chrome.runtime.connectNative(...)` 后，Chrome 以 host manifest 中的可执行文件
  路径启动进程，并把调用方 extension origin 作为第一个 argv 传入。manifest
  自身不承载额外自定义 argv，因此 Chrome extension 专用启动信号使用这个
  Chrome 提供的 origin argv。
- `open-browser-use call`：unrestricted JSON-RPC 入口，允许上层应用发送
  任意 method/params；未显式传入 `--socket` 时会读取 active socket registry。
- CLI 便捷子命令覆盖当前 SDK 核心能力：`ping`、`info`、`tabs`、
  `user-tabs`、`history`、`open-tab`、`navigate`、`claim-tab`、
  `finalize-tabs`、`name-session`、`cdp`、`move-mouse`、`turn-ended`。
- MV3 extension core handlers：`getInfo`、`createTab`、`getTabs`、
  `getUserTabs`、`getUserHistory`、`claimUserTab`、`finalizeTabs`、
  `nameSession`、`attach`、`detach`、`executeCdp`、`moveMouse`、
  `turnEnded`。
- Session state persists the Chrome tab group id, tab origins, group title,
  deliverable group id, and logical active tab id in `chrome.storage.local` so
  MV3 service worker restarts can recover session tab listing semantics.
  `turnEnded` and `finalizeTabs` clear active session state when control ends
  so download notifications only fire while a browser session is active.
- MV3 extension event forwarding：`chrome.debugger.onEvent` 转发为
  `onCDPEvent`，`chrome.downloads` 创建/变更转发为 `onDownloadChange`，
  cursor content script 会回报 cursor arrival 以支持 `moveMouse`
  等待落点。
- JS 和 Python SDK：直接连接 Unix socket 发送 Browser Use JSON-RPC。
  JS SDK 支持订阅 native socket 上的 JSON-RPC notification；两个 SDK 都
  提供核心 Browser Use method wrappers，也保留 unrestricted `request`。

当前 SDK 不内置 Codex 风格的站点限制、turn policy 或二次确认。上层应用
可以自由调用；生产集成如果需要安全策略，应在上层 runtime 或 host 前置网关
中实现。

## 新项目需要补齐的内容

- 核心产品面和运行拓扑。
- 包分层与依赖边界。
- 数据流与存储模型。
- 可观测性方案和本地开发模式。
