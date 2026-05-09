# 架构总览

这个仓库当前目标是实现 Open Browser Use：一套开源 Browser Use 风格的
Chrome 浏览器自动化基础设施。

当前 `main` 分支只保留 Chrome route：MV3 Chrome extension + Go native
messaging host + SDK。这条路线用于接管用户真实 Chrome profile 中的 tabs、
debugger、history 和 tab groups。

已完成的 Chrome route 执行计划：

- `docs/exec-plans/completed/2026-05-08-open-browser-use-chrome-route.md`

已有 Browser Use / Codex extension 逆向知识沉淀在：

- `docs/wiki/browser-client/`
- `docs/references/`

## 预期的仓库结构

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
- `packages/open-browser-use-cli/`：npm 上发布的 `open-browser-use` 二进制
  CLI 包，暴露 `open-browser-use` 和 `obu` 两个命令，发布时只打包 Go CLI
  预构建二进制，不打包 Chrome extension。
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
  写入 Chrome 默认位置，或通过 `--output` 写到指定路径。默认 extension id
  是 Chrome Web Store 版 `bgjoihaepiejlfjinojjfgokghnodnhd`。
- `open-browser-use setup`：显式安装流程，先调用 native host manifest
  注册，再写入 Chrome External Extensions JSON，让 Chrome 从 Web Store
  安装正式扩展。macOS/Windows 仍需要用户在 Chrome 中确认启用扩展；Linux
  的 External Extensions 写入默认使用 Chrome 官方系统路径，可能需要更高权限。
- `open-browser-use setup release`：审核期或非 Web Store 路径，注册 native
  host 后从 GitHub Releases 下载最新
  `open-browser-use-chrome-extension-*.crx`，从 CRX3 头读取 extension id，
  用该 id 注册 native host allowed origin，并用系统方式打开；`setup offline`
  是这个 release 路径的别名。
- manifest 的 `path` 默认统一写入稳定 native host link：
  macOS 为
  `~/Library/Application Support/OpenBrowserUse/native-host/open-browser-use`，
  Linux 为 `~/.local/share/open-browser-use/native-host/open-browser-use`。
  `install-manifest --path` 表示这个稳定 link 指向的真实二进制 target。
- npm 包 `open-browser-use` 是 CLI 二进制分发入口，安装后提供
  `open-browser-use` 和 `obu`；`postinstall` 只提示用户运行显式
  `open-browser-use setup`。
- Homebrew formula 安装后提供 `open-browser-use` 和 `obu`，并在
  caveats 中提示用户运行显式 `open-browser-use setup`。
- CLI 命令层使用 Cobra 实现；Chrome native messaging
  `chrome-extension://...` origin 参数启动时会绕过 Cobra，直接进入 host mode。
  这依赖 Chrome Native Messaging 的标准启动形状：MV3 service worker 调用
  `chrome.runtime.connectNative(...)` 后，Chrome 以 host manifest 中的可执行文件
  路径启动进程，并把调用方 extension origin 作为第一个 argv 传入。manifest
  自身不承载额外自定义 argv，因此 Chrome extension 专用启动信号使用这个
  Chrome 提供的 origin argv。
- `open-browser-use call`：unrestricted JSON-RPC 入口，允许上层应用发送
  任意 method/params；未显式传入 `--socket` 时会读取 active socket registry。
  如果 registry 指向不可连接的旧 socket，CLI 会移除 stale registry entry
  并返回明确错误，避免后续命令持续命中同一个失效 socket。
- CLI 便捷子命令覆盖当前 SDK 核心能力：`ping`、`info`、`tabs`、
  `user-tabs`、`history`、`open-tab`、`navigate`、`claim-tab`、
  `finalize-tabs`、`name-session`、`cdp`、`move-mouse`、
  `wait-file-chooser`、`set-file-chooser-files`、`turn-ended`。
- MV3 extension core handlers：`getInfo`、`createTab`、`getTabs`、
  `getUserTabs`、`getUserHistory`、`claimUserTab`、`finalizeTabs`、
  `nameSession`、`attach`、`detach`、`executeCdp`、`moveMouse`、
  `waitForFileChooser`、`setFileChooserFiles`、`waitForDownload`、
  `downloadPath`、`readClipboardText`、`writeClipboardText`、
  `readClipboard`、`writeClipboard`、`turnEnded`。
- Session state persists the Chrome tab group id, tab origins, group title,
  deliverable group id, and logical active tab id in `chrome.storage.local` so
  MV3 service worker restarts can recover session tab listing semantics.
  `turnEnded` and `finalizeTabs` clear active session state when control ends
  so download notifications only fire while a browser session is active.
- MV3 extension event forwarding：`chrome.debugger.onEvent` 转发为
  `onCDPEvent`，`chrome.downloads` 创建/变更转发为 `onDownloadChange`，
  cursor content script 会回报 cursor arrival 以支持 `moveMouse`
  等待落点。file chooser 通过 CDP `Page.setInterceptFileChooserDialog` 和
  `Page.fileChooserOpened` 事件截获，再使用 `DOM.setFileInputFiles` 写入
  本地文件路径。download wait/path 和 clipboard helpers 由 extension backend
  暴露给 SDK；agent-facing Browser Use command rewrite 还覆盖 DOM CUA、media
  download、element info/screenshot、locator bulk reads、generic tab export 和
  clipboard commands。
- JS 和 Python SDK：直接连接 Unix socket 发送 Browser Use JSON-RPC。
  JS SDK 支持订阅 native socket 上的 JSON-RPC notification；两个 SDK 都
  提供核心 Browser Use method wrappers、download/clipboard convenience
  wrappers，也保留 unrestricted `request`。

当前 SDK 不内置 Codex 风格的站点限制、turn policy 或二次确认。上层应用
可以自由调用；生产集成如果需要安全策略，应在上层 runtime 或 host 前置网关
中实现。

## 新项目需要补齐的内容

- 核心产品面和运行拓扑。
- 包分层与依赖边界。
- 数据流与存储模型。
- 可观测性方案和本地开发模式。
