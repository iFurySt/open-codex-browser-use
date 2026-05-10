## [2026-05-10 13:09] | Task: Document skill update command

> README 里已经有 `npx skills add` 安装方式，但缺少已安装 skill 的更新/升级用法，补充一下。

**Scope:** English and Chinese README skill installation documentation.

## Changes

- **[Docs]**: Added `npx skills update open-browser-use -g -y` for updating an existing global install.
- **[Docs]**: Documented `npx skills upgrade` as the update alias.
- **[Docs]**: Clarified that the global update command also covers the Codex install created by the README's `npx skills add ... -g -a codex --copy` example.
- **[Docs]**: Mirrored the same guidance in `README.zh-CN.md`.

## Rationale

Users who already installed the Open Browser Use skill need a direct upgrade path
without reinstalling from scratch. Keeping the command beside the install example
makes the README cover both first-time setup and later updates.

## Files

- `README.md`
- `README.zh-CN.md`
- `docs/histories/2026-05/20260510-1309-readme-skill-update-command.md`
