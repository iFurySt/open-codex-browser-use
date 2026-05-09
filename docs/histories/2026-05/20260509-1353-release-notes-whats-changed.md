## [2026-05-09 13:53] | Task: add GitHub generated release notes

### Execution Context

- **Agent ID**: Codex
- **Base Model**: GPT-5
- **Runtime**: Local CLI workspace

### User Query

> 对照 `open-codex-computer-use` 看它怎么生成 GitHub Release 的 `What's Changed`，当前仓库也需要同样能力。

### Changes Overview

**Scope:** GitHub Release workflow and release documentation.

**Key Actions:**

- **[Workflow]**: Replaced the Release creation action with a `gh release create --generate-notes` path that matches `open-codex-computer-use`, while preserving clobber uploads for existing releases.
- **[Docs]**: Documented the automatic `What's Changed` behavior and the required post-tag release body check.
- **[Release Body]**: Backfilled the existing `v0.1.6` GitHub Release body with a concise `What's Changed` section while keeping the full changelog link.

### Design Intent

GitHub's generated release notes are the existing cross-repo convention for producing `What's Changed` without maintaining another changelog generator. The workflow should create clear user-facing notes for new tags and retain a manual check rule for direct-commit releases where GitHub may only generate a full changelog link.

### Files Modified

- `.github/workflows/release.yml`
- `docs/CICD.md`
- `docs/CHROME_WEB_STORE_RELEASE.md`
- `docs/releases/README.md`
