## [2026-05-11 16:47] | Task: remove PR supply-chain workflow

### 🤖 Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### 📥 User Query

> 评估当前供应链安全 CI 是否有用；如果没用就移除，因为其他人提 PR 时该 CI 会失败。

### 🛠 Changes Overview

**Scope:** GitHub Actions, repo hygiene, docs

**Key Actions:**

- **[CI]**: 删除独立的 `supply-chain-security.yml` PR workflow 和仅供该 workflow 使用的 Dependency Review 配置。
- **[Repo Hygiene]**: 从仓库基础卫生检查中移除已删除供应链 workflow 和配置文件的必备项。
- **[Docs]**: 同步 CI/CD 与供应链安全文档，明确 PR 供应链门禁不再启用，release 阶段继续保留 SBOM 和 provenance。

### 🧠 Design Intent (Why)

最近的 GitHub Actions 失败显示 Dependency Review 在当前仓库设置下直接报不支持，属于仓库侧安全能力缺失导致的不可用门禁；OSV 全仓扫描也不是增量 PR 检查，容易把既有依赖基线问题变成 PR 噪音。移除独立 PR 供应链 workflow 可以避免外部贡献被无效门禁阻塞，同时保留 release 产物的可追溯能力。

### 📁 Files Modified

- `.github/workflows/supply-chain-security.yml`
- `.github/dependency-review-config.yml`
- `scripts/check-repo-hygiene.sh`
- `docs/CICD.md`
- `docs/SUPPLY_CHAIN_SECURITY.md`
