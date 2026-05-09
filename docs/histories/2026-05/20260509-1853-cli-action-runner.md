## [2026-05-09 18:53] | Task: 增加 CLI action 编排入口

### 🤖 Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### 📥 User Query

> 参考 `browser-harness -c` 的形式，给 CLI 暴露一个可以一次执行多个 subcommand action 的入口，用于编排；它应类似 JS/Python SDK 的高层编排能力，但不是通用编程语言。

### 🛠 Changes Overview

**Scope:** Go CLI, CLI docs, Open Browser Use skill

**Key Actions:**

- **[CLI]**: 新增 `open-browser-use run -c/--file`，执行 line-oriented action plan。
- **[Runner]**: 支持共享 session/turn、默认 tab 传递，以及 `wait-load`、`page-info` 等适合动作编排的 tab-scoped action。
- **[Tests/Docs]**: 增加 fake socket Go 测试，并同步根 README、CLI 包 README、架构和 skill 指南。
- **[Release]**: 将 Open Browser Use 版本元数据提升到 `0.1.19`，并补充 feature release note。

### 🧠 Design Intent (Why)

让 shell、CI 和轻量 agent runtime 可以用 CLI 动作脚本完成多步浏览器流程，不需要引入 JS/Python runtime，也不暴露任意代码执行语义。

### 📁 Files Modified

- `cmd/open-browser-use/main.go`
- `cmd/open-browser-use/main_test.go`
- `README.md`
- `packages/open-browser-use-cli/README.md`
- `docs/ARCHITECTURE.md`
- `docs/releases/feature-release-notes.md`
- `skills/open-browser-use/SKILL.md`
- `skills/open-browser-use/references/sdk-and-protocol.md`
- version metadata under `apps/`, `cmd/`, and `packages/`
