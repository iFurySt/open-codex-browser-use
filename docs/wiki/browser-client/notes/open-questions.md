# Open Questions

This page tracks questions that need more evidence before being treated as
confirmed behavior.

## Dynamic Socket Lifecycle

`/tmp/codex-browser-use/<uuid>.sock` is confirmed as a discovery candidate, and
the observed IAB socket is owned by the Codex app main process. The remaining
question is how many sockets can coexist across multiple Codex windows,
conversations, app channels, or stale process states.

Useful next checks:

- Open multiple Codex windows and compare socket count.
- Start browser-use in multiple conversations and compare `getInfo()` metadata.
- Observe socket cleanup after closing windows or ending turns.

## Chrome Process Lifecycle

The client does not start Chrome. It connects to an existing backend. The
remaining question is which component starts or supervises the Chrome extension
native host in each installation mode.

Useful next checks:

- Inspect native messaging host manifests.
- Trace Chrome extension background service worker behavior.
- Compare process trees before and after first Browser Use command.

## Chrome Extension Backend Implementation Location

The client contains a complete Chrome-extension backend contract, but the
current packaged Browser Use plugin only includes the client script. On the
observed 2026-04-24 installation, no OpenAI/Codex Chrome native messaging host
manifest or visible `chrome-internal` plugin payload was present.

Useful next checks:

- Compare a Dev/InternalAlpha/Nightly/Owl Codex build against this packaged
  build.
- Inspect Chrome extension IDs and native messaging host manifests after
  installing any official Browser Use Chrome extension.
- Start the Chrome backend and capture which process owns
  `/tmp/codex-browser-use.sock`.
- Once the backend source or bundle is available, confirm whether Browser Use
  tab IDs are raw Chrome tab IDs or a backend-local mapping.

## Additional Hidden Command Areas

The bundle contains strings or schemas for clipboard, Google Workspace export,
media download, and tab content commands. More analysis is needed to decide
whether these are dead code, shared library residue, backend-only support, or
commands gated by a registry shape not captured by the first extraction.

## IAB Multi-Page Semantics

The observed IAB route model exposes one browser sidebar page per
`(windowId, conversationId)` route. The app still keeps tab maps such as
`tabsById` and `selectedTabIdsByRouteKey`, so future work should verify whether
any hidden path can attach more than one page to the same route.
