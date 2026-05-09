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

### Install the Extension

Install the Chrome extension from either source:

- [GitHub Releases](https://github.com/iFurySt/open-codex-browser-use/releases):
  download the latest `open-browser-use-chrome-extension-*.crx` or `.zip`.
- Chrome Web Store:
  [Open Browser Use](https://chromewebstore.google.com/detail/open-browser-use/bgjoihaepiejlfjinojjfgokghnodnhd).

### Install the CLI

Install the native host and CLI with npm:

```bash
npm install -g open-browser-use
```

Or install with Homebrew:

```bash
brew install iFurySt/open-browser-use/open-browser-use
```

The CLI installer registers the Chrome native messaging host automatically. If
you need to repair the registration, run:

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
