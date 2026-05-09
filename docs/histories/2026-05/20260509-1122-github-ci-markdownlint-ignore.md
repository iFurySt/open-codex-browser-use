## [2026-05-09 11:22] | Task: 修复 Markdown lint 扫描范围

### Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### User Query

> 发布前后要验证，保持 GitHub CI 可用。

### Changes Overview

**Scope:** GitHub Actions CI.

**Key Actions:**

- **Markdown lint**: 在 workflow globs 中排除 `node_modules/**`，避免 lint
  第三方依赖包里的 README。

### Design Intent (Why)

CI 安装 JS 依赖后会生成 `node_modules`；仓库 Markdown lint 只应该检查本仓库
文档，不应该把供应商依赖文档纳入门禁。

### Files Modified

- `.github/workflows/ci.yml`
