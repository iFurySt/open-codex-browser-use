# Open Browser Use

[![English](https://img.shields.io/badge/English-Click-yellow)](./README.md)
[![简体中文](https://img.shields.io/badge/简体中文-点击查看-orange)](./README.zh-CN.md)
[![Release](https://img.shields.io/github/v/release/iFurySt/open-codex-browser-use)](https://github.com/iFurySt/open-codex-browser-use/releases)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/iFurySt/open-codex-browser-use)

---

`open-browser-use` 是平台中立的浏览器操作方案，也是Codex.app最新发布的Chrome Browser Use的开源替代方案。背后的故事可以看这篇Browser Use详解文章。 技术方案采用的是浏览器插件和open-computer-use cli结合，可通过JS/PYTHON SDK或CLI的方式接入。

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
直接下载`open-browser-use`的[skill](./skills/open-browser-use)并安装，就可以愉快的开始使用了🚀

*[GitHub Releases](https://github.com/iFurySt/open-codex-browser-use/releases)里有可下载的.skill/.zip包*

## License

[MIT](./LICENSE)
