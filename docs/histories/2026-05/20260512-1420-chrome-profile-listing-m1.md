## [2026-05-12 14:20] | Task: 实现 Chrome profile 列表能力（exec plan M1）

### 🤖 Execution Context

- **Agent ID**: claude-code
- **Base Model**: claude-opus-4-7
- **Runtime**: Claude Code CLI

### 📥 User Query

> 我有两个 profile 了，可以随时测试，你先改实现然后做回归吧。

（背景：先前一轮已经把 Chrome profile 选择能力的需求落到
`docs/exec-plans/active/2026-05-12-chrome-profile-selection.md`，里面拆出 M1–M6 六个里程碑。）

### 🛠 Changes Overview

**Scope:** `cmd/open-browser-use/`

**Key Actions:**

- **新增 profile 列表能力**: `listInstalledChromeProfiles()` 统一返回 `directory / displayName / extensionId / version / source` 字段，按 `Default` → `Profile N` 数字序 → 其他字典序排序。
- **新增 unpacked 检测**: `detectExtensionInProfile` 同时扫描 CRX 风格的 `Extensions/<id>/<ver>/manifest.json` 和 unpacked 风格的 `Secure Preferences.extensions.settings.<id>.path → manifest.json`；同 profile 多种安装方式取版本较高者。
- **新增 CLI 子命令**: `open-browser-use profiles`（含 `--json`），human 输出对齐成 `DIRECTORY / DISPLAY NAME / VERSION` 表格。
- **空 Chrome 数据目录兜底**: Chrome 没装时 `listInstalledChromeProfiles()` 返回 `[]` 而不是错误，CLI 打印友好提示。

### 🧠 Design Intent (Why)

- profile 选择是 Chrome route 的下一个用户面能力；必须先有"原子发现"，skill 和 `--profile` 才有意义。
- 实机回归才发现 beta 用户的扩展不会写到 `Extensions/<id>/<ver>`，而是落在 `<Profile>/UnpackedExtensions/...` 并由 `Secure Preferences` 登记，所以检测必须双路径。
- profile ID 选 directory name 而不是 displayName，避免用户改名导致 ID 漂移；displayName 仅做辅助显示。

### 📁 Files Modified

- `cmd/open-browser-use/main.go`
- `cmd/open-browser-use/main_test.go`
- `docs/exec-plans/active/2026-05-12-chrome-profile-selection.md`

### ✅ Verification

- `go test ./...` 全部通过。
- 新加单测：单 profile、多 profile 排序、跳过未装插件的 profile、缺失 `Local State`、损坏 `Local State`、unpacked 检测、CRX vs unpacked 取版本较高者、`profiles` CLI JSON / human / 空表、`chromeProfileSortKey` 排序。
- 实机：`obu profiles` 在 5 profile 机器上正确识别 `Default` (Eva) 和 `Profile 3` (cookiy.com) 的 0.1.29 unpacked beta；`--json` 输出结构稳定。
- `scripts/check-docs.sh` + `scripts/check-repo-hygiene.sh` 通过。

### ⏭ Follow-ups

- M2 把 `active.json` 升级到 v2 的 per-profile registry，让 host 端能按 profile 路由。
- M3 让 MV3 extension 在握手时上报自身 profile 标识，host 写入 registry。
- M4 在 CLI / SDK / MCP 入口接 `--profile`，复用 M2 registry 做路由。
