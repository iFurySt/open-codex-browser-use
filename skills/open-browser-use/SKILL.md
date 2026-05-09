---
name: open-browser-use
description: Platform-neutral guidance for using Open Browser Use, the open-source Chrome automation stack for AI agents. Use when an agent needs to install, verify, troubleshoot, or operate Open Browser Use through its browser extension, native CLI, JavaScript SDK, Python SDK, or Browser Use style JSON-RPC methods; use for tasks involving real Chrome tabs, user tab claiming, CDP commands, downloads, file choosers, clipboard helpers, or session cleanup.
---

# Open Browser Use

## Overview

Open Browser Use connects an MV3 Chrome extension, a local native messaging host, a CLI, SDKs, and an optional stdio MCP server so agents can automate a real Chrome profile. It is not Codex.app-specific; adapt the commands, MCP config, and SDK examples to the agent runtime you are operating in.

## Core Workflow

1. Check setup with `open-browser-use ping` or `obu ping`. If it fails because setup is missing, read [references/installation.md](references/installation.md).
2. Name the current browser task group before opening or claiming tabs. Use a short task label followed by ` - OBU`; if no better task label is available, use `Task - OBU`.
3. Use the CLI for simple inspection or one-shot actions: `info`, `tabs`, `user-tabs`, `history`, `open-tab`, `navigate`, `cdp`, and `call`.
4. If the surrounding agent runtime supports local MCP servers, configure `obu mcp` and call the exposed browser tools directly. Read [references/sdk-and-protocol.md](references/sdk-and-protocol.md).
5. Use the JavaScript or Python SDK for multi-step workflows, event subscriptions, or when the surrounding agent runtime already runs code. Read [references/sdk-and-protocol.md](references/sdk-and-protocol.md).
6. Before ending browser work, release or keep session tabs with `open-browser-use finalize-tabs --keep '<json-array>'`, the MCP `finalize_tabs` tool, or the SDK `finalizeTabs` / `finalize_tabs` method.
7. If communication fails after setup, read [references/troubleshooting.md](references/troubleshooting.md).

## Operating Rules

- Treat the browser as the user's real Chrome profile. Do not inspect cookies, passwords, session stores, or unrelated browser data.
- Ask the user before installing the extension, opening Chrome for them, enabling extension permissions, uploading local files, reading/writing clipboard data, submitting forms, purchasing, deleting, sending, or making other externally visible changes.
- Do not assume Codex.app helpers, Node REPL globals, or a bundled plugin UI are available. Use the installed `open-browser-use` / `obu` CLI or the published SDKs.
- Do not guess tab ids. List tabs first, then use ids returned by `tabs`, `user-tabs`, `open-tab`, or SDK calls.
- Prefer `claim-tab` / `claimUserTab` for existing user tabs. Claiming should be based on the current `user-tabs` result and visible evidence such as URL, title, recency, or group.
- Use `--socket` only when the user or runtime provides an explicit socket. Otherwise let the CLI and SDKs discover the active socket registry.
- Use `call --method <method> --params '<json>'` only when no safer convenience command or SDK wrapper exists.

## Common CLI Actions

```sh
open-browser-use ping
open-browser-use info
open-browser-use name-session --name "Task - OBU"
open-browser-use tabs
open-browser-use user-tabs
open-browser-use history --query "example" --limit 20
open-browser-use open-tab --url https://example.com
open-browser-use navigate --tab-id <tab-id> --url https://example.com
open-browser-use cdp --tab-id <tab-id> --method Runtime.evaluate --params '{"expression":"document.title"}'
open-browser-use finalize-tabs --keep '[]'
```

For CLI-level orchestration without a JS/Python runtime, use a line-oriented
action plan:

```sh
open-browser-use run -c '
name-session "Docs scan - OBU"
open-tab https://docs.browser-use.com
wait-load domcontentloaded
page-info
finalize-tabs []
'
```

Each action line shares one session/turn. `open-tab` and `claim-tab` set the
default tab for later tab-scoped actions such as `wait-load`, `page-info`,
`navigate`, `cdp`, `move-mouse`, and `wait-file-chooser`.

Use `obu` as the short alias when available.

## MCP Usage

For runtimes that can launch local MCP servers over stdio, use:

```toml
[mcp_servers.open_browser_use]
command = "obu"
args = ["mcp"]
```

The MCP server exposes tools including `user_tabs`, `open_tab`, `claim_tab`,
`navigate`, `wait_load`, `page_info`, `cdp`, `history`, `run_action_plan`,
`finalize_tabs`, and unrestricted `call`.

## Tab Lifecycle

- Session tabs are tabs Open Browser Use has created or claimed for the current agent workflow.
- Task session groups should be named from the task, using the pattern `<short task> - OBU`. Use `Task - OBU` as the fallback name.
- Keep no tabs by default: `open-browser-use finalize-tabs --keep '[]'`.
- Keep a tab only when the tab itself is the deliverable or the user needs to continue from that live state. Use a keep item such as `{"tabId":123,"status":"handoff"}` or `{"tabId":123,"status":"deliverable"}`.
- Handoff tabs stay in the task session group. Deliverable tabs move to the shared `🫪 Open Browser Use` tab group.
- Run finalization as the last Open Browser Use browser action for the turn.

## File Choosers, Downloads, And Clipboard

- File uploads use the intercepted file chooser flow: start waiting, trigger the chooser in the page, then set absolute local paths with `set-file-chooser-files` or the SDK equivalent.
- Downloads can be observed with SDK notification handlers or Browser Use methods such as `waitForDownload` and `downloadPath`.
- Clipboard helpers operate through the current controlled tab and should be treated as sensitive user actions.

## References

- [references/installation.md](references/installation.md): one-time CLI and browser extension setup, including cases where user cooperation is required.
- [references/sdk-and-protocol.md](references/sdk-and-protocol.md): JavaScript, Python, socket, and JSON-RPC usage details.
- [references/troubleshooting.md](references/troubleshooting.md): connection failures, stale sockets, extension/native host checks, and permission issues.
