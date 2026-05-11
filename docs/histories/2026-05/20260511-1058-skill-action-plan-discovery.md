# Skill action plan discovery

## 用户诉求

确认 `obu run` / action plan 编排能力是否已经体现在仓库的 `./skills` 中，避免上层使用方不知道这个入口。

## 改动

- 检查 `skills/open-browser-use/SKILL.md` 与 `skills/open-browser-use/references/sdk-and-protocol.md`，确认 action plan 和 MCP `run_action_plan` 已经存在。
- 强化 `SKILL.md` 的 Core Workflow，把 `open-browser-use run` / `obu run` 明确列为 CLI-level multi-step orchestration 入口。
- 在 MCP Usage 中补充 `run_action_plan` 和 `open-browser-use run` 使用同一 compact action plan 格式的说明。
- 将发布元数据提升到 `0.1.29`，用于发布包含 skill action plan discovery 文档增强的 patch 版本。
- 补充 `docs/releases/feature-release-notes.md` 的 `0.1.29` 用户可见发布记录。

## 受影响文件

- `skills/open-browser-use/SKILL.md`
- `cmd/open-browser-use/main.go`
- `apps/chrome-extension/manifest.json`
- `packages/open-browser-use-cli/package.json`
- `packages/open-browser-use-js/package.json`
- `packages/open-browser-use-python/pyproject.toml`
- `packages/browser-use-protocol/package.json`
- `packages/browser-client-rewrite/package.json`
- `docs/releases/feature-release-notes.md`
- `docs/histories/2026-05/20260511-1058-skill-action-plan-discovery.md`

## 验证

- `./scripts/package-skill.sh`
- `make ci`
