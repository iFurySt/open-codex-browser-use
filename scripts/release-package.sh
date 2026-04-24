#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
dist_dir="${repo_root}/dist"

rm -rf "${dist_dir}"
mkdir -p "${dist_dir}"

cat > "${dist_dir}/release-manifest.json" <<EOF
{
  "repository": "${GITHUB_REPOSITORY:-local}",
  "git_sha": "${GITHUB_SHA:-$(git -C "${repo_root}" rev-parse HEAD 2>/dev/null || echo unknown)}",
  "generated_at_utc": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "artifact": "repo-metadata.tgz",
  "note": "Replace scripts/release-package.sh with the real project build packaging when the stack is known."
}
EOF

tar -czf "${dist_dir}/repo-metadata.tgz" \
  -C "${repo_root}" \
  AGENTS.md README.md CONTRIBUTING.md LICENSE docs scripts .github Makefile

echo "${dist_dir}/repo-metadata.tgz"
