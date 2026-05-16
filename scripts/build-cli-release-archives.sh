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
  "windows/amd64"
  "windows/arm64"
)

tar_supports_gnu_flags=false
if tar --version 2>/dev/null | grep -q "GNU tar"; then
  tar_supports_gnu_flags=true
fi

for target in "${targets[@]}"; do
  goos="${target%/*}"
  goarch="${target#*/}"
  artifact="open-browser-use-cli-${version}-${goos}-${goarch}.tar.gz"
  output_name="open-browser-use"
  if [ "${goos}" = "windows" ]; then
    artifact="open-browser-use-cli-${version}-${goos}-${goarch}.zip"
    output_name="open-browser-use.exe"
  fi
  work_dir="$(mktemp -d)"
  trap 'rm -rf "${work_dir}"' EXIT

  (
    cd "${repo_root}"
    CGO_ENABLED=0 GOOS="${goos}" GOARCH="${goarch}" \
      go build -trimpath -ldflags="-s -w" -o "${work_dir}/${output_name}" ./cmd/open-browser-use
  )

  if [ "${goos}" = "windows" ]; then
    (
      cd "${work_dir}"
      zip -q -X "${output_dir}/${artifact}" "${output_name}"
    )
  elif [ "${tar_supports_gnu_flags}" = true ]; then
    tar \
      --sort=name \
      --mtime="UTC 1970-01-01" \
      --owner=0 \
      --group=0 \
      --numeric-owner \
      -czf "${output_dir}/${artifact}" \
      -C "${work_dir}" \
      "${output_name}"
  else
    COPYFILE_DISABLE=1 tar -czf "${output_dir}/${artifact}" -C "${work_dir}" "${output_name}"
  fi

  rm -rf "${work_dir}"
  trap - EXIT
done
