# Codio Plugin Integration

Codio needs a Codex plugin so a Codex turn can route Browser Use automation to
the Electron IAB backend.

## Current Repository Skeleton

The open plugin skeleton lives at:

```text
plugins/codio-browser-use/
  .codex-plugin/plugin.json
  skills/browser/SKILL.md
  scripts/discover-codio-iab.mjs
```

The manifest identifies the plugin as `codio-browser-use`. The skill documents
that Codio's native pipe can be discovered through:

```text
/tmp/codex-browser-use/latest.json
```

The helper script validates the discovery file and prints the current
`socketPath`:

```sh
node plugins/codio-browser-use/scripts/discover-codio-iab.mjs
```

## Intended Runtime Flow

```text
Codex app-server
  loads codio-browser-use plugin
    |
    v
Browser Use client
  reads /tmp/codex-browser-use/latest.json
    |
    v
Codio Electron main process
  IAB native pipe backend
    |
    v
Electron webview guest webContents
```

## Pending Work

- Define the local development install path for Codex app-server plugin
  discovery.
- Confirm app-server can load this plugin skeleton without relying on private
  Codex.app packaging.
- Pass `session_id = threadId` and `turn_id = turnId` from app-server tool
  calls into Browser Use requests.
- Validate that a real Codex turn invoking Browser Use reaches Codio's active
  turn route.
