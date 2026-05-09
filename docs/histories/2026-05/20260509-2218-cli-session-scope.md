## [2026-05-09 22:18] | Task: Fix CLI session cleanup scope

### Execution Context

- **Agent ID**: Codex
- **Base Model**: GPT-5.5
- **Runtime**: codex-tui

### User Query

> 排查一次 HN article scan 的 Open Browser Use 会话为什么产生两组 Chrome tab group，且结束时只关闭其中一组。

### Changes Overview

**Scope:** `cmd/open-browser-use`, CLI docs, skill docs, architecture docs

**Key Actions:**

- **[CLI]**: 让普通 CLI 子命令和 `open-browser-use run` 默认使用同一个 `obu-cli` browser session，避免混用时产生两个默认 cleanup scope。
- **[CLI]**: 增加 `--session-id` socket flag，保留显式隔离 tab group 和 cleanup scope 的能力；MCP 默认使用独立 `obu-mcp` session。
- **[Tests]**: 增加 session id 默认值和自定义 session id 覆盖测试。
- **[CI]**: `scripts/ci.sh` 支持 `PYTHON`、`python` 或 `python3`，避免本地只有 `python3` 时仓库级验证失败。
- **[Docs]**: 更新 CLI README、skill 和架构说明，明确 session/finalize 关系。

### Design Intent (Why)

之前 `run` 硬编码使用 `obu-cli-run`，普通 CLI 子命令默认使用 `obu-cli`。Agent 混用两种调用方式时会自然产生两组 Chrome tab group，而最后执行普通 `finalize-tabs` 只清理 `obu-cli`，留下 `obu-cli-run`。把默认 CLI session 收敛到一个 ID 可以让常见 agent 工作流按直觉清理；需要隔离时再显式传 `--session-id`。

### Files Modified

- `cmd/open-browser-use/main.go`
- `cmd/open-browser-use/mcp.go`
- `cmd/open-browser-use/main_test.go`
- `packages/open-browser-use-cli/README.md`
- `skills/open-browser-use/SKILL.md`
- `docs/ARCHITECTURE.md`
- `scripts/ci.sh`
