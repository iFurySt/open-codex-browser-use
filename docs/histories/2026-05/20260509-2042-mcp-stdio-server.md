## [2026-05-09 20:42] | Task: Add stdio MCP server

### 🤖 Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### 📥 User Query

> Add MCP support in stdio form, for example `obu mcp`; verify milestones,
> commit in small steps, test through Codex config when complete, then release.

### 🛠 Changes Overview

**Scope:** `cmd/open-browser-use`, CLI docs, Open Browser Use skill reference.

**Key Actions:**

- **MCP server**: Added `open-browser-use mcp` / `obu mcp`, a stdio MCP server
  that speaks newline-delimited JSON-RPC and supports `initialize`, `ping`,
  `tools/list`, and `tools/call`.
- **Tool bridge**: Exposed browser tools for session info, user tabs, history,
  tab opening/claiming/navigation, CDP, file chooser helpers, action plans,
  finalization, and unrestricted backend `call`.
- **Coverage**: Added Go tests for MCP initialization/tool listing and a
  `tools/call` request that forwards to a fake Open Browser Use Unix socket.
- **Docs**: Documented `obu mcp` in architecture, CLI README, top-level
  READMEs, and the agent-facing skill references.

### 🧠 Design Intent (Why)

MCP gives agent runtimes a direct local-tool integration path without requiring
shell command assembly or SDK code in every workflow. The implementation reuses
the existing CLI socket discovery and action runner so MCP, CLI, and SDK
behavior stay aligned.

### 📁 Files Modified

- `cmd/open-browser-use/main.go`
- `cmd/open-browser-use/mcp.go`
- `cmd/open-browser-use/mcp_test.go`
- `docs/ARCHITECTURE.md`
- `packages/open-browser-use-cli/README.md`
- `README.md`
- `README.zh-CN.md`
- `skills/open-browser-use/SKILL.md`
- `skills/open-browser-use/references/sdk-and-protocol.md`
- `docs/histories/2026-05/20260509-2042-mcp-stdio-server.md`
