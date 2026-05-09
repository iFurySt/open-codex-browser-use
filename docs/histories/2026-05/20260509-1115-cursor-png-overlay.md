## [2026-05-09 11:15] | Task: inherit Codex cursor PNG overlay

### Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### User Query

> Check which original mouse actions trigger the cursor mechanism, confirm
> whether Open Browser Use implements them, and adopt
> `docs/references/codex-chrome-extension-1.1.4/raw/images/cursor-chat.png`
> into the extension.

### Changes Overview

**Scope:** Chrome extension cursor overlay, manifest, and package validation.

**Key Actions:**

- Confirmed the Codex extension exposes `images/cursor-chat.png` as a web
  accessible resource and renders it from the content script.
- Confirmed the original overlay is published when session tabs are tracked
  through `createTab` / `claimUserTab`, and updated by `moveMouse`.
- Replaced the Open Browser Use CSS-only cursor dot with the inherited
  `cursor-chat.png` asset.
- Added cursor state publishing so session tab creation/claiming shows the
  cursor overlay and `moveMouse` updates the same PNG cursor.
- Included the cursor PNG in extension manifest/package validation.

### Design Intent

The extension should preserve the Browser Use-style cursor affordance instead
of showing a generic debug dot. Keeping the original PNG as a versioned local
asset also makes Chrome packaging deterministic and avoids fetching cursor
visuals at runtime.

### Files Modified

- `apps/chrome-extension/content-cursor.js`
- `apps/chrome-extension/background.js`
- `apps/chrome-extension/manifest.json`
- `apps/chrome-extension/images/cursor-chat.png`
- `scripts/package-chrome-extension.sh`
