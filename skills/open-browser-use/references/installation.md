# Open Browser Use Installation

Read this reference when the user asks to install, verify, repair, or explain Open Browser Use setup.

## Components

- Chrome extension: the browser-side controller. Installing or enabling it may require the user to approve Chrome prompts.
- Native host and CLI: the local `open-browser-use` binary, also exposed as `obu` when installed from supported packages.
- SDKs: JavaScript and Python clients that connect to the active native host socket.

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

After installing the CLI, register the native messaging host and ask Chrome to install the Web Store extension:

```sh
open-browser-use setup
```

Chrome may ask the user to confirm or enable the Open Browser Use extension. Do not bypass this user step.

While the Chrome Web Store item is unavailable or pending review, use the release ZIP path:

```sh
open-browser-use setup release
```

This downloads the latest `open-browser-use-chrome-extension-*.zip` from GitHub Releases, registers the native host for the stable unpacked extension id, opens `chrome://extensions/`, and reveals the ZIP in Finder or the system file manager. Ask the user to enable Developer mode and drag the ZIP into the Chrome extensions page. `open-browser-use setup offline` is an alias for this release path.

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
open-browser-use ping
open-browser-use info
open-browser-use user-tabs
```

If `ping` cannot communicate with Chrome, ask the user whether Chrome is installed and running, whether the extension is enabled, and whether they approved any Chrome prompt. Then use [troubleshooting.md](troubleshooting.md).
