# 功能发布记录

## 2026-05

| 日期 | 功能域 | 用户价值 | 变更摘要 |
| --- | --- | --- | --- |
| 2026-05-09 | Guided Chrome Setup | Chrome Web Store 审核期的安装路径不再依赖 Chrome Stable 会拒绝的自分发 CRX；用户可以下载 release zip 后按 Chrome 官方 unpacked extension 流程完成安装。 | 发布 `0.1.11` patch 版本，`setup release/offline` 改为下载 release zip、展开到 Application Support、写入稳定 unpacked extension key、注册对应 native host allowed origin，并打开 `chrome://extensions/` 引导 Load unpacked；GitHub Release 页面只暴露 zip。 |
| 2026-05-09 | CI Reliability | Release 后的 main 分支 CI 不会再因为 relay notification 测试竞态卡到超时，发布验证反馈更快。 | 发布 `0.1.10` patch 版本，修复 relay broadcast 测试等待 client accept 的竞态，并给 notification read 加 deadline。 |
| 2026-05-09 | Guided Chrome Setup | `open-browser-use setup release` 不再依赖 GitHub Releases API，减少 unauthenticated API rate limit 或 403 导致审核期安装失败的风险。 | 发布 `0.1.9` patch 版本，把 release CRX 下载改为直接拉取当前 CLI 版本对应的 GitHub Release asset。 |
| 2026-05-09 | Guided Chrome Setup | 用户通过 npm 或 Homebrew 安装 CLI 后，可以显式运行 `open-browser-use setup` 完成 native host 注册和 Chrome 扩展安装引导；Chrome Web Store 审核期也可以用 `open-browser-use setup release` 拉取 GitHub Release CRX。 | 发布 `0.1.8` patch 版本，新增 `setup` CLI、Chrome External Extensions 写入、GitHub Release CRX 下载/打开流程、CRX3 extension id 读取和 `setup offline` 别名，并把 npm `postinstall` 与 Homebrew caveats 改为提示显式 setup。 |
| 2026-05-09 | Browser Use Command Coverage | Agent-facing Chrome automation commands now line up with the Codex Chrome plugin surface, so existing agents can rely on download wait/path, DOM CUA, element screenshots/info, bulk locator reads, clipboard helpers, browser history, and tab export without bespoke fallbacks. | 发布 `0.1.7` patch 版本，补齐 browser-client rewrite handlers、MV3 backend clipboard/download RPC、JS/Python SDK wrappers，并新增 metadata-to-handler regression guard 和对应安全/架构/命令面文档。 |
| 2026-05-09 | Chrome Extension Release | 推送 `v*` tag 后，GitHub Release 会自动附带可双击打开的 `.crx` 插件包，同时保留 Chrome Web Store 使用的 zip 包。 | 发布 `0.1.6` patch 版本，新增 CRX3 打包脚本、tag 自动 release 入口、CRX manifest/checksum，并把 `.crx` 纳入 release assets、artifact upload 和 provenance。 |
| 2026-05-09 | Open Browser Use Native Host Install | 用户从 Chrome Web Store 安装插件后，再通过 npm 或 Homebrew 安装 CLI 即可自动注册 native host；如果需要修复，也可以直接运行 `open-browser-use install-manifest`，不再要求普通用户提供 extension id 或真实二进制路径。 | 发布 `0.1.5` patch 版本，manifest 默认指向稳定 native host symlink，CLI 默认使用商店 extension id `bgjoihaepiejlfjinojjfgokghnodnhd`，npm `postinstall` 和 Homebrew `post_install` 会 best-effort 创建 symlink 并写入 Chrome Native Messaging manifest，同时提升 popup 连接状态展示和 GitHub repo 入口。 |
| 2026-05-09 | Open Browser Use Chrome Route | 开发者可以自动处理网页文件上传控件，CLI 在遇到过期 native host socket 时会自动清理失效 registry，后续本地验证也能通过 `make ci` 覆盖完整核心矩阵。 | 发布 `0.1.4` patch 版本，新增 file chooser 截获/设置文件能力、`wait-file-chooser` / `set-file-chooser-files` CLI、JS/Python SDK wrappers、stale active socket 清理、fake peer relay 测试，并把 Go/JS/Python/extension 检查纳入 CI。 |
| 2026-05-08 | Chrome Extension Release | Chrome extension 发布包现在包含 manifest PNG icons，减少首次商店提交时的基础素材缺口。 | 发布 `0.1.3` patch 版本，补齐 Chrome extension `16`、`32`、`48`、`128` 图标和 toolbar icon 声明，并把图标纳入打包校验。 |
| 2026-05-08 | Chrome Extension Release | 开发者可以从 GitHub Release 拿到可安装的 Chrome extension zip，并在 release workflow 中选择是否提交 Chrome Web Store 审核。 | 新增 extension 打包脚本、Chrome Web Store API v2 上传/发布脚本、release workflow 输入和发布文档。 |
| 2026-05-08 | Open Browser Use Chrome Route | 手工运行 `obu` / `open-browser-use` 时可以直接看到版本和用法，不会误启动 native host 长驻进程；Chrome extension 仍可通过 native messaging 正常拉起 host。 | 发布 `0.1.2` patch 版本，收敛 CLI 启动体验：无参数输出版本化帮助，Chrome-provided `chrome-extension://...` argv 继续作为 MV3 native messaging host 启动信号。 |
| 2026-05-08 | Open Browser Use Chrome Route | 开发者可以通过开源 MV3 Chrome extension、Go native host/CLI、JS SDK 和 Python SDK 操作真实 Chrome profile，并使用 `obu`/`open-browser-use` 执行常用浏览器动作。 | 发布 `0.1.1` patch 版本，包含 Cobra CLI、Chrome native messaging host、active socket discovery、核心 Browser Use 方法、CDP/history/download/cursor 事件转发和真实 Chrome smoke 覆盖。 |

## 2026-04

| 日期 | 功能域 | 用户价值 | 变更摘要 |
| --- | --- | --- | --- |
| 2026-04-08 | 模板仓库 | 提供了一套可直接用于新项目启动的 Agent-first 基础模板。 | 补齐了 AGENTS 入口、execution plan、history、release note、CI/CD 和供应链安全骨架。 |
