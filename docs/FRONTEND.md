# 前端协作说明

Codio 的前端位于 `apps/desktop/`，当前使用 Electron + Vite + React +
TypeScript。

## 本地启动

```sh
pnpm install
pnpm dev
```

`pnpm dev` 会启动 Vite renderer dev server，并打开 Electron desktop app。
主进程同时会启动 Codex app-server client 和 Browser Use IAB native pipe。

## 构建与检查

```sh
pnpm typecheck
pnpm build
pnpm test
node scripts/smoke-browser-use-rpc.mjs
```

## UI 边界

- 左侧 chat 面板最终由 Codex app-server 的 thread/turn/item 事件驱动。
- 右侧 browser 面板使用 Electron `webview`。
- Renderer 不直接访问 Node API，只通过 preload 暴露的窄 IPC surface 与
  main process 交互。
- Browser route capture/release 通过 IPC 告知 main process，main process
  决定 webview 是否允许 attach。
- webview 的 shared persistent partition 是 `persist:open-codex-browser`。
  当前 macOS dev profile 位于
  `~/Library/Application Support/Codio/Partitions/open-codex-browser/`。

## 设计约束

- Codio 是工作台，不是 landing page。
- 首屏必须直接呈现 chat + browser split layout。
- 工具按钮优先使用图标按钮，并保持尺寸稳定。
- 页面区域不嵌套卡片；chat message 可以作为重复 item 使用轻量边框。
- 文案保持操作面板密度，不使用营销式 hero。
