# Backend Discovery

## Confirmed Facts

- The runtime export is `setupAtlasRuntime`.
- If no backend is supplied, the default backend is `chrome`.
- `backend: "chrome"` selects a discovered backend whose `info.type` is
  `extension`.
- `backend: "iab"` selects a discovered backend whose `info.type` is `iab`.
- IAB selection is session-scoped: the discovered backend metadata must include
  `metadata.codexSessionId` matching the current Codex session ID.
- The current session ID is read from
  `globalThis.nodeRepl.requestMeta["x-codex-turn-metadata"].session_id`.

## Socket Paths

Discovery is broader than the fixed fallback paths. On macOS/Linux, the client
first scans:

```text
/tmp/codex-browser-use/
```

Every entry in that directory is treated as a candidate socket path. This
explains paths like:

```text
/tmp/codex-browser-use/<uuid>.sock
```

After scanning dynamic sockets, the client appends fixed fallback paths:

```text
/tmp/codex-browser-use-iab.sock
/tmp/codex-browser-use.sock
```

On Windows, the corresponding fixed pipe names are:

```text
\\.\pipe\codex-browser-use-iab
\\.\pipe\codex-browser-use
```

## Selection Flow

The effective flow is:

1. Build candidate pipe paths from dynamic discovery plus fixed fallbacks.
2. Try to connect to each candidate through
   `import.meta.__codexNativePipe.createConnection`.
3. Wrap each successful connection as JSON-RPC.
4. Read backend info through `getInfo()`, except the fixed Chrome fallback path
   has a built-in fallback info object.
5. Filter by requested backend kind:
   - `chrome` -> `info.type === "extension"`
   - `iab` -> `info.type === "iab"` and matching `metadata.codexSessionId`
6. Close non-selected backends.

Each connection attempt is raced against a 3000 ms discovery timeout.

## Interpretation

`/tmp/codex-browser-use/<uuid>.sock` is not contradictory with the documented
fixed socket names. It is part of the dynamic discovery path, likely used by
newer or session-scoped backends.

The client does not itself start Chrome or IAB. It discovers and connects to an
already-running local backend.

