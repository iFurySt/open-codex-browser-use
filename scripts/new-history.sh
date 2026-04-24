#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "用法: $0 <task-slug>" >&2
  exit 1
fi

slug="$1"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
month_dir="${repo_root}/docs/histories/$(date +%Y-%m)"
timestamp="$(date +%Y%m%d-%H%M)"
target="${month_dir}/${timestamp}-${slug}.md"

mkdir -p "${month_dir}"
cp "${repo_root}/docs/histories/template.md" "${target}"

echo "${target}"
