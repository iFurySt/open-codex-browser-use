## [2026-05-11 14:39] | Task: Merge duplicate deliverable tab groups

> Chrome 会话恢复带回旧的 `✅ Open Browser Use` 分组后，每次 `finalize_tabs(deliverable)` 都新建一个同名分组，导致标签栏出现多个标题相同但 id 不同的 deliverable 分组；扩展原本完全没有按标题查询已有分组的逻辑。

**Scope:** Chrome extension deliverable tab group reconciliation, supporting unit test, architecture doc.

## Changes

- **[Extension]**: Rewrote `BrowserBackend.moveToDeliverables` in `apps/chrome-extension/background.js`. Tabs are now bucketed by `windowId`, and for each window the handler queries `chrome.tabGroups.query({windowId, title: DELIVERABLE_GROUP_TITLE})` to find every existing deliverable group, folds duplicates into the lowest-id surviving group, adds the new tabs to that primary group, and only creates a fresh group when no same-title group exists in the window. Persists the primary group id back into `SessionStore.deliverableGroupId`.
- **[Tests]**: Added `apps/chrome-extension/move-to-deliverables.test.mjs` — a Node `vm` sandbox harness that loads `background.js` against a faked per-window `chrome.*` surface and covers four scenarios: reuse existing group, merge duplicate groups, create when none exists, and per-window isolation.
- **[Docs]**: Clarified the deliverable-group invariant in `docs/ARCHITECTURE.md` so future agents know reconciliation is by title within each window, not by stored id alone.

## Rationale

Chrome's `tabGroups` API identifies groups by numeric id, not by title. The previous implementation trusted a single stored `deliverableGroupId` and minted a new group whenever that id failed to resolve — so any divergence (session restore, multi-window, manual user action) silently produced parallel groups with the same title that nothing in the codebase ever reconciled. Querying by title per-window and merging duplicates makes the invariant "at most one `✅ Open Browser Use` group per Chrome window" self-healing on the next `finalize_tabs(deliverable)` call. The fix also closes a latent cross-window bug where `chrome.tabs.group({groupId, tabIds})` was called with tabs from a different window than the stored group.

## Verification

- Unit suite: `node apps/chrome-extension/move-to-deliverables.test.mjs` — 4/4 pass.
- Live end-to-end: reproduced the duplicate-group state in a real Chrome profile, loaded the patched extension, ran `name_session` + `open_tab` + `finalize_tabs(deliverable)`, and confirmed via screenshot that the two duplicate green pills merged into a single pill containing all three tabs (two restored x.com tabs + the new deliverable).

## Files

- `apps/chrome-extension/background.js`
- `apps/chrome-extension/move-to-deliverables.test.mjs`
- `docs/ARCHITECTURE.md`
