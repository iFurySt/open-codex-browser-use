# Open Browser Use

[![English](https://img.shields.io/badge/English-Click-yellow)](./README.md)
[![简体中文](https://img.shields.io/badge/简体中文-点击查看-orange)](./README.zh-CN.md)
[![Release](https://img.shields.io/github/v/release/iFurySt/open-codex-browser-use)](https://github.com/iFurySt/open-codex-browser-use/releases)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/iFurySt/open-codex-browser-use)

---

`open-browser-use` is a browser automation layer that stays neutral across
agent runtimes. It is also an open-source alternative to the Chrome Browser Use
capability recently shipped in Codex.app. For the story behind it, see the
Browser Use deep dive.

Under the hood, it pairs a browser extension with the `open-browser-use` CLI.
You can integrate it through the JavaScript SDK, the Python SDK, or the CLI.

## Quick Start

```bash
brew tap iFurySt/open-browser-use
brew install open-browser-use
open-browser-use setup beta
```

### Install the CLI

```bash
# npm
npm i -g open-browser-use

# Homebrew
brew tap iFurySt/open-browser-use && brew install open-browser-use

# Upgrade
brew upgrade open-browser-use
```

### Set Up Chrome

Register the native host for the extension, then install the matching Chrome
extension.

```bash
# The Chrome Web Store listing is still under review, so skip this for now.
# open-browser-use setup

# Install from the zip/crx package instead. Drag the opened package into
# chrome://extensions/.
open-browser-use setup beta
```

You can also download the latest package directly from
[GitHub Releases](https://github.com/iFurySt/open-codex-browser-use/releases)
and install it manually.

### Use It

Download and install the [`open-browser-use` skill](./skills/open-browser-use),
then you are ready to use Open Browser Use from your agent.

Downloadable `.skill` and `.zip` packages are available in
[GitHub Releases](https://github.com/iFurySt/open-codex-browser-use/releases).

## License

[MIT](./LICENSE)
