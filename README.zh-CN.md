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

### 安装 CLI

通过 npm 安装 native host 和 CLI：

```bash
npm install -g open-browser-use
```

或通过 Homebrew 安装：

```bash
brew install iFurySt/open-browser-use/open-browser-use
```

### 配置 Chrome

CLI 安装完成后，注册 native host，并让 Chrome 安装 Web Store 插件：

```bash
open-browser-use setup
```

重启 Chrome，并在 Chrome 提示时确认启用 Open Browser Use 插件。

Chrome Web Store 条目还在审核时，可以改用最新 GitHub Release CRX：

```bash
open-browser-use setup release
```

`setup release` 会从
[GitHub Releases](https://github.com/iFurySt/open-codex-browser-use/releases)
下载最新的 `open-browser-use-chrome-extension-*.crx` 并用 Chrome 打开。
它会读取 CRX 里的 extension id，并用该 id 注册 native host。
`open-browser-use setup offline` 也作为这个非商店安装路径的别名可用。

如果只需要修复 native messaging host 注册，运行：

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
