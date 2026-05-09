## [2026-05-09 13:51] | Task: remove markdownlint

### Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### User Query

> 不再需要 markdownlint，移除相关配置和检查。

### Changes Overview

**Scope:** repository CI and hygiene checks.

**Key Actions:**

- **[CI]**: Removed the GitHub Actions Markdown lint step from the main CI workflow.
- **[Config]**: Deleted the repository `.markdownlint.json` configuration file.
- **[Hygiene]**: Removed `.markdownlint.json` from required repository hygiene files.

### Design Intent

Markdown lint is no longer part of the repository quality gate, so keeping the
config file or CI action would create a stale tool dependency and confusing
local validation expectations.

### Files Modified

- `.github/workflows/ci.yml`
- `.markdownlint.json`
- `scripts/check-repo-hygiene.sh`
- `docs/histories/2026-05/20260509-1351-remove-markdownlint.md`
