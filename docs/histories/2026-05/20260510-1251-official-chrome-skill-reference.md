## [2026-05-10 12:51] | Task: Add official Chrome skill reference

### Execution Context

- **Agent ID**: Codex
- **Base Model**: GPT-5.5
- **Runtime**: codex-tui

### User Query

> 查看 bundled Chrome plugin 的官方 `chrome/0.1.7/skills/chrome/SKILL.md`，并按版本路径沉淀到 `docs/references`，方便后续对照不同版本。

### Changes Overview

**Scope:** `docs/references`, `docs/histories`

**Key Actions:**

- **[References]**: 保存 OpenAI bundled Chrome plugin `0.1.7` 的官方 Chrome skill 原文快照到 `docs/references/chrome/0.1.7/skills/chrome/SKILL.md`。
- **[Docs]**: 更新 `docs/references/README.md`，记录该快照的路径、来源和后续版本组织方式。
- **[Traceability]**: 记录本次参考资料沉淀的 history。

### Design Intent (Why)

官方 Chrome skill 对 browser session、user tab claiming、file upload 和 tab cleanup 的语义写得更明确。把原文按 `chrome/<version>/skills/chrome/SKILL.md` 保存，可以让后续 Open Browser Use 的 skill 设计和 cleanup 策略有稳定、可 diff 的官方参照。

### Files Modified

- `docs/references/README.md`
- `docs/references/chrome/0.1.7/skills/chrome/SKILL.md`
- `docs/histories/2026-05/20260510-1251-official-chrome-skill-reference.md`
