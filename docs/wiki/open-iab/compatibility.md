# Open IAB Compatibility

This page tracks Codio's current compatibility with the Browser Use client
surface documented under `docs/wiki/browser-client/`.

## Backend Discovery

| Surface | Status | Notes |
| --- | --- | --- |
| Native pipe directory scan | Supported | Codio listens under `/tmp/codex-browser-use/<uuid>.sock`. |
| `getInfo().type = iab` | Supported | `name=Codio`, `type=iab`, capabilities and metadata are returned. |
| Discovery file | Supported | Codio writes `/tmp/codex-browser-use/latest.json`. |
| Windows named pipe | Partial | Code path uses `\\.\pipe\codio-browser-use-<uuid>`; not yet smoke-tested. |
| `setupAtlasRuntime({ backend: "iab" })` exact path | Pending | Needs a compatibility adapter around the open Browser Use client. |

## Tab Commands

| Browser Use command | Codio backend method | Status | Notes |
| --- | --- | --- | --- |
| `browser.tabs.new` | `createTab` | Partial | Returns the single active tab for the route; optional `url` navigates it. |
| `browser.tabs.list` | `getTabs` | Supported | Lists Codio tabs for `session_id`. |
| `browser.tabs.finalize` | `finalizeTabs` | Unsupported by design | Chrome-extension-only behavior. |
| `browser.user.getTabs` | `getUserTabs` | Supported empty result | IAB has no Chrome user tab claim surface. |
| `browser.user.claimTab` | `claimUserTab` | Unsupported by design | Chrome-extension-only behavior. |

## CDP Commands

Codio supports generic CDP forwarding through:

```text
executeCdp({ target: { tabId }, method, commandParams })
```

Verified locally on 2026-04-24:

- `Page.navigate`
- `Runtime.evaluate`
- `Page.captureScreenshot`

Expected to work because they are native CDP commands, but still need targeted
smoke tests:

- `Input.dispatchMouseEvent`
- `Input.dispatchKeyEvent`
- `Input.insertText`
- `Input.synthesizeScrollGesture`

## Playwright Selector Bridge

The current Codio backend does not implement the injected Playwright selector
bridge. The open path is:

1. Use `executeCdp(Runtime.evaluate)` to inject a bridge script into the
   current webview document.
2. Keep the injected state per `tabId`.
3. Expose selector operations as Browser Use client helpers rather than new
   backend methods when possible.

This should stay separate from the minimal CDP bridge until navigation,
input, screenshots and route isolation are stable.

## Route Isolation

Current state:

- `tabId -> pageKey -> guest webContents` is implemented.
- `turnRouteKey = conversationId:turnId` is implemented.
- When a conversation has an active turn route, `createTab`、`attach`、
  `detach` 和 `executeCdp` 校验 `session_id + turn_id + tabId`。

Pending:

- timeout release for stuck turns.
- real Codex plugin tool-call validation.
- multi-window manual validation.
