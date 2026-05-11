## [2026-05-11 16:59] | Task: Chrome Web Store release drill

### User Request

> 打新版本触发，在监督下完整走完一次 release 到 Chrome Web Store 的流程。

### Changes

- Bumped Open Browser Use runtime, Chrome extension, SDK, and internal package
  versions from `0.1.31` to `0.1.32`.
- Added a release-note row documenting this Chrome Web Store release drill.

### Rationale

The repository now has Chrome Web Store publisher, item, and service-account
secrets plus `CWS_AUTO_PUBLISH=true`. A new patch tag is the smallest concrete
change that exercises the real tag-triggered release workflow, including
release artifact generation and automatic Chrome Web Store submission.

### Evidence

- Local validation packages the Chrome extension as
  `open-browser-use-chrome-extension-0.1.32.zip` before the tag is pushed.
- GitHub Actions and Chrome Web Store status are tracked after `v0.1.32` is
  pushed.
