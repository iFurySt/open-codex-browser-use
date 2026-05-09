## [2026-05-09 18:13] | Task: align tab group naming

### Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### User Query

> Compare the current Open Browser Use skill with the bundled Chrome skill and align tab group naming: use `Open Browser Use` for the unified group, use task-based names in the `Task - OBU` pattern for active browser work, then add the `🫪` emoji to the Open Browser Use group/display name.

### Changes Overview

**Scope:** Chrome extension tab grouping, Open Browser Use skill docs, architecture docs.

**Key Actions:**

- **Group naming**: Changed the default session group title to `Task - OBU` and the shared deliverable group title to `🫪 Open Browser Use`.
- **Legacy cleanup**: Migrated stored legacy default session titles shaped like `Open Browser Use <session>` to `Task - OBU`.
- **Skill guidance**: Documented naming the browser task group before opening or claiming tabs, using `<short task> - OBU`.
- **Emoji display**: Added `🫪` to the Open Browser Use shared group and skill display name; existing stored deliverable groups are retitled on extension state load.

### Design Intent (Why)

The bundled Chrome skill separates task handoff groups from the unified deliverable group. Open Browser Use keeps the same operational model while using project-specific naming: task work stays in a task-named group and deliverables move to the shared `🫪 Open Browser Use` group.

### Files Modified

- `apps/chrome-extension/background.js`
- `skills/open-browser-use/SKILL.md`
- `skills/open-browser-use/agents/openai.yaml`
- `skills/open-browser-use/references/sdk-and-protocol.md`
- `docs/ARCHITECTURE.md`
