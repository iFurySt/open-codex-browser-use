#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

"${repo_root}/scripts/check-docs.sh"
"${repo_root}/scripts/check-repo-hygiene.sh"
"${repo_root}/scripts/check-action-pinning.sh"
node "${repo_root}/scripts/generate-chrome-extension-icons.mjs"
"${repo_root}/scripts/package-chrome-extension.sh" >/dev/null
(
  cd "${repo_root}"
  go test ./...
  pnpm -r --if-present test
)
(
  cd "${repo_root}/packages/open-browser-use-python"
  python -m unittest
)
node --check "${repo_root}/scripts/chrome-web-store-oauth.mjs"
node --check "${repo_root}/scripts/generate-chrome-extension-icons.mjs"
node --check "${repo_root}/scripts/publish-chrome-web-store.mjs"

while IFS= read -r file; do
  bash -n "$file"
done < <(find "${repo_root}/scripts" -type f -name '*.sh' | sort)

echo "基础 CI 检查通过"
