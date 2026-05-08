# Codex Chrome Extension 1.1.4 Snapshot

This directory is a local reverse-engineering snapshot of the public Codex
Chrome Web Store extension:

- Extension ID: `hehggadaopoacecdllhhajmbjkdcmajg`
- Extension name: `Codex`
- Version: `1.1.4`
- Manifest version: `3`
- Snapshot date: `2026-05-08`

The raw files came from Chrome's installed extension directory. That directory
contains the unpacked extension bundle, not browser profile data such as
cookies, local storage, history databases, or passwords.

## Directory Layout

- `raw/`: byte-for-byte copy of the installed extension version directory.
- `formatted/`: Prettier-formatted copies of the minified JS/CSS entry points
  for source reading only.
- `native-host-manifest.sanitized.json`: sanitized copy of the Chrome native
  messaging host registration shape observed on this machine.

## Key Entry Points

- `raw/manifest.json`: MV3 manifest. The extension requests `nativeMessaging`,
  `debugger`, `tabs`, `tabGroups`, `downloads`, `history`, `scripting`,
  `storage`, and `<all_urls>`.
- `raw/background.js`: minified service worker bundle.
- `formatted/background.js`: readable copy of the service worker bundle.
- `raw/content-scripts/codex.js`: injected cursor overlay content script.
- `formatted/content-codex.js`: readable copy of the cursor overlay content
  script.
- `raw/popup.html` and `raw/chunks/popup-47nmQnIc.js`: extension popup that
  reports native host connectivity and links to Chrome setup docs.

## Confirmed Runtime Shape

The service worker calls `chrome.runtime.connectNative` with
`com.openai.codexextension`. The native messaging host registration allows only
`chrome-extension://hehggadaopoacecdllhhajmbjkdcmajg/` and points at Codex's
Chrome plugin `extension-host` binary.

At runtime, the native host process is launched by Google Chrome with the
extension origin as an argument. The host owns an extension backend Unix socket
under `/tmp/codex-browser-use/`, while the service worker talks to it through
Chrome native messaging.

The service worker implements the Browser Use backend methods directly over the
native messaging JSON-RPC bridge:

- `getInfo`: returns `{ name: "Chrome", type: "extension" }` plus extension
  metadata.
- `createTab`, `getTabs`, `claimUserTab`, `finalizeTabs`, `nameSession`:
  manage Chrome tabs and tab groups for each Codex `session_id`.
- `attach`, `detach`, `executeCdp`: use `chrome.debugger`.
- `getUserTabs`, `getUserHistory`: read user browser tab/history surfaces.
- `moveMouse`: drives the injected cursor overlay content script.

## Integrity Notes

Important hashes from the raw snapshot:

```text
dbd1f29afff4fddb644281677c2eeee6a165bf8ca1ac9270df7fb892a7d3f4ea  raw/background.js
daa383cb2fa673cd3c98bd80b9d1135787d0a9a0a60cbdbce35a8853c952da8e  raw/content-scripts/codex.js
07259620aafb265a01976119acafcc4092dc9f9dfd2dc912c25c6b6e48045caa  raw/manifest.json
```

The native host binary is not copied into this reference directory. It is a
Codex plugin artifact rather than a Chrome Web Store extension file.
