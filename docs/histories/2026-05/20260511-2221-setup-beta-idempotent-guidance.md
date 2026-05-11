# Setup Beta Idempotent Guidance

> 用户反馈 `obu setup beta` 在浏览器插件已经安装并连接后，仍重复打开 Finder 和
> Chrome 扩展页；同时希望 setup 自动更新已安装的 agent skill，并在没有 skills
> 时给出 Codex / Claude Code 安装命令。

## Changes

- **[CLI]**: Changed `setup beta` to detect browser extension status before
  opening install guidance, so it only opens `chrome://extensions/` and
  Finder/file manager when the extension is missing or older than the
  CLI-expected version.
- **[CLI]**: Made the Chrome Web Store `setup` path follow the same conditional
  open rule, opening the store page only when install or upgrade work remains.
- **[CLI]**: Added best-effort `npx skills update open-browser-use -g -y` for
  environments where `npx skills` is already available; when skills are not
  detected, setup prints Codex and Claude Code skill install commands.
- **[Output]**: Shortened setup next-step guidance to a single sentence.
- **[Tests]**: Added coverage for the manual setup open/skip decision.
- **[Docs]**: Synced architecture, Chrome Web Store release notes, and skill
  installation reference with the new idempotent setup behavior.

## Motivation

Setup should be safe to rerun. Reopening Finder and the Chrome extensions page
after the extension is already current makes a successful install look broken,
so the install UI should only appear when the user has real browser-extension
work left to do.

## Files

- `cmd/open-browser-use/main.go`
- `cmd/open-browser-use/main_test.go`
- `docs/ARCHITECTURE.md`
- `docs/CHROME_WEB_STORE_RELEASE.md`
- `skills/open-browser-use/references/installation.md`
