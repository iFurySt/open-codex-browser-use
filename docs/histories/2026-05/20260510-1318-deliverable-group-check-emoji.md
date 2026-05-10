## [2026-05-10 13:18] | Task: Use check emoji for deliverable group

> Open Browser Use deliverable group used a new emoji that rendered as `[?]` in Chrome tab groups; replace it with a green check emoji.

**Scope:** Chrome extension tab group title, Open Browser Use skill display/guidance, architecture and release docs.

## Changes

- **[Extension]**: Changed the shared deliverable tab group title from `🫪 Open Browser Use` to `✅ Open Browser Use`.
- **[Skill]**: Updated the skill display name and cleanup guidance to use the same check emoji title.
- **[Docs]**: Synced architecture and release note wording so repository docs match the runtime title.
- **[Release]**: Bumped Open Browser Use package metadata to `0.1.26` for a patch release.

## Rationale

`🫪` is a newer Unicode emoji and can render as a missing glyph in Chrome tab group UI on systems without matching emoji font support. `✅` is widely supported and keeps the intended green completion marker.

## Files

- `apps/chrome-extension/background.js`
- `skills/open-browser-use/SKILL.md`
- `skills/open-browser-use/agents/openai.yaml`
- `docs/ARCHITECTURE.md`
- `docs/releases/feature-release-notes.md`
- package/runtime version metadata
