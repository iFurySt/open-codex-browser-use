#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

required_files=(
  "AGENTS.md"
  "README.md"
  "CONTRIBUTING.md"
  "docs/REPO_COLLAB_GUIDE.md"
  "docs/HISTORY_GUIDE.md"
  "docs/PLANS_GUIDE.md"
  "docs/ARCHITECTURE.md"
  "docs/CICD.md"
  "docs/DESIGN.md"
  "docs/PRODUCT_SENSE.md"
  "docs/QUALITY_SCORE.md"
  "docs/RELIABILITY.md"
  "docs/SECURITY.md"
  "docs/SUPPLY_CHAIN_SECURITY.md"
  "docs/design-docs/core-beliefs.md"
  "docs/design-docs/index.md"
  "docs/product-specs/index.md"
  "docs/references/README.md"
  "docs/generated/README.md"
  "docs/exec-plans/templates/execution-plan.md"
  "docs/exec-plans/tech-debt-tracker.md"
  "docs/histories/template.md"
  "docs/releases/feature-release-notes.md"
)

missing=0

for path in "${required_files[@]}"; do
  if [[ ! -f "${repo_root}/${path}" ]]; then
    echo "缺少必要文件: ${path}"
    missing=1
  fi
done

for dir in docs/exec-plans/active docs/exec-plans/completed docs/histories; do
  if [[ ! -d "${repo_root}/${dir}" ]]; then
    echo "缺少必要目录: ${dir}"
    missing=1
  fi
done

if ! grep -q "docs/" "${repo_root}/AGENTS.md"; then
  echo "AGENTS.md 应明确指向 docs/，说明它是仓库知识的正式来源"
  missing=1
fi

if [[ "${missing}" -ne 0 ]]; then
  exit 1
fi

echo "文档骨架检查通过"
