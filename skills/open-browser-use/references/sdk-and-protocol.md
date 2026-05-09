# Open Browser Use SDK And Protocol

Read this reference when the task requires multi-step automation, integration into another agent runtime, or direct Browser Use style JSON-RPC calls.

## Connection Model

The Chrome extension starts the native host through Chrome Native Messaging. The native host exposes a local socket and writes the active socket registry so the CLI and SDKs can discover it.

Default route:

```text
agent runtime
  -> open-browser-use CLI or SDK
  -> active Open Browser Use socket
  -> native messaging host
  -> Chrome extension
  -> Chrome tabs / debugger / history / downloads
```

Pass an explicit socket only when the runtime provides one:

```sh
open-browser-use ping --socket /tmp/open-browser-use/example.sock
```

For SDKs, create a client with `socketPath` / `socket_path`.

## JavaScript SDK Pattern

```ts
import { OpenBrowserUseClient } from "@open-browser-use/sdk-js";

const browser = new OpenBrowserUseClient({
  socketPath: "/tmp/open-browser-use/example.sock",
  sessionId: "my-agent",
});

await browser.connect();
await browser.nameSession("Task - OBU");
const tab = await browser.createTab() as { id: number };
await browser.executeCdp(tab.id, "Page.navigate", { url: "https://example.com" });
await browser.finalizeTabs([]);
browser.close();
```

The JavaScript SDK supports notification handlers:

```ts
const unsubscribe = browser.onNotification((event) => {
  if (event.method === "onDownloadChange") {
    console.log(event.params);
  }
});
```

## Python SDK Pattern

```py
import json
from pathlib import Path

from open_browser_use import connect_open_browser_use

registry = json.loads(Path("/tmp/open-browser-use/active.json").read_text())
browser = connect_open_browser_use(
    socket_path=registry["socketPath"],
    session_id="my-agent",
)

try:
    browser.client.name_session("Issue scan - OBU")
    tab = browser.new_tab()
    tab.goto("https://github.com/iFurySt/open-codex-computer-use/issues", wait_until="domcontentloaded")
    tab.playwright.wait_for_load_state(state="domcontentloaded", timeout=15)
    tab.playwright.wait_for_timeout(1500)

    text = tab.playwright.locator("body").inner_text(timeout_ms=10000)
    result = {
        "title": tab.title(),
        "url": tab.url(),
        "text": text[:4000],
    }
    print(result)
finally:
    browser.client.finalize_tabs([])
    browser.close()
```

Use the low-level client when you need raw JSON-RPC/CDP calls:

```py
from open_browser_use import OpenBrowserUseClient

client = OpenBrowserUseClient(
    socket_path="/tmp/open-browser-use/example.sock",
    session_id="my-agent",
)

client.name_session("Task - OBU")
tab = client.create_tab()
client.execute_cdp(tab["id"], "Page.navigate", {"url": "https://example.com"})
client.finalize_tabs([])
client.close()
```

## Core Methods

Common Browser Use JSON-RPC methods:

- `ping`
- `getInfo`
- `createTab`
- `getTabs`
- `getUserTabs`
- `getUserHistory`
- `claimUserTab`
- `finalizeTabs`
- `nameSession`
- `attach`
- `detach`
- `executeCdp`
- `moveMouse`
- `waitForFileChooser`
- `setFileChooserFiles`
- `waitForDownload`
- `downloadPath`
- `readClipboardText`
- `writeClipboardText`
- `readClipboard`
- `writeClipboard`
- `turnEnded`

CLI unrestricted call:

```sh
open-browser-use call --method getInfo --params '{}'
open-browser-use call --method executeCdp --params '{"target":{"tabId":123},"method":"Runtime.evaluate","commandParams":{"expression":"document.title"}}'
```

SDK request escape hatch:

```ts
await browser.request("executeCdp", {
  target: { tabId: 123 },
  method: "Runtime.evaluate",
  commandParams: { expression: "document.title" },
});
```

```py
browser.request("executeCdp", {
    "target": {"tabId": 123},
    "method": "Runtime.evaluate",
    "commandParams": {"expression": "document.title"},
})
```

## User Tab Claiming

1. List open user tabs with `open-browser-use user-tabs` or SDK `getUserTabs`.
2. Select the tab from returned data using visible evidence: title, URL, recency, and group.
3. Claim it with `open-browser-use claim-tab --tab-id <id>` or SDK `claimUserTab` / `claim_user_tab`.
4. Use the returned controllable tab for later commands.

Never invent or reuse stale tab ids.

## File Chooser Pattern

1. Start waiting with `wait-file-chooser --tab-id <id>` or SDK `waitForFileChooser`.
2. Trigger the file picker in the page, usually through a click driven by CDP or a higher-level automation layer.
3. Set absolute file paths:

```sh
open-browser-use set-file-chooser-files --file-chooser-id <id> --file /absolute/path/file.txt
```

Use repeated `--file` values or comma-separated paths for multiple files.
