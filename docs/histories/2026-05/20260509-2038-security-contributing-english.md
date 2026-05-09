## [2026-05-09 20:38] | Task: Refresh security and contributing docs

### 🤖 Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### 📥 User Query

> Update the security policy and contributing docs because they still looked like templates, and write them in English. Commit and push the result.

### 🛠 Changes Overview

**Scope:** Repository documentation

**Key Actions:**

- **Security policy**: Replaced the template-style security notes with concrete English guidance for supported scope, reporting, Chrome route boundaries, local transport, extension permissions, sensitive data handling, supply chain references, and maintainer checks.
- **Contributing guide**: Rewrote the contribution workflow in English, keeping the Agent-first repository conventions and PR checklist aligned with the local docs.

### 🧠 Design Intent (Why)

The repository now has real Open Browser Use behavior and release paths, so the security and contribution docs should describe the actual collaboration and risk model instead of serving as placeholders.

### 📁 Files Modified

- `docs/SECURITY.md`
- `CONTRIBUTING.md`
- `docs/histories/2026-05/20260509-2038-security-contributing-english.md`
