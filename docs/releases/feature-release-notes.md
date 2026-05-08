# 功能发布记录

## 2026-05

| 日期 | 功能域 | 用户价值 | 变更摘要 |
| --- | --- | --- | --- |
| 2026-05-08 | Open Browser Use Chrome Route | 手工运行 `obu` / `open-browser-use` 时可以直接看到版本和用法，不会误启动 native host 长驻进程；Chrome extension 仍可通过 native messaging 正常拉起 host。 | 发布 `0.1.2` patch 版本，收敛 CLI 启动体验：无参数输出版本化帮助，Chrome-provided `chrome-extension://...` argv 继续作为 MV3 native messaging host 启动信号。 |
| 2026-05-08 | Open Browser Use Chrome Route | 开发者可以通过开源 MV3 Chrome extension、Go native host/CLI、JS SDK 和 Python SDK 操作真实 Chrome profile，并使用 `obu`/`open-browser-use` 执行常用浏览器动作。 | 发布 `0.1.1` patch 版本，包含 Cobra CLI、Chrome native messaging host、active socket discovery、核心 Browser Use 方法、CDP/history/download/cursor 事件转发和真实 Chrome smoke 覆盖。 |

## 2026-04

| 日期 | 功能域 | 用户价值 | 变更摘要 |
| --- | --- | --- | --- |
| 2026-04-24 | Codio Desktop | 开发者可以启动一个左 chat、右 In-App Browser 的开源 Codex app-server 桌面工作台，并通过 Browser Use native pipe 验证基础 CDP 自动化。 | 新增 Electron/Vite/React app、Codex app-server stdio client、BrowserSessionRegistry、Browser Use IAB backend、protocol package、CDP smoke、profile/socket 文档和单测。 |
| 2026-04-08 | 模板仓库 | 提供了一套可直接用于新项目启动的 Agent-first 基础模板。 | 补齐了 AGENTS 入口、execution plan、history、release note、CI/CD 和供应链安全骨架。 |
