## [2026-05-09 15:07] | Task: add Open Browser Use skill

### Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### User Query

> Add `./skills/open-browser-use` based on the bundled Chrome skill, but adapt it for this open-source, platform-neutral browser plugin that is a superset for all AI agents. Keep one-time installation details in references and make `SKILL.md` an index plus usage guide.

### Changes Overview

**Scope:** Agent skill documentation and repository architecture docs.

**Key Actions:**

- **[Skill]**: Added `skills/open-browser-use/SKILL.md` with trigger metadata, core workflow, safety rules, common CLI usage, tab lifecycle guidance, and reference index.
- **[References]**: Added installation, SDK/protocol, and troubleshooting references so larger or one-time details load only when needed.
- **[Docs Sync]**: Added `skills/open-browser-use/` to the architecture structure.

### Design Intent

The bundled Chrome skill is Codex.app-specific and assumes plugin UI repair paths, Node REPL bootstrap, and Codex Chrome Extension naming. Open Browser Use needs a reusable skill that speaks to any AI agent runtime, points to the public CLI/SDK/protocol surface, and keeps high-volume setup details out of the main skill body.

### Files Modified

- `skills/open-browser-use/SKILL.md`
- `skills/open-browser-use/agents/openai.yaml`
- `skills/open-browser-use/references/installation.md`
- `skills/open-browser-use/references/sdk-and-protocol.md`
- `skills/open-browser-use/references/troubleshooting.md`
- `docs/ARCHITECTURE.md`
- `docs/histories/2026-05/20260509-1507-open-browser-use-skill.md`
