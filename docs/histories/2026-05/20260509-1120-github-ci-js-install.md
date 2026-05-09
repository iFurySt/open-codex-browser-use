## [2026-05-09 11:20] | Task: 修复 GitHub CI JS 依赖安装

### Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### User Query

> 发布前后要验证，保持 GitHub CI 可用。

### Changes Overview

**Scope:** GitHub Actions CI.

**Key Actions:**

- **Dependency install**: 在运行 `scripts/ci.sh` 前执行
  `pnpm install --frozen-lockfile`，确保 TypeScript 和 `@types/node` 等
  workspace devDependencies 在 GitHub runner 上可用。

### Design Intent (Why)

本地 CI 能通过是因为已有 `node_modules`；远端 runner 是干净环境，必须显式安装
JS workspace 依赖后再运行 pnpm 测试。

### Files Modified

- `.github/workflows/ci.yml`
