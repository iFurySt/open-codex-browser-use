#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
dist_dir="${repo_root}/dist"

rm -rf "${dist_dir}"
mkdir -p "${dist_dir}"

chrome_extension_zip="$("${repo_root}/scripts/package-chrome-extension.sh")"
chrome_extension_artifact="$(basename "${chrome_extension_zip}")"
chrome_extension_crx="$(find "${repo_root}/dist/chrome-extension" -maxdepth 1 -type f -name '*.crx' -print -quit)"
chrome_extension_crx_artifact="$(basename "${chrome_extension_crx}")"

cat > "${dist_dir}/release-manifest.json" <<EOF
{
  "repository": "${GITHUB_REPOSITORY:-local}",
  "git_sha": "${GITHUB_SHA:-$(git -C "${repo_root}" rev-parse HEAD 2>/dev/null || echo unknown)}",
  "generated_at_utc": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "artifacts": {
    "repo_metadata": "repo-metadata.tgz",
    "chrome_extension": "chrome-extension/${chrome_extension_artifact}",
    "chrome_extension_installable": "chrome-extension/${chrome_extension_crx_artifact}"
  }
}
EOF

tar -czf "${dist_dir}/repo-metadata.tgz" \
  -C "${repo_root}" \
  AGENTS.md README.md CONTRIBUTING.md LICENSE docs scripts .github Makefile

echo "${dist_dir}/repo-metadata.tgz"
echo "${chrome_extension_zip}"
