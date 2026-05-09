## [2026-05-09 19:44] | Task: package skill release bundle

### 🤖 Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### 📥 User Query

> 发版时把 `skills/open-browser-use` 打包成 `open-browser-use-skill.zip` 和 `open-browser-use.skill`，一起作为 GitHub Release 产物发布；解压后的目录名应为 `open-browser-use/*`。

### 🛠 Changes Overview

**Scope:** release packaging, GitHub Actions, CI, release docs

**Key Actions:**

- **[Packaging]**: 新增 `scripts/package-skill.sh`，校验 `SKILL.md` frontmatter，并生成内容一致的 zip 与 `.skill` 包。
- **[Release]**: 将 skill zip 和 `.skill` 纳入 `scripts/release-package.sh`、release manifest、release-evidence artifact、provenance attestation 和 GitHub Release assets。
- **[Version]**: 将 Open Browser Use 发布版本元数据提升到 `0.1.20`，用于触发新的 tag release。
- **[Docs]**: 同步 CI/CD、供应链、GitHub Release 文档和用户可见 release note。

### 🧠 Design Intent (Why)

Skill 是 Agent 安装 Open Browser Use 的直接入口，放进正式 release assets 可以让用户不用 checkout 仓库或手工整理目录。打包脚本强制 archive 顶层目录为 `open-browser-use/`，避免 installer 解包后目录名不稳定。

### 📁 Files Modified

- `.github/workflows/release.yml`
- `package.json`
- `scripts/ci.sh`
- `scripts/package-skill.sh`
- `scripts/release-package.sh`
- `docs/CICD.md`
- `docs/CHROME_WEB_STORE_RELEASE.md`
- `docs/SUPPLY_CHAIN_SECURITY.md`
- `docs/releases/feature-release-notes.md`
