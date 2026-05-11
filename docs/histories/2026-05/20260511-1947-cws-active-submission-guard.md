## [2026-05-11 19:47] | Task: Chrome Web Store active submission guard

### 🤖 Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### 📥 User Query

> Chrome Web Store 已有版本在审核中时，希望发布机制能检测并处理，必要时取消旧审核并用最新版本重发，避免最新版本没发出去。

### 🛠 Changes Overview

**Scope:** Chrome Web Store publish script, release workflows, release docs.

**Key Actions:**

- **[Preflight]**: Added `fetchStatus` before CWS upload and detect active submitted revisions (`PENDING_REVIEW` and `STAGED`).
- **[Default Guard]**: Default behavior now skips CWS upload/submission with `skipped.reason=ACTIVE_SUBMISSION` instead of failing the whole release workflow.
- **[Explicit Replace]**: Added `--cancel-pending`, workflow inputs, and `CWS_CANCEL_PENDING_SUBMISSION=true` to cancel the active CWS submission before uploading the latest zip.
- **[Docs]**: Documented skip vs cancel behavior and linked official `fetchStatus` / `cancelSubmission` references.

### 🧠 Design Intent (Why)

Chrome Web Store rejects edits while an item is already in review. Release automation should not fail GitHub Release, npm, PyPI, and Homebrew delivery because CWS is busy, but replacing an active submission is externally visible and should require an explicit opt-in.

### 📁 Files Modified

- `scripts/publish-chrome-web-store.mjs`
- `.github/workflows/release.yml`
- `.github/workflows/chrome-web-store-publish.yml`
- `docs/CHROME_WEB_STORE_RELEASE.md`
- `docs/CICD.md`
- `docs/releases/feature-release-notes.md`
