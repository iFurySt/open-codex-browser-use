## [2026-05-09 11:15] | Task: Homebrew tap 发布

### Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### User Query

> 将 open-browser-use/obu 发布到 Homebrew，并让后续通过 GitHub tag 触发更新 tap。

### Changes Overview

**Scope:** Homebrew formula generation and release CI/CD.

**Key Actions:**

- **Formula renderer**: 新增 `scripts/render-homebrew-formula.sh`，根据版本和
  tag archive sha256 生成 `open-browser-use.rb`。
- **Tap workflow**: 新增 `homebrew-publish.yml`，tag `v*` 推送后更新
  `iFurySt/homebrew-open-browser-use` tap。
- **npm idempotency**: `npm-publish.yml` 在目标版本已存在时跳过发布，支持当前
  `v0.1.4` 已手动发布 npm 后继续打 tag。

### Design Intent (Why)

Homebrew 从 GitHub tag 源码构建 Go CLI，保持 tap formula 小而可审计；npm
workflow 对已存在版本幂等，避免手动首发和 tag 首发之间互相阻塞。

### Files Modified

- `.github/workflows/homebrew-publish.yml`
- `.github/workflows/npm-publish.yml`
- `scripts/render-homebrew-formula.sh`
- `docs/CICD.md`
