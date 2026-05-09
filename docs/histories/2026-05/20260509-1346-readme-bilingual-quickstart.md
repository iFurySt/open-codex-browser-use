## [2026-05-09 13:46] | Task: update README bilingual quick start

### Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### User Query

> 参考 open-codex-computer-use 的 README，更新本仓库 README：增加中英文、顶部语言切换、Release 和 DeepWiki badge，简化整体介绍，暂不放 Demos，Quick Start 展示插件安装、命令行安装和使用，保留 MIT。

### Changes Overview

**Scope:** README documentation.

**Key Actions:**

- **[Bilingual README]**: Reworked `README.md` as the English entry and added `README.zh-CN.md` as the Simplified Chinese entry.
- **[Top Badges]**: Added English/Chinese switch badges, GitHub Release badge, and DeepWiki badge.
- **[Quick Start]**: Simplified the user path to extension install, CLI install via npm/Homebrew, native host repair, and basic usage commands.

### Design Intent (Why)

The README should be a small public entry point for users, not a full architecture guide. The new structure keeps install and first-use steps prominent while leaving deeper release, architecture, and operational details in `docs/`.

### Files Modified

- `README.md`
- `README.zh-CN.md`
- `docs/histories/2026-05/20260509-1346-readme-bilingual-quickstart.md`
