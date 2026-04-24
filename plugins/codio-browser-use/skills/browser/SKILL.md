# Codio Browser Use

Use this skill when a Codex turn should control the browser embedded in the
Codio Electron app.

## Backend

Codio exposes its Browser Use IAB backend through:

```text
/tmp/codex-browser-use/latest.json
```

Read that file to get the current `socketPath`. The socket speaks Browser Use
length-prefixed JSON-RPC and returns `getInfo().name = "Codio"` and
`getInfo().type = "iab"`.

## Current Status

This plugin skeleton records the intended local development integration path.
It does not yet provide a packaged Codex app-server install flow. Until that is
implemented, use `scripts/smoke-browser-use-rpc.mjs` from the repository root
to validate the native pipe directly.
