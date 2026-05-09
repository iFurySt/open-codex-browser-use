## [2026-05-09 11:24] | Task: 排除嵌套 node_modules Markdown

### Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### User Query

> 发布前后要验证，保持 GitHub CI 可用。

### Changes Overview

**Scope:** GitHub Actions CI.

**Key Actions:**

- **Markdown lint**: 将忽略规则从 `node_modules/**` 改为
  `**/node_modules/**`，覆盖 pnpm 在 workspace package 下创建的嵌套链接目录。

### Design Intent (Why)

pnpm 会在 package 目录下暴露 `node_modules` 链接；Markdown lint 需要排除所有
层级的依赖目录。

### Files Modified

- `.github/workflows/ci.yml`
