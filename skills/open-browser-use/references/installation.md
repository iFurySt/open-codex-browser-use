# Open Browser Use Installation

Read this reference when the user asks to install, verify, repair, or explain Open Browser Use setup.

## Components

- Chrome extension: the browser-side controller. Installing or enabling it may require the user to approve Chrome prompts.
- Native host and CLI: the local `open-browser-use` binary, also exposed as `obu` when installed from supported packages.
- SDKs: JavaScript, Python, and Go clients that connect to the active native host socket.

## Install The CLI

Use one of the supported package routes:

```sh
npm install -g open-browser-use
```

```sh
brew install iFurySt/open-browser-use/open-browser-use
```

Verify:

```sh
open-browser-use version
obu version
```

If the short alias is unavailable, use `open-browser-use`.
Running `open-browser-use` with no subcommand prints the CLI version, browser
extension detection status, extension version when available, and the next setup
or upgrade command.

## Set Up Chrome

After installing the CLI, register the native messaging host and open the Chrome Web Store page for the matching extension:

```sh
open-browser-use setup
```

Ask the user to install or enable Open Browser Use from the opened store page. Chrome may ask the user to confirm, enable the extension, or restart. Do not bypass this user step.

While the Chrome Web Store item is unavailable or pending review, use the release ZIP path:

```sh
open-browser-use setup beta
```

This downloads the latest keyed `open-browser-use-chrome-extension-*.zip` from GitHub Releases, registers the native host for that stable extension id, opens `chrome://extensions/`, and reveals the ZIP in Finder or the system file manager. Ask the user to enable Developer mode and drag that ZIP into the Chrome extensions page.

Repair only the native host manifest:

```sh
open-browser-use install-manifest
```

Print the manifest without installing:

```sh
open-browser-use manifest
```

## Platform Notes

- macOS and Windows can require the user to approve or enable the extension after Chrome sees it.
- Linux external extension registration can require elevated permissions depending on Chrome installation paths.
- Chrome native messaging host name is `com.ifuryst.open_browser_use.extension`.
- The default socket registry is under `/tmp/open-browser-use/` on Unix-like systems.

## Verification

Run:

```sh
open-browser-use ping --session-id "$OBU_SESSION_ID"
open-browser-use info --session-id "$OBU_SESSION_ID"
open-browser-use user-tabs --session-id "$OBU_SESSION_ID"
```

For one-off installation checks, a temporary session id is enough. Agent browser
tasks should still create and reuse a task-unique session id before opening or
claiming tabs.

If `ping` cannot communicate with Chrome, ask the user whether Chrome is installed and running, whether the extension is enabled, and whether they approved any Chrome prompt. Then use [troubleshooting.md](troubleshooting.md).
