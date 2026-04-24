# Codio Browser Use IAB Backend

这页记录 Codio 当前开源 IAB backend 的实现状态。它复刻的是 Browser Use
client 需要的本地 backend 形态，不复用 Codex.app 私有实现。

## 当前拓扑

```text
Browser Use client / Codex plugin
  length-prefixed JSON-RPC
  /tmp/codex-browser-use/<uuid>.sock
        |
        v
Codio Electron main process
  BrowserUseNativePipeServer
    JsonRpcSocketConnection
      getInfo / createTab / getTabs
      attach / detach / executeCdp
        |
        v
  IabBackend
    BrowserSessionRegistry
      turnRouteKey = conversationId:turnId
      tabId -> pageKey -> guest webContents
        |
        v
  Electron webContents.debugger
    Chrome DevTools Protocol
```

## Socket 与传输

Codio 在 macOS/Linux 开发模式下监听：

```text
/tmp/codex-browser-use/<uuid>.sock
```

这个路径故意跟 Browser Use client 当前扫描的目录一致。协议是 4-byte
native-endian length prefix 加 UTF-8 JSON payload。共享实现位于：

- `packages/browser-use-protocol/src/index.ts`
- `apps/desktop/src/main/browser-use/native-pipe-server.ts`

socket 目录会被设置为 `0700`，socket 文件会被设置为 `0600`。当前还没有
额外 token 或 peer 校验，发布前需要补本地授权设计。

为了本地调试，Codio 同时写入：

```text
/tmp/codex-browser-use/latest.json
```

内容包含 `name`、`type`、`socketPath` 和 `pid`，文件权限为 `0600`。

Windows 分支使用 Node named pipe 路径
`\\.\pipe\codio-browser-use-<uuid>`。当前还没有 Windows discovery 文件和
端到端验收。

## 方法子集

当前 main process 支持：

| Method | 状态 | 说明 |
| --- | --- | --- |
| `getInfo` | 支持 | 返回 `name=Codio`、`type=iab`、capabilities 和兼容 metadata。 |
| `createTab` | 支持 | 首版返回当前 route 的唯一 active tab；传 `url` 时会导航该 webview。 |
| `getTabs` | 支持 | 返回同一 `session_id` 下的 Codio tab。 |
| `attach` | 支持 | 对目标 `webContents` 调用 `debugger.attach("1.3")`。 |
| `detach` | 支持 | detach Electron debugger。 |
| `executeCdp` | 支持 | 转发到 `webContents.debugger.sendCommand`。 |
| `getUserTabs` | 支持空结果 | IAB 没有 Chrome user tab claim 语义，返回 `[]`。 |
| `claimUserTab` | 不支持 | 返回明确 unsupported error。 |
| `finalizeTabs` | 不支持 | 返回明确 unsupported error。 |

CDP debugger 的 `message` event 会以 `onCDPEvent` notification 转发，并带
逻辑 `tabId`。

## ID 映射

```text
Browser Use tabId
  -> BrowserSessionRegistry tab record
    -> pageKey = ownerWebContentsId:conversationId
      -> guestWebContentsId
        -> Electron webContents
```

首版每个 `(windowId, conversationId)` 只有一个 active browser page。这个
限制是应用层约束，不代表 Electron 或 Chrome 只能有一个页面。

当 renderer 收到 app-server `turn/start` 响应后，会通过 IPC 捕获
`turnRouteKey = conversationId:turnId`。如果某个 conversation 有活跃 turn
route，`createTab`、`attach`、`detach` 和 `executeCdp` 会校验
`session_id + turn_id + tabId` 是否仍然指向被捕获 route。turn 完成后
renderer 会释放这个 turn route。

## Profile 与 Partition

Codio 的 webview 使用 shared persistent partition：

```text
persist:open-codex-browser
```

在当前 macOS dev 环境里，Electron 把它落在：

```text
~/Library/Application Support/Codio/Partitions/open-codex-browser/
```

清理开发 profile 可以删除：

```sh
rm -rf "$HOME/Library/Application Support/Codio/Partitions/open-codex-browser"
```

这里保存的是共享 browser storage，包括 cookies、localStorage、IndexedDB、
cache 等。`conversationId/windowId/tabId` 只做应用层路由隔离，不是独立
Chrome profile。

## 验证

当前 smoke 脚本：

```sh
node scripts/smoke-browser-use-rpc.mjs
```

在 `pnpm dev` 运行时，它会扫描 `/tmp/codex-browser-use/*.sock`，找到
`name=Codio` 且 `type=iab` 的 backend，然后执行：

1. `getInfo`
2. `getTabs`
3. `attach`
4. `executeCdp(Page.navigate)` 到 `https://example.com`
5. `executeCdp(Runtime.evaluate)` 读取 `document.location.href` 和
   `document.title`
6. `executeCdp(Page.captureScreenshot)`
7. `detach`

2026-04-24 的本地验证结果：`href=https://example.com/`，
`title=Example Domain`，截图约 44 KB。

## 当前缺口

- 还没有 Codex plugin manifest 和 app-server turn 内工具调用闭环。
- turn-level route capture 已有首版实现，但还缺超时释放和真实 Codex plugin
  工具调用验收。
- 还没有 Playwright selector bridge、cursor overlay 和输入坐标可视反馈。
- Windows named pipe 已有代码路径，但还缺 discovery 文件和端到端验收。
- socket 还缺少 token/peer 授权。
