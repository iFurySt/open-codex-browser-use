# Open Browser Use

[![English](https://img.shields.io/badge/English-Click-yellow)](./README.md)
[![简体中文](https://img.shields.io/badge/简体中文-点击查看-orange)](./README.zh-CN.md)
[![Release](https://img.shields.io/github/v/release/iFurySt/open-codex-browser-use)](https://github.com/iFurySt/open-codex-browser-use/releases)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/iFurySt/open-codex-browser-use)

---

`open-browser-use` 是一套开源 Chrome 自动化基础设施，面向 AI Agent 使用。它把
Chrome MV3 扩展、Go native messaging host 和本地 SDK 串起来，让 Agent 可以通过
可读、可自托管的链路控制真实 Chrome profile。

这个项目聚焦一个很小的核心：安装浏览器插件，安装本地 host，然后通过 CLI 或
SDK 查看标签页、打开页面、执行 CDP 命令，并把浏览器状态交还给上层 Agent runtime。

## Quick Start

### 安装插件

可以从两个入口安装 Chrome 插件：

- [GitHub Releases](https://github.com/iFurySt/open-codex-browser-use/releases)：
  下载最新的 `open-browser-use-chrome-extension-*.crx` 或 `.zip`。
- Chrome Web Store：
  [Open Browser Use](https://chromewebstore.google.com/detail/open-browser-use/bgjoihaepiejlfjinojjfgokghnodnhd)。

### 安装 CLI

通过 npm 安装 native host 和 CLI：

```bash
npm install -g open-browser-use
```

或通过 Homebrew 安装：

```bash
brew install iFurySt/open-browser-use/open-browser-use
```

CLI 安装器会自动注册 Chrome native messaging host。如果需要修复注册，运行：

```bash
open-browser-use install-manifest
```

### 使用

检查插件和 native host 是否可以连通：

```bash
open-browser-use ping
```

查看浏览器和 session 状态：

```bash
open-browser-use info
open-browser-use tabs
open-browser-use user-tabs
```

打开并控制标签页：

```bash
open-browser-use open-tab --url https://example.com
open-browser-use navigate --tab-id <tab-id> --url https://github.com/iFurySt/open-codex-browser-use
```

CLI 也提供底层 Browser Use 风格调用入口：

```bash
open-browser-use call --method <method> --params '<json>'
```

## License

[MIT](./LICENSE)
