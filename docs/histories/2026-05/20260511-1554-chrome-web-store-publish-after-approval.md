## [2026-05-11 15:54] | Task: Chrome Web Store publish path after approval

### User Request

> Chrome Web Store item has passed review. Re-evaluate the temporary GitHub
> Release zip/CRX packaging and whether new versions can be automatically
> published to the extension store. Also check the existing GitHub issue.

### Changes

- Restored the Chrome extension release zip to a formal Chrome Web Store upload
  artifact by removing the build-time `manifest.key` injection.
- Kept `open-browser-use setup beta` as a fallback path; it still writes the
  stable beta key locally before asking the user to install the ZIP manually.
- Added optional tag-triggered Chrome Web Store submission in `release.yml`
  behind repository variable `CWS_AUTO_PUBLISH=true`.
- Made the standalone Chrome Web Store publish workflow download the exact
  release zip for the requested tag instead of a broad wildcard.
- Switched user-facing install guidance back to `open-browser-use setup` in
  README, npm postinstall output, Homebrew formula rendering, and release docs.
- Bumped runtime/package versions to `0.1.31` because `v0.1.30` already exists.

### Rationale

Now that the Chrome Web Store item is public, the normal artifact should be the
store upload zip. Pre-writing the beta key into that zip was useful during
review, but it makes the release asset ambiguous and risks uploading a fallback
package to the official item. The safer split is: release zip is store-ready;
`setup beta` derives the keyed manual install ZIP locally only when the store
path is unavailable.

Every Chrome Web Store update is still expected to go through review unless
Google accepts a `skipReview` request. Open Browser Use uses broad host access
and sensitive permissions, so normal code updates should not rely on skip-review
eligibility.

### Evidence

- GitHub issue `#3` is still open and tracks the original publishing setup.
- Official Chrome Web Store API docs confirm `publish` submits the item for
  review and `skipReview` is only an attempted optimization validated by Google.
