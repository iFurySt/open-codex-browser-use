# Browser Client Reverse Engineering

Status: completed on 2026-04-24.

## Goal

Reverse engineer the bundled Browser Use client script at
`~/.codex/plugins/cache/openai-bundled/browser-use/0.1.0-alpha1/scripts/browser-client.mjs`,
preserve the findings in this repository, and produce a readable source-equivalent
implementation that can be used as the starting point for an open implementation.

## Scope

- Included:
  - Static analysis of the bundled script's runtime boundary, transports,
    command dispatch, permission checks, backend discovery, and Playwright
    selector integration.
  - Reproducible extraction notes and generated metadata where useful.
  - A readable implementation with the same high-level runtime contract.
  - History entry for the completed repository change.
- Excluded:
  - Copying large minified vendor code into this repository.
  - Bypassing Browser Use permissions or site policy checks.
  - Publishing or packaging a drop-in replacement before separate validation.

## Background

- Source artifact:
  - `~/.codex/plugins/cache/openai-bundled/browser-use/0.1.0-alpha1/scripts/browser-client.mjs`
- Repository references:
  - `docs/REPO_COLLAB_GUIDE.md`
  - `docs/ARCHITECTURE.md`
  - `docs/design-docs/core-beliefs.md`
  - `docs/HISTORY_GUIDE.md`
  - `docs/QUALITY_SCORE.md`

## Risks

- Risk: the source artifact is minified and may include bundled third-party code.
  - Mitigation: document behavior from stable boundaries and avoid vendoring
    large opaque blobs.
- Risk: a readable rewrite may look complete while only covering the observed
  outer runtime contract.
  - Mitigation: label implementation status clearly and keep unsupported command
    families explicit.
- Risk: local plugin cache paths are machine-specific.
  - Mitigation: store analysis and reproducible extraction scripts, not absolute
    source copies.

## Verification

- Commands:
  - `node --check packages/browser-client-rewrite/browser-client.mjs`
  - `make check-docs`
- Manual checks:
  - Confirm generated metadata points to the analyzed bundle.
  - Confirm analysis distinguishes observed facts from inferred structure.

## Todo

- [x] Read repository collaboration, architecture, core beliefs, history, and quality docs.
- [x] Extract bundle metadata, exports, string constants, and command names.
- [x] Map the runtime architecture and security gates.
- [x] Write reverse-engineering notes under `docs/references/`.
- [x] Add a source-equivalent readable implementation under `packages/`.
- [x] Add a history entry under `docs/histories/`.
- [x] Run checks and record verification results.

## Decisions

- 2026-04-24: Keep the reverse-engineered output split into curated notes,
  generated metadata, and a readable rewrite. This avoids treating a minified
  vendor bundle as maintainable source.

## Verification Results

- 2026-04-24: `node --check packages/browser-client-rewrite/browser-client.mjs` passed.
- 2026-04-24: `node --check scripts/extract-browser-client-metadata.mjs` passed.
- 2026-04-24: `make check-docs` passed.
