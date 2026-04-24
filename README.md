# Codio

Codio is an open-source Electron app that pairs a Codex app-server powered
chat workspace with an Electron in-app browser.

## 简介

Codio 的目标是复刻 Codex.app In-App Browser 的关键开源形态：左侧 chat
最终接入 `codex app-server`，右侧通过 Electron `webview` 承载浏览器页面，
再通过 Codex 插件/Browser Use backend 让 Codex turn 可以控制这个浏览器。

## 快速开始

安装依赖：

```sh
pnpm install
```

启动 Electron 开发环境：

```sh
pnpm dev
```

构建和检查：

```sh
pnpm typecheck
pnpm build
pnpm test
make check-docs
```

Browser Use IAB backend smoke：

```sh
pnpm dev
node scripts/smoke-browser-use-rpc.mjs
```

当前 UI 骨架在 `apps/desktop/`，长期执行计划在
`docs/exec-plans/active/2026-04-24-electron-iab-app.md`。

## 许可证

[MIT](LICENSE)
