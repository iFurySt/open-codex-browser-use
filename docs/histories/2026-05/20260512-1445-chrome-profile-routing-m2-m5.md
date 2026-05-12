## [2026-05-12 14:45] | Task: Chrome profile 路由 + skill 指引（exec plan M2–M5）

### 🤖 Execution Context

- **Agent ID**: claude-code
- **Base Model**: claude-opus-4-7
- **Runtime**: Claude Code CLI

### 📥 User Query

> 好的继续做吧，我们都做好了再提 commit。

接续 M1 之后的连贯执行，按 `docs/exec-plans/active/2026-05-12-chrome-profile-selection.md` 实现剩余里程碑。

### 🛠 Changes Overview

**Scope:** `cmd/open-browser-use/`, `skills/open-browser-use/`, `docs/`

**Key Actions:**

- **新增 instanceId → profile 反查**: `resolveProfileForInstanceID(extensionID, instanceID)` 按 byte-grep 扫描每个 profile 的 `Local Extension Settings/<extension-id>/*.{log,ldb}`，命中即返回 directory + displayName。利用 chrome.storage.local 是 per-profile 这一事实，且 LevelDB log 里 UUID 字符串明文出现。
- **新增 `--profile` flag**: `socketOptions` 加 `profile`；`addSocketFlags` 同步注册。CLI 子命令、`obu mcp` 共享同一套 flag。
- **新增 socket-by-profile 选择**: `pickSocketForProfile` / `verifySocketMatchesProfile` 扫描 `socket-dir`，对每个 connectable 的 socket 调用 `getInfo`，按 selector 匹配（directory 名 / displayName / instanceId 任一，case-insensitive）。匹配失败时错误信息里列出当前已连通的 profile。
- **`obu profiles --connected`**: 探测运行中的 host，输出加 CONNECTED 列；JSON 输出附 `connected/socketPath/instanceId` 字段。
- **Skill 指引**: `skills/open-browser-use/SKILL.md` 新增 "Multi-profile handling" 章节，说明 1/N profile 流程、selector 类型、MCP 启动锁定、不跨任务记忆。
- **架构文档**: `docs/ARCHITECTURE.md` 加 multi-profile 一段，说明检测路径和 `--profile` 路由原理。

### 🧠 Design Intent (Why)

- **放弃 `active.json` v2 多 profile registry**：Chrome extension API 不暴露 profile 目录名，host 启动时无法可靠自报 profile，加上文件锁/并发写入复杂度高、收益小。
- **改走 instanceId 反查**：extension 已经把 per-profile UUID 写在 `chrome.storage.local` 并通过 `getInfo` 暴露（`metadata.extensionInstanceId`）；CLI 侧 grep 每个 profile 的 LevelDB log 就能稳定反查 directory。零 host 改动、零 extension 改动、零新增权限。
- **selector 优先目录名**：directory 在用户改 displayName 后仍稳定，但允许 displayName / instanceId 也匹配，符合自然语言"用工作 profile / Eva"。
- **错误信息列出已连通 profile**：避免用户瞎试，"哪两个能用"显式可见。
- **MCP 启动锁定 profile**：和 skill 的"一任务一 profile"语义一致，避免一次会话里跳来跳去。

### 📁 Files Modified

- `cmd/open-browser-use/main.go`
- `cmd/open-browser-use/main_test.go`
- `skills/open-browser-use/SKILL.md`
- `docs/ARCHITECTURE.md`
- `docs/exec-plans/active/2026-05-12-chrome-profile-selection.md`

### ✅ Verification

- `go test ./...` 全部通过。
- 新增单测：`resolveProfileForInstanceID` 命中 / miss / 空参数；`profileSelectorMatches` 各 selector 类型（含 case-insensitive）；`connectedProfileFromInfo` 端到端解析。
- `node --test apps/chrome-extension/*.test.mjs` 通过。
- `scripts/check-docs.sh` + `scripts/check-repo-hygiene.sh` 通过。
- 实机 (Default/Eva + Profile 3/cookiy.com 同时在线，beta v0.1.29):
  - `obu profiles --connected` JSON 两条都 `connected: true`，instanceId 各自对应。
  - `obu info`（无 --profile）→ active socket（Profile 3）。
  - `obu info --profile Default` 与 `--profile Eva` 都返回 Default 的 instance `c68f12f2…`。
  - `obu info --profile "Profile 3"` 与 `--profile cookiy.com` 都返回 Profile 3 的 instance `ceb59c8d…`。
  - `obu user-tabs --profile Default` 返回 1 个 tab；`--profile "Profile 3"` 返回 9 个 tab，证明路由真的到了不同浏览器实例。
  - `obu info --profile "Profile 999"` 退出码 1，错误信息列出 `Default (Eva), Profile 3 (cookiy.com)`。

### ⏭ Follow-ups

- SDK profile 选项（JS/Python/Go 构造函数 + 高层 client 支持），等 SDK 真有用户使用 multi-profile 时再补。
- `obu info` 默认显示当前连接的 profile（不带 --profile 时），让用户单命令就能确认现在在哪个 profile。
- 若以后出现多个 Chrome profile 同时高频被多个 host 服务的场景，再考虑升级 `active.json` 为 per-profile registry，让 CLI 不必每次都扫 socket。
