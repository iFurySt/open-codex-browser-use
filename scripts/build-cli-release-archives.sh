#!/usr/bin/env bash

set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "usage: $0 <version> <output-dir>" >&2
  exit 1
fi

version="$1"
output_dir="$2"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

mkdir -p "${output_dir}"

targets=(
  "darwin/amd64"
  "darwin/arm64"
  "linux/amd64"
  "linux/arm64"
)

tar_supports_gnu_flags=false
if tar --version 2>/dev/null | grep -q "GNU tar"; then
  tar_supports_gnu_flags=true
fi

for target in "${targets[@]}"; do
  goos="${target%/*}"
  goarch="${target#*/}"
  artifact="open-browser-use-cli-${version}-${goos}-${goarch}.tar.gz"
  work_dir="$(mktemp -d)"
  trap 'rm -rf "${work_dir}"' EXIT

  (
    cd "${repo_root}"
    CGO_ENABLED=0 GOOS="${goos}" GOARCH="${goarch}" \
      go build -trimpath -ldflags="-s -w" -o "${work_dir}/open-browser-use" ./cmd/open-browser-use
  )

  if [ "${tar_supports_gnu_flags}" = true ]; then
    tar \
      --sort=name \
      --mtime="UTC 1970-01-01" \
      --owner=0 \
      --group=0 \
      --numeric-owner \
      -czf "${output_dir}/${artifact}" \
      -C "${work_dir}" \
      open-browser-use
  else
    COPYFILE_DISABLE=1 tar -czf "${output_dir}/${artifact}" -C "${work_dir}" open-browser-use
  fi

  rm -rf "${work_dir}"
  trap - EXIT
done
