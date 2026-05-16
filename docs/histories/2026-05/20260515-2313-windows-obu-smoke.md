## [2026-05-15 23:13] | Task: Windows OBU smoke

### 🤖 Execution Context

- **Agent ID**: `Codex`
- **Base Model**: `GPT-5`
- **Runtime**: `Codex CLI`

### 📥 User Query

> 在 Windows 机器上打包上传并验证 OBU 可用；发现问题就直接修。

### 🛠 Changes Overview

**Scope:** Windows CLI/native host setup, profile detection, smoke verification, and release packaging.

**Key Actions:**

- **[Windows setup]**: Added Windows native manifest, stable exe copy, registry setup, Chrome/Chrome Beta profile roots, unpacked extension path, and Chrome page opener support.
- **[Native launch]**: Treated Windows `--parent-window=<handle>` native messaging launches as host mode, in addition to `chrome-extension://...` origins.
- **[Socket dir]**: Moved the default socket directory to `os.TempDir()` so Windows uses `%TEMP%\open-browser-use`.
- **[Smoke tool]**: Added a Windows host smoke helper that simulates the Chrome native messaging peer and verifies the real exe, AF_UNIX socket, and frame relay on Windows.
- **[Real Chrome]**: Verified the Windows Chrome Web Store install route on a real Windows host: `info`, `name-session`, `user-tabs`, `open-tab`, `wait-load`, `page-info`, and `finalize-tabs` all succeeded against Chrome.
- **[Release packaging]**: Added Windows `amd64`/`arm64` CLI zip artifacts to the release bundle, documented npm as the cross-platform install path, and bumped the release version to `0.1.37`.

### 🧠 Design Intent (Why)

Windows native messaging uses registry discovery and does not reliably support the same symlink/executable-bit assumptions as macOS/Linux. The CLI now installs per-user registry entries and copies the selected target to a stable exe path. Windows Chrome may launch native hosts with `--parent-window` instead of an origin argv, so host-mode detection needs to recognize that shape before Cobra parses arguments.

The Windows smoke also showed that this Google Chrome build ignores command-line
`--load-extension`, so the browser-level verification used the Chrome Web Store
extension id plus registry-based external install rather than an unpacked
command-line extension.

For installation, npm is now the primary cross-platform path because the package
already dispatches to per-platform native binaries and works on Windows without
requiring Homebrew. GitHub Release zip artifacts are kept as a direct download
fallback for Windows environments where npm is unavailable.

### 📁 Files Modified

- `cmd/open-browser-use/main.go`
- `cmd/open-browser-use/main_test.go`
- `internal/host/relay.go`
- `packages/open-browser-use-cli/cli/postinstall.js`
- `packages/open-browser-use-cli/README.md`
- `scripts/build-cli-release-archives.sh`
- `scripts/release-package.sh`
- `scripts/windows-host-smoke/main.go`
- `.github/workflows/release.yml`
- `README.md`
- `README.zh-CN.md`
- `docs/ARCHITECTURE.md`
- `docs/CHROME_WEB_STORE_RELEASE.md`
- `docs/releases/feature-release-notes.md`
