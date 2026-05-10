## [2026-05-10 12:23] | Task: 补强 skill SDK 指南并发版

> 确认 `skills/` 中 JS/Python SDK 部分是否存在且正确；如有需要同步更新并发版。

**Scope:** Open Browser Use skill SDK reference and release version metadata.

### Changes

- **[Skill]**: Added a JavaScript high-level `connectOpenBrowserUse` example
  using the published `open-browser-use-sdk` package.
- **[Skill]**: Kept the low-level `OpenBrowserUseClient` example and renamed
  the variable to `client` so it is not confused with the high-level browser
  helper.
- **[Release]**: Bumped release metadata from `0.1.23` to `0.1.24` for the CLI,
  Chrome extension, JS SDK, Python SDK, protocol package, and browser-client
  reference package.
- **[Docs]**: Added the `0.1.24` release note.

### Why

The SDK packages are now published as `open-browser-use-sdk` on npm and PyPI.
The skill needs copyable examples that match the public package names and show
both the high-level and low-level JavaScript SDK paths.

### Verification

- `./scripts/package-skill.sh`
- `./scripts/check-docs.sh`
- Search confirmed no stale `@open-browser-use/sdk-js` references remain under
  `skills/`.

### Files

- `skills/open-browser-use/references/sdk-and-protocol.md`
- `docs/releases/feature-release-notes.md`
- Version metadata files for `0.1.24`
