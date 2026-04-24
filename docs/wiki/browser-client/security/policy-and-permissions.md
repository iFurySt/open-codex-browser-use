# Policy And Permissions

## Capability Checks

Commands can be blocked before dispatch when the selected backend does not
advertise the required capability.

Observed checks:

- Download or media-download commands require download capability.
- File chooser commands require file-upload capability.

The fixed Chrome fallback info marks `fileUploads: false`.

## Site Policy

For non-local `http` and `https` URLs, the client checks:

```text
https://chatgpt.com/backend-api/aura/site_status
```

Observed behavior:

- The cache key is the hostname with leading `www.` removed.
- The cache TTL is 1440 minutes.
- `feature_status.agent === true` means the site is blocked for agent use.

## User Origin Permission

For most origin-bearing commands, the client prompts through:

```text
globalThis.nodeRepl.createElicitation
```

Observed prompt metadata:

```text
connector_id: browser-use
persist: always
```

Local origins bypass the prompt:

- `localhost`
- `*.localhost`
- `127.0.0.1`
- `::1`

## No-Origin Commands

Some commands are explicitly treated as not needing an origin:

- `browser_user_open_tabs`
- `close_tab`
- `create_tab`
- `list_tabs`
- `name_session`
- `playwright_wait_for_timeout`
- `selected_tab`

`navigate_tab_url` is checked against the target URL. Most other tab-scoped
commands check the current tab URL before dispatch.

