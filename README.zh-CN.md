# Open Browser Use

[![English](https://img.shields.io/badge/English-Click-yellow)](./README.md)
[![简体中文](https://img.shields.io/badge/简体中文-点击查看-orange)](./README.zh-CN.md)
[![Release](https://img.shields.io/github/v/release/iFurySt/open-codex-browser-use)](https://github.com/iFurySt/open-codex-browser-use/releases)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/iFurySt/open-codex-browser-use)

---

> [!TIP]
> 对 Computer Use 感兴趣的话，可以看看 [open-computer-use](https://github.com/iFurySt/open-codex-computer-use)。

`open-browser-use` 是平台中立的浏览器操作方案，也是Codex.app最新发布的Chrome Browser Use的开源替代方案。背后的故事可以看这篇[Browser Use详解](https://www.ifuryst.com/blog/2026/open-browser-use/)文章。 技术方案采用的是浏览器插件和open-browser-use cli结合，可通过JS/PYTHON SDK或CLI的方式接入。

https://github.com/user-attachments/assets/bcfba878-f6a8-44b9-b84b-29c7e0285687

## Quick Start
第一次安装可以无脑运行：
```bash
brew tap iFurySt/open-browser-use
brew install open-browser-use
open-browser-use setup beta
```

### 安装 CLI
```bash
# npm安装
npm i -g open-browser-use

# Homebrew安装
brew tap iFurySt/open-browser-use && brew install open-browser-use

# 升级
brew upgrade open-browser-use
```

### 配置 Chrome
注册绑定到该插件的 native host，然后安装对应的浏览器插件

```bash
# 目前插件在上架商店中，暂时不要用这个命令
# open-browser-use setup

# 通过zip/crx包直接导入安装插件，打开的文件里直接拖包到chrome://extensions/页面
open-browser-use setup beta
```

*也可以手动到[GitHub Releases](https://github.com/iFurySt/open-codex-browser-use/releases)里下载最新的包安装*

### 使用

#### SDK

```bash
# JavaScript / TypeScript
npm install open-browser-use-sdk

# Python
pip install open-browser-use-sdk
```

SDK 在 npm 和 PyPI 上统一叫 `open-browser-use-sdk`。Python 代码里的 import
模块名保持 `open_browser_use`。

#### Skill

一键安装 skill：

```bash
# 安装到codex
npx skills add iFurySt/open-codex-browser-use -g -a codex --skill open-browser-use --copy -y
npx skills ls -g -a codex | rg 'open-browser-use'
codex exec --skip-git-repo-check "用open-browser-use查看下今天Hacker News有什么值得关注的"

# 安装到claude code
npx skills add iFurySt/open-codex-browser-use -g -a claude-code --skill open-browser-use --copy -y
```

也可以手动下载`open-browser-use`的[skill](./skills/open-browser-use)并安装，就可以愉快的开始使用了🚀

*[GitHub Releases](https://github.com/iFurySt/open-codex-browser-use/releases)里有可下载的.skill/.zip包*

#### MCP

一键安装 MCP server 到所有支持的全局 Agent 配置：

```bash
npx add-mcp "obu mcp" --name open_browser_use --all -g -y
npx add-mcp list -g
```

也可以手动配置到支持本地 stdio MCP 的 Agent runtime：

```toml
[mcp_servers.open_browser_use]
command = "obu"
args = ["mcp"]
```

这个 MCP server 会暴露标签页列表、打开/接管标签页、导航、CDP、action plan
和清理等浏览器工具。

## License

[MIT](./LICENSE)
