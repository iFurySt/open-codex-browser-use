# Multi-browser selection

## 目标

支持同一台机器上同时运行多个 Chromium-family browser（首批：Google
Chrome Stable、Google Chrome Beta、BitBrowser），并让 agent 在任务开始前
选择要操作的 browser/profile。选择后，当前任务内持续使用同一个
browser/profile，不再依赖“最近写入 active.json 的那个 host”。

同时复查并演进 `active.json` 自愈逻辑：删除或损坏 `active.json` 时，CLI
必须能通过 socket 扫描恢复；多 browser 场景下，恢复结果也必须可按
browser/profile selector 明确路由。

## 范围

- CLI discovery：`profiles --connected` 从单 Chrome profile 列表升级为
  browser-aware target 列表。
- CLI routing：所有 socket-backed 命令支持 `--browser <selector>`，并继续
  支持 `--profile <selector>`。
- Setup / manifest：manifest 和 external extension helper 支持 Chrome Stable、
  Chrome Beta；BitBrowser 至少支持检测和已运行 user-data-dir 下的 native
  manifest 注册路径。
- Agent skill：多 browser/multi profile 任务开始前询问用户，后续持续传
  `--browser`/`--profile`。

## 实机发现

- Chrome Stable user data:
  `~/Library/Application Support/Google/Chrome`
- Chrome Beta user data:
  `~/Library/Application Support/Google/Chrome Beta`
- BitBrowser 运行实例使用：
  `~/Library/Application Support/BitBrowser/BrowserCache/<id>` 作为
  `--user-data-dir`。对应 native manifest 目录在该 user-data-dir 下的
  `NativeMessagingHosts/`。
- 当前实机已同时连通 Chrome Stable、Chrome Beta、BitBrowser。BitBrowser 使用
  keyed release extension，并通过 BitBrowser local API 启动时加载本地 extension
  目录。

## 设计

- 引入 `browserDefinition`，包含 stable id、display name、profile root、
  manifest/external extension 路径策略。
- `installedChromeProfile` 扩展为 browser-aware target，JSON 输出新增
  `browser` / `browserName` / `target` 字段。旧 `directory`/`displayName`
  字段保留。
- `resolveProfileForInstanceID` 改为扫描所有支持的 browser roots，并返回
  browser + profile。
- `connectedProfileInfo` 携带 browser identity。`--browser` 和 `--profile`
  共同参与 socket 选择。
- 未显式选择 browser/profile 时保留原 active socket 快路径；显式选择时始终
  扫描 socket，避免 active socket 指向另一个 browser。
- `active.json` 缺失时继续按 mtime 扫描 socket 并修复；显式 selector 选择
  成功后也把 active record 修复到所选 socket，作为后续无 selector 的快速路径。

## 验证

- Go 单测：
  - 多 browser profile discovery。
  - instanceId 反查到 Chrome Beta / BitBrowser profile。
  - `profiles --connected --json` 输出 browser 字段且保持 strict JSON。
  - `--browser` selector 能选中对应 socket。
  - active.json 缺失时仍能扫描并修复。
- 实机：
  - 运行 `obu profiles --connected --json`，确认能区分 Chrome Stable、Chrome
    Beta、BitBrowser 的安装/连接状态。
  - 删除 `/tmp/open-browser-use/active.json` 后，运行无 selector 和带
    `--browser` selector 的命令，确认不会要求重装插件。

## 风险

- BitBrowser 的 native messaging / extension 安装路径和普通 Chrome 不完全一致。
  第一版以当前实机可见的 `BrowserCache/<id>` user-data-dir 为支持目标，并保留
  清晰错误信息。
- 多个 browser 使用同一个 extension id 时，仅凭 extension instanceId 反查需要
  扫描所有 browser roots；需保持文件读取上限，避免大 LevelDB 文件造成内存风险。
- 旧脚本可能只读取 `directory` 字段；新增字段保持向后兼容，不移除旧字段。

## 进度

- [x] browser-aware discovery/routing
- [x] setup / manifest path 支持
- [x] skill 和 architecture 文档
- [x] 自动化测试
- [x] 三 browser 全连接实机验证

## 实机验证记录

- `go run ./cmd/open-browser-use profiles --connected --json`：同时检测到
  `chrome:Default`、`chrome-beta:Default`、
  `bitbrowser:23c443e599cd4b028b1455fb0eb58d5d:Default`，且三者
  `connected: true`。
- `go run ./cmd/open-browser-use setup --browser chrome-beta --path
  /opt/homebrew/bin/obu --no-open`：成功写入 Chrome Beta native manifest 和
  External Extensions JSON。启用 Chrome Beta extension 后，
  `info --browser chrome-beta --timeout 5s` 成功连到 Beta host。
- `go run ./cmd/open-browser-use install-manifest --browser
  23c443e599cd4b028b1455fb0eb58d5d --path /opt/homebrew/bin/obu`：成功写入当前
  BitBrowser user-data-dir 的 `NativeMessagingHosts` manifest。
- `go run ./cmd/open-browser-use setup beta --browser chrome-beta --zip
  dist/chrome-extension/open-browser-use-chrome-extension-0.1.35.zip --path
  /opt/homebrew/bin/obu --no-open`：生成 keyed release extension，extension id 为
  `pnbmoicbkopffjjgfgfglopechaiemkp`。用 BitBrowser local API 启动目标 instance 并
  传入 `--load-extension=<release-dir>` 后，`info --browser
  23c443e599cd4b028b1455fb0eb58d5d --timeout 5s` 成功连到 BitBrowser host。
- 删除 `/tmp/open-browser-use/active.json` 后执行
  `go run ./cmd/open-browser-use info --browser chrome --timeout 2s`：成功扫描 socket
  并修复 `active.json`，无需重装插件。
- 分别删除 `/tmp/open-browser-use/active.json` 后执行
  `info --browser chrome`、`info --browser chrome-beta`、`info --browser
  23c443e599cd4b028b1455fb0eb58d5d`：三者均能通过 socket scan 找回对应 host，并把
  `active.json` 修复为所选 browser 的 socket。
