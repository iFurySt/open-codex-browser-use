# 功能发布记录

## 2026-05

| 日期 | 功能域 | 用户价值 | 变更摘要 |
| --- | --- | --- | --- |
| 2026-05-08 | Chrome Extension Release | Chrome extension 发布包现在包含 manifest PNG icons，减少首次商店提交时的基础素材缺口。 | 发布 `0.1.3` patch 版本，补齐 Chrome extension `16`、`32`、`48`、`128` 图标和 toolbar icon 声明，并把图标纳入打包校验。 |
| 2026-05-08 | Chrome Extension Release | 开发者可以从 GitHub Release 拿到可安装的 Chrome extension zip，并在 release workflow 中选择是否提交 Chrome Web Store 审核。 | 新增 extension 打包脚本、Chrome Web Store API v2 上传/发布脚本、release workflow 输入和发布文档。 |
| 2026-05-08 | Open Browser Use Chrome Route | 手工运行 `obu` / `open-browser-use` 时可以直接看到版本和用法，不会误启动 native host 长驻进程；Chrome extension 仍可通过 native messaging 正常拉起 host。 | 发布 `0.1.2` patch 版本，收敛 CLI 启动体验：无参数输出版本化帮助，Chrome-provided `chrome-extension://...` argv 继续作为 MV3 native messaging host 启动信号。 |
| 2026-05-08 | Open Browser Use Chrome Route | 开发者可以通过开源 MV3 Chrome extension、Go native host/CLI、JS SDK 和 Python SDK 操作真实 Chrome profile，并使用 `obu`/`open-browser-use` 执行常用浏览器动作。 | 发布 `0.1.1` patch 版本，包含 Cobra CLI、Chrome native messaging host、active socket discovery、核心 Browser Use 方法、CDP/history/download/cursor 事件转发和真实 Chrome smoke 覆盖。 |

## 2026-04

| 日期 | 功能域 | 用户价值 | 变更摘要 |
| --- | --- | --- | --- |
| 2026-04-08 | 模板仓库 | 提供了一套可直接用于新项目启动的 Agent-first 基础模板。 | 补齐了 AGENTS 入口、execution plan、history、release note、CI/CD 和供应链安全骨架。 |
