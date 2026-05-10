## [2026-05-10 13:24] | Task: Add README SDK badges

### Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### User Query

> 在两个 README 的中英文 tag 行里增加 npmjs 和 PyPI 的 SDK 链接，并自行选择合适样式。

### Changes Overview

**Scope:** Root README documentation.

**Key Actions:**

- **Added SDK badges**: Added npm SDK and PyPI SDK shields to the badge block in both root READMEs.
- **Linked registries**: Pointed the badges to the `open-browser-use-sdk` package pages on npmjs.com and pypi.org.

### Design Intent (Why)

The root READMEs already use shields-style badges for language, release, and DeepWiki links. Keeping the SDK registry links as shields badges makes the package entry points easy to scan without adding extra prose.

### Files Modified

- `README.md`
- `README.zh-CN.md`
