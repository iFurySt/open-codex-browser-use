## [2026-05-14 22:24] | Task: 多浏览器 browser/profile 选择

用户诉求：支持 Chrome Stable、Chrome Beta、BitBrowser 同时安装 Open Browser
Use 的场景。任务开始前如果用户没有指定，要让 agent 询问使用哪个
browser/profile，后续整轮固定使用该目标。同时复查 `active.json`：删除或失效
时不应要求重装插件，CLI 应该能更优雅地恢复。

主要改动：

- CLI discovery 从单 Chrome root 扩展为 browser-aware target discovery：
  Chrome Stable、Chrome Beta、BitBrowser `BrowserCache/<instance>` 都会被扫描。
- `profiles` 输出新增 `browser`、`browserName`、`browserInstance`、`target`
  字段；human 输出新增 `BROWSER` 列。
- 所有 socket-backed CLI 命令新增 `--browser` selector，并继续支持
  `--profile`。显式 selector 会扫描所有连通 socket，通过
  `extensionInstanceId` 反查 browser/profile 后路由到匹配 socket。
- `install-manifest` / `setup` 新增 `--browser`，可给 Chrome Beta 或具体
  BitBrowser instance 写入 native messaging host manifest。
- `setup --browser <bitbrowser>` 明确拒绝 Chrome External Extensions 路径，并提示
  使用 `install-manifest --browser <instance>`，避免先写入 native manifest 后再因
  BitBrowser 不支持该安装路径而失败。
- 保留并强化 `active.json` 思路：无 selector 时仍走 active 快速路径；缺失或
  stale 时扫描 socket 并修复；显式 selector 命中后也修复 active record。
- 更新 skill、installation reference 和 architecture 文档，明确多 browser /
  多 profile 的 agent 行为。

验证：

- `go test ./cmd/open-browser-use/...`
- `go test ./...`
- `pnpm -F open-browser-use-sdk test`
- `git diff --check`
- 实机：`profiles --connected --json` 同时输出 `chrome:Default`、
  `chrome-beta:Default`、
  `bitbrowser:23c443e599cd4b028b1455fb0eb58d5d:Default`，三者均为
  `connected: true`。
- 实机：`info --browser chrome --timeout 5s`、
  `info --browser chrome-beta --timeout 5s`、
  `info --browser 23c443e599cd4b028b1455fb0eb58d5d --timeout 5s` 均能连到各自
  host，且返回不同 `extensionInstanceId`。
- 实机：分别删除 `/tmp/open-browser-use/active.json` 后执行上述三个 selector，
  均能扫描 socket 并把 `active.json` 修复为对应 browser 的 socket。

影响文件：

- `cmd/open-browser-use/main.go`
- `cmd/open-browser-use/main_test.go`
- `docs/ARCHITECTURE.md`
- `docs/exec-plans/active/2026-05-14-multi-browser-selection.md`
- `skills/open-browser-use/SKILL.md`
- `skills/open-browser-use/references/installation.md`
