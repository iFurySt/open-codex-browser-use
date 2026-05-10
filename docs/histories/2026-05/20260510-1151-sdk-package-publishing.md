## [2026-05-10 11:51] | Task: 统一 SDK 包名并补发布链路

> 统一 JS/Python SDK registry 包名为 `open-browser-use-sdk`，评估 npm/PyPI
> 是否能走 GitHub Actions trusted publishing，避免用户只能从源码路径使用 SDK。

**Scope:** SDK package metadata, npm/PyPI publish workflows, install docs, and
release/security documentation.

### Changes

- **[SDK]**: Renamed the JavaScript npm distribution from the internal scoped
  name to public `open-browser-use-sdk`, removed `private`, and limited npm
  package contents to README and `dist/`.
- **[SDK]**: Renamed the Python PyPI distribution to `open-browser-use-sdk`
  while keeping the runtime import module as `open_browser_use`.
- **[Release]**: Extended the npm publish workflow so tag releases publish both
  the CLI package `open-browser-use` and the JavaScript SDK package
  `open-browser-use-sdk` through npm trusted publishing.
- **[Release]**: Added a PyPI publish workflow that builds the Python SDK and
  publishes it through PyPI trusted publishing with the `pypi` environment.
  The workflow supports tag-triggered releases and manual dispatch for the
  initial registry bootstrap.
- **[Docs]**: Documented npm/PyPI SDK install commands, trusted publisher setup
  expectations, and supply-chain implications.

### Why

The SDK source existed in the repository, but users running normal import checks
from outside the package directories saw `ModuleNotFoundError` or missing npm
package errors because the SDKs were not published to registries. Using the same
distribution name across npm and PyPI makes installation easier to explain, and
OIDC trusted publishing avoids storing long-lived npm or PyPI tokens in GitHub
secrets.

### Verification

- `npm view open-browser-use-sdk` returned 404 before the change, confirming the
  npm name was available.
- `python3 -m pip index versions open-browser-use-sdk` found no PyPI
  distribution before the change, confirming the PyPI name was available.
- `pnpm --filter open-browser-use-sdk test`
- `npm pack --dry-run --json` from `packages/open-browser-use-js`
- `python -m unittest` from `packages/open-browser-use-python`
- Built the Python SDK sdist/wheel in a temporary virtual environment and
  installed the wheel into a second temporary virtual environment, then imported
  `open_browser_use`.
- `./scripts/check-action-pinning.sh`

### Files

- `.github/workflows/npm-publish.yml`
- `.github/workflows/pypi-publish.yml`
- `packages/open-browser-use-js/package.json`
- `packages/open-browser-use-js/README.md`
- `packages/open-browser-use-python/pyproject.toml`
- `packages/open-browser-use-python/README.md`
- `README.md`
- `README.zh-CN.md`
- `docs/ARCHITECTURE.md`
- `docs/CICD.md`
- `docs/SUPPLY_CHAIN_SECURITY.md`
- `skills/open-browser-use/references/sdk-and-protocol.md`
