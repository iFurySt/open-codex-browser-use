# Codio Troubleshooting

## `pnpm dev` 没有打开 Electron

先确认依赖和构建产物：

```sh
pnpm install
pnpm typecheck
pnpm build
pnpm dev
```

`pnpm dev` 会同时启动 Vite renderer、main process TypeScript watch 和
Electron。如果端口 `5173` 被占用，先停掉已有 dev server。

## 找不到 Codio IAB socket

Codio socket 位于：

```text
/tmp/codex-browser-use/<uuid>.sock
```

检查方式：

```sh
find /tmp/codex-browser-use -maxdepth 1 -type s -print
cat /tmp/codex-browser-use/latest.json
node scripts/smoke-browser-use-rpc.mjs
```

如果目录里还有 Codex.app 自己的 socket，smoke 脚本会按 `getInfo` 返回的
`name=Codio` 和 `type=iab` 过滤。

## CDP attach 或执行失败

常见原因：

- Electron webview 还没有 attach，`getTabs` 为空。
- 当前 `session_id` 没有对应 conversation route。
- webview 被销毁或窗口已关闭。
- 另一个 debugger 已经 attach 到同一个 guest `webContents`。

先跑：

```sh
node scripts/smoke-browser-use-rpc.mjs
```

这个脚本会验证 `attach`、`Page.navigate`、`Runtime.evaluate`、
`Page.captureScreenshot` 和 `detach`。

## 清理 browser profile

Codio shared browser partition：

```text
persist:open-codex-browser
```

macOS dev profile：

```text
~/Library/Application Support/Codio/Partitions/open-codex-browser/
```

清理命令：

```sh
rm -rf "$HOME/Library/Application Support/Codio/Partitions/open-codex-browser"
```

这个目录只对应 browser partition。Codex app-server 的配置、登录和外部
Codex 数据不在这里。
