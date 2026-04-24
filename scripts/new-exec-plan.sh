#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "用法: $0 <plan-slug>" >&2
  exit 1
fi

slug="$1"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
date_prefix="$(date +%Y-%m-%d)"
target="${repo_root}/docs/exec-plans/active/${date_prefix}-${slug}.md"

cp "${repo_root}/docs/exec-plans/templates/execution-plan.md" "${target}"

echo "${target}"
