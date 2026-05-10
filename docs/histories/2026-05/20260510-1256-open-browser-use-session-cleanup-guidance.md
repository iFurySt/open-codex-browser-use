## [2026-05-10 12:56] | Task: Tighten OBU session and cleanup guidance

### Execution Context

- **Agent ID**: Codex
- **Base Model**: GPT-5.5
- **Runtime**: codex-tui

### User Query

> 基于官方 Chrome skill 的做法，更新 `./skills`，指导 AI Agent 使用唯一 `session-id`，并收紧 Open Browser Use 的 cleanup 规则。

### Changes Overview

**Scope:** `skills/open-browser-use`, `docs/histories`

**Key Actions:**

- **[Skill]**: 要求 Agent 为每个任务或会话选择唯一 Open Browser Use session id，并在 CLI、MCP 和 SDK 调用中贯穿使用。
- **[Skill]**: 明确 `obu-cli` 只是手工 fallback，不应作为 Agent 工作流默认 session，避免复用无关任务遗留 tab group。
- **[Cleanup]**: 对齐官方 Chrome skill 的 tab cleanup 语义：默认 omit tabs，`deliverable` 只给用户可见产物页，`handoff` 只给未完成且需要用户或后续 turn 继续的任务页。
- **[Examples]**: 更新 CLI、MCP、JS SDK 和 Python SDK 示例，展示显式 `--session-id` / `sessionId` / `session_id` 用法。

### Design Intent (Why)

官方 Chrome plugin 从 Codex turn metadata 读取 `session_id` / `turn_id`，天然避免跨 Codex 会话复用同一个 Chrome tab group。Open Browser Use 当前 CLI 仍保留 `obu-cli` fallback，所以 skill 需要指导 Agent 显式传入任务唯一 session id，并更严格地区分 cleanup、deliverable 和 handoff，减少跨任务 group 残留。

### Files Modified

- `skills/open-browser-use/SKILL.md`
- `skills/open-browser-use/references/installation.md`
- `skills/open-browser-use/references/sdk-and-protocol.md`
- `skills/open-browser-use/references/troubleshooting.md`
- `docs/histories/2026-05/20260510-1256-open-browser-use-session-cleanup-guidance.md`
