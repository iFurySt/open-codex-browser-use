# Open Browser Use

[![English](https://img.shields.io/badge/English-Click-yellow)](./README.md)
[![简体中文](https://img.shields.io/badge/简体中文-点击查看-orange)](./README.zh-CN.md)
[![Release](https://img.shields.io/github/v/release/iFurySt/open-codex-browser-use)](https://github.com/iFurySt/open-codex-browser-use/releases)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/iFurySt/open-codex-browser-use)

---

`open-browser-use` is an open-source Chrome automation stack for AI agents. It
connects a Chrome MV3 extension, a Go native messaging host, and local SDKs so
agents can control a real Chrome profile through a readable, self-hosted route.

The project focuses on a small core: install the browser extension, install the
local host, then use the CLI or SDKs to inspect tabs, open pages, run CDP
commands, and hand browser state back to an upper-layer agent runtime.

## Quick Start

### Install the CLI

Install the native host and CLI with npm:

```bash
npm install -g open-browser-use
```

Or install with Homebrew:

```bash
brew install iFurySt/open-browser-use/open-browser-use
```

### Set Up Chrome

After installing the CLI, register the native host and ask Chrome to install the
Web Store extension:

```bash
open-browser-use setup
```

Restart Chrome and approve the Open Browser Use extension prompt if Chrome asks.

While the Chrome Web Store item is pending review, install the latest release
CRX instead:

```bash
open-browser-use setup release
```

`setup release` downloads the latest
`open-browser-use-chrome-extension-*.crx` from
[GitHub Releases](https://github.com/iFurySt/open-codex-browser-use/releases)
and opens it in Chrome. It reads the CRX extension id and registers the native
host for that id. The alias `open-browser-use setup offline` is also available
for this non-Web-Store path.

If you only need to repair the native messaging host registration, run:

```bash
open-browser-use install-manifest
```

### Use It

Check that the extension and native host can talk to each other:

```bash
open-browser-use ping
```

List browser and session state:

```bash
open-browser-use info
open-browser-use tabs
open-browser-use user-tabs
```

Open and control a tab:

```bash
open-browser-use open-tab --url https://example.com
open-browser-use navigate --tab-id <tab-id> --url https://github.com/iFurySt/open-codex-browser-use
```

The CLI also exposes lower-level Browser Use style calls through:

```bash
open-browser-use call --method <method> --params '<json>'
```

## License

[MIT](./LICENSE)
